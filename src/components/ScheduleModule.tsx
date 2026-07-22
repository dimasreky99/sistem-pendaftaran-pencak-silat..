import React, { useState, useMemo, useEffect } from "react";
import { 
  Calendar, Award, Printer, Search, Filter, RefreshCw, Trophy, 
  CheckCircle2, AlertCircle, Sparkles, User, HelpCircle, ChevronRight,
  Sunrise, Sun, Moon, Layers, Settings, Check
} from "lucide-react";
import { Athlete, Competitor, MatchNode } from "../types";

// Helpers for weigh-in disqualification auto-losses
const isCompetitorDisqualified = (comp: Competitor | null | undefined, athletesList: Athlete[]) => {
  if (!comp || comp.isBye || comp.isPlaceholder) return false;
  const found = athletesList.find(
    a => a.name.toLowerCase().trim() === comp.nama.toLowerCase().trim() &&
         a.kontingen.toLowerCase().trim() === comp.kontingen.toLowerCase().trim()
  );
  return found ? (!!found.statusTimbang && found.statusTimbang !== "PAS" && found.statusTimbang !== "BELUM") : false;
};

const getCompetitorWeighInStatus = (comp: Competitor | null | undefined, athletesList: Athlete[]) => {
  if (!comp || comp.isBye || comp.isPlaceholder) return null;
  const found = athletesList.find(
    a => a.name.toLowerCase().trim() === comp.nama.toLowerCase().trim() &&
         a.kontingen.toLowerCase().trim() === comp.kontingen.toLowerCase().trim()
  );
  return found ? (found.statusTimbang || "BELUM") : null;
};

const propagateWinnerLocal = (
  round: number, 
  matchIdx: number, 
  winnerComp: Competitor | undefined, 
  matches: Record<number, MatchNode[]>, 
  roundsCount: number
) => {
  const nextRound = round + 1;
  if (nextRound > roundsCount) return;

  const nextMatchIdx = Math.floor(matchIdx / 2);
  const playerSlot = matchIdx % 2 === 0 ? "p1" : "p2";
  
  if (!matches[nextRound]) {
    matches[nextRound] = [];
  }
  const nextMatch = matches[nextRound][nextMatchIdx];
  if (!nextMatch) return;

  const prevSlotComp = nextMatch[playerSlot];
  nextMatch[playerSlot] = winnerComp || null;

  if (winnerComp?.nama !== prevSlotComp?.nama) {
    nextMatch.score1 = undefined;
    nextMatch.score2 = undefined;
    const prevWinner = nextMatch.winner;
    nextMatch.winner = undefined;
    if (prevWinner) {
      propagateWinnerLocal(nextRound, nextMatchIdx, undefined, matches, roundsCount);
    }
  }
};

const autoResolveBracketLocal = (bracketData: any, athletesList: Athlete[]) => {
  if (!bracketData || !bracketData.matches) return bracketData;
  
  const matches = bracketData.matches;
  const roundsCount = bracketData.roundsCount;

  for (let r = 1; r <= roundsCount; r++) {
    const roundMatches = matches[r] || [];
    for (let mIdx = 0; mIdx < roundMatches.length; mIdx++) {
      const match = roundMatches[mIdx];
      if (!match) continue;

      const p1Disq = isCompetitorDisqualified(match.p1, athletesList);
      const p2Disq = isCompetitorDisqualified(match.p2, athletesList);

      if (p1Disq || p2Disq) {
        let newWinner: Competitor | undefined = undefined;
        let score1: number | undefined = undefined;
        let score2: number | undefined = undefined;

        if (p1Disq && !p2Disq && match.p2 && !match.p2.isPlaceholder && !match.p2.isBye) {
          newWinner = match.p2;
          score2 = 1;
        } else if (p2Disq && !p1Disq && match.p1 && !match.p1.isPlaceholder && !match.p1.isBye) {
          newWinner = match.p1;
          score1 = 1;
        }

        if (match.winner?.nama !== newWinner?.nama) {
          match.winner = newWinner;
          match.score1 = score1;
          match.score2 = score2;
          propagateWinnerLocal(r, mIdx, newWinner, matches, roundsCount);
        }
      }
    }
  }

  let currentFinalWinner: Competitor | null = null;
  const finalRoundMatches = matches[roundsCount] || [];
  if (finalRoundMatches[0]?.winner) {
    currentFinalWinner = finalRoundMatches[0].winner;
  }
  bracketData.winner = currentFinalWinner;

  return bracketData;
};

const autoResolveAllBracketsLocal = (athletesList: Athlete[]) => {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("silat_bracket_")) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const bracketData = JSON.parse(saved);
          const updatedData = autoResolveBracketLocal(bracketData, athletesList);
          localStorage.setItem(key, JSON.stringify(updatedData));
        } catch (e) {
          console.error("Error parsing bracket key", key, e);
        }
      }
    }
  }
};

interface ScheduleModuleProps {
  athletes: Athlete[];
  userRole: "admin" | "kontingen";
}

interface ScheduledMatch {
  partaiNum: number;
  className: string;
  round: number;
  matchIndex: number;
  p1: Competitor | null;
  p2: Competitor | null;
  score1?: number;
  score2?: number;
  winner?: Competitor;
  roundName: string;
  totalParticipants: number;
  phase: number; // 1 = Penyisihan, 2 = Semifinal, 3 = Final
  roundsCount: number;
  feeder1Partai?: number;
  feeder2Partai?: number;
}

export default function ScheduleModule({ athletes, userRole }: ScheduleModuleProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL"); // ALL, WAIT, DONE
  const [selectedClassFilter, setSelectedClassFilter] = useState("ALL");
  const [isPrinting, setIsPrinting] = useState(false);
  const [printScale, setPrintScale] = useState(100);

  // Editable print settings
  const [printDayDate, setPrintDayDate] = useState(() => {
    return new Date().toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  });
  const [printTimeRange, setPrintTimeRange] = useState("13:00 - 17:00");
  const [printGelanggang, setPrintGelanggang] = useState("");

  // Gelanggang system state (1, 2, or 3)
  const [totalGelanggang, setTotalGelanggang] = useState<number>(() => {
    const saved = localStorage.getItem("silat_schedule_gelanggang");
    return saved ? parseInt(saved) : 1;
  });

  const [selectedGelanggang, setSelectedGelanggang] = useState<string>("ALL"); // ALL, 1, 2, 3

  // Session limits state






  const [selectedSession, setSelectedSession] = useState<string>("ALL"); // ALL, PAGI, SIANG, MALAM

  const [selectedDay, setSelectedDay] = useState<string>("ALL"); // ALL, 1, 2, 3...

  const [customDayDates, setCustomDayDates] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem("silat_schedule_custom_dates");
    return saved ? JSON.parse(saved) : {};
  });

  const [manualGelanggang, setManualGelanggang] = useState<Record<number, number>>(() => {
    const saved = localStorage.getItem("silat_manual_gelanggang");
    return saved ? JSON.parse(saved) : {};
  });

  const [dailyLimits, setDailyLimits] = useState<Record<number, { pagi: number; siang: number; malam: number; }>>(() => {
    const saved = localStorage.getItem("silat_schedule_daily_limits");
    return saved ? JSON.parse(saved) : {};
  });
  
  useEffect(() => {
    localStorage.setItem("silat_schedule_daily_limits", JSON.stringify(dailyLimits));
  }, [dailyLimits]);
  const [manualOverrides, setManualOverrides] = useState<Record<string, { partaiNum?: number, session?: string, dayNum?: number }>>(() => {
    const saved = localStorage.getItem("silat_manual_overrides");
    return saved ? JSON.parse(saved) : {};
  });



  // Persist overrides and daily limits
  useEffect(() => {
    localStorage.setItem("silat_manual_overrides", JSON.stringify(manualOverrides));
  }, [manualOverrides]);



  // Persist Gelanggang and Session configs
  useEffect(() => {
    localStorage.setItem("silat_schedule_gelanggang", totalGelanggang.toString());
  }, [totalGelanggang]);







  useEffect(() => {
    localStorage.setItem("silat_schedule_custom_dates", JSON.stringify(customDayDates));
  }, [customDayDates]);

  useEffect(() => {
    localStorage.setItem("silat_manual_gelanggang", JSON.stringify(manualGelanggang));
  }, [manualGelanggang]);

  // Sync printGelanggang and printTimeRange whenever selectedGelanggang/selectedSession change
  useEffect(() => {
    setPrintGelanggang(selectedGelanggang !== "ALL" ? `GELANGGANG – ${selectedGelanggang}` : "GELANGGANG – 2");
  }, [selectedGelanggang]);

  useEffect(() => {
    setPrintTimeRange(
      selectedSession === "PAGI" ? "08:00 - 12:00" :
      selectedSession === "SIANG" ? "13:00 - 17:00" :
      selectedSession === "MALAM" ? "19:00 - 22:00" : "13:00 - 17:00"
    );
  }, [selectedSession]);

  // Read Event Title and Logo from local storage
  const settings = useMemo(() => {
    const savedSettings = localStorage.getItem("silat_settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return {
          eventTitle: parsed.eventTitle || "KEJUARAAN PENCAK SILAT NASIONAL",
          logoUrl: parsed.logoUrl || "",
          eventStartDate: parsed.eventStartDate || "2026-07-20"
        };
      } catch (e) {}
    }
    return { eventTitle: "KEJUARAAN PENCAK SILAT NASIONAL", logoUrl: "", eventStartDate: "2026-07-20" };
  }, [refreshKey]);

  const eventTitle = settings.eventTitle;

  // Helper functions for class sorting (matching brackets logic)
  const getCategoryWeight = (classStr: string) => {
    const upper = classStr.toUpperCase();
    if (upper.includes("PRA REMAJA")) return 2;
    if (upper.includes("UD") || upper.includes("USIA DINI")) return 1;
    if (upper.includes("REMAJA")) return 3;
    if (upper.includes("DEWASA")) return 4;
    if (upper.includes("MASTER")) return 5;
    return 6;
  };

  const getGenderWeight = (classStr: string) => {
    if (classStr.includes("Putra")) return 1;
    if (classStr.includes("Putri")) return 2;
    return 3;
  };

  const getClassLetterWeight = (classStr: string) => {
    const match = classStr.match(/KELAS\s+([A-Z])/i);
    if (match) {
      return match[1].charCodeAt(0);
    }
    return 999;
  };

  // Helper to format class name as: PRESTASI/PEMASALAN - KATEGORI - PA/PI - KELAS
  const formatClassName = (className: string) => {
    const parts = className.split(" - ");
    if (parts.length < 3) return className.toUpperCase();

    const kategori = parts[0];
    const gender = parts[1] === "Putra" ? "PA" : parts[1] === "Putri" ? "PI" : parts[1];
    let rawClass = parts[2];

    let division = "PRESTASI";
    if (rawClass.toUpperCase().startsWith("PEMASALAN | ")) {
      division = "PEMASALAN";
      rawClass = rawClass.substring(12);
    } else if (rawClass.toUpperCase().startsWith("PRESTASI | ")) {
      division = "PRESTASI";
      rawClass = rawClass.substring(11);
    }

    // Clean weight nominal details robustly
    let classCleaned = rawClass
      .replace(/\[[^\]]*(?:kg|weight|berat|under|over)[^\]]*\]/gi, "")
      .replace(/\([^)]*(?:kg|weight|berat|under|over)[^)]*\)/gi, "")
      .replace(/:\s*\d+(?:\s*-\s*\d+)?\s*kg/gi, "")
      .replace(/\d+(?:\s*-\s*\d+)?\s*kg/gi, "")
      .replace(/:\s*under\s*\d+/gi, "")
      .replace(/:\s*over\s*\d+/gi, "")
      .replace(/under\s*\d+/gi, "")
      .replace(/over\s*\d+/gi, "")
      
      
      .replace(/\(/g, "")
      .replace(/\)/g, "")
      .trim();
    classCleaned = classCleaned.replace(/[-\s,|:]+$/g, "").trim();

    return `${division} - ${kategori.toUpperCase()} - ${gender.toUpperCase()} - ${classCleaned.toUpperCase()}`;
  };

  // Helper to parse class and gender for table presentation (similar to PDF layout)
  const getShortClassAndGender = (className: string) => {
    let division = "PRESTASI";
    if (className.toUpperCase().includes("PEMASALAN")) {
      division = "PEMASALAN";
    }

    const parts = className.split(" - ");
    const categoryRaw = parts[0] || "";
    const gender = parts[1] || "";
    let rawClass = parts[2] || "";

    if (rawClass.toUpperCase().startsWith("PEMASALAN | ")) {
      rawClass = rawClass.substring(12);
    } else if (rawClass.toUpperCase().startsWith("PRESTASI | ")) {
      rawClass = rawClass.substring(11);
    }

    let isSeni = /tunggal|ganda|beregu|jurus/i.test(rawClass);
    
    // Remove weight info
    let classCleaned = rawClass
      .replace(/\[[^\]]*(?:kg|weight|berat|under|over)[^\]]*\]/gi, "")
      .replace(/\([^)]*(?:kg|weight|berat|under|over)[^)]*\)/gi, "")
      .replace(/:\s*\d+(?:\s*-\s*\d+)?\s*kg/gi, "")
      .replace(/\d+(?:\s*-\s*\d+)?\s*kg/gi, "")
      .replace(/:\s*under\s*\d+/gi, "")
      .replace(/:\s*over\s*\d+/gi, "")
      .replace(/\(/g, "")
      .replace(/\)/g, "")
      .trim();

    // Remove "Kelas" word
    classCleaned = classCleaned.replace(/kelas\s*/i, "").trim();

    // Map category
    let catShort = "DEW";
    if (/pra remaja/i.test(categoryRaw)) {
      catShort = "PRA";
    } else if (/usia dini/i.test(categoryRaw)) {
      catShort = "DINI";
    } else if (/remaja/i.test(categoryRaw)) {
      catShort = "REM";
    } else if (/dewasa/i.test(categoryRaw)) {
      catShort = "DEW";
    } else if (/master/i.test(categoryRaw)) {
      catShort = "MAS";
    }

    let gShort = gender.toUpperCase() === "PUTRA" ? "PA" : "PI";
    
    return {
      line1: division.toUpperCase(),
      line2: `${classCleaned} ${catShort} ${gShort}`.trim().toUpperCase(),
      isSeni
    };
  };

  // 1. Count isAcc athletes per class to find active classes
  const classCounts = useMemo(() => {
    const classMap: Record<string, number> = {};
    athletes.forEach(a => {
      if (a.isAcc) {
        const cleanClass = a.kelas.replace(/ \[(?:Aktual|Validasi|Revisi):.*?\]/g, "");
        const key = `${a.kategori} - ${a.jk} - ${cleanClass}`;
        classMap[key] = (classMap[key] || 0) + 1;
      }
    });
    return classMap;
  }, [athletes, refreshKey]);

  // 2. Sort classes hierarchically
  const sortedClasses = useMemo(() => {
    return Object.keys(classCounts)
      .filter(key => classCounts[key] >= 2)
      .sort((a, b) => {
        // Sort by participant count DESC
        const countDiff = classCounts[b] - classCounts[a];
        if (countDiff !== 0) return countDiff;

        // If equal, sort by category
        const catA = getCategoryWeight(a);
        const catB = getCategoryWeight(b);
        if (catA !== catB) return catA - catB;

        // Gender
        const genA = getGenderWeight(a);
        const genB = getGenderWeight(b);
        if (genA !== genB) return genA - genB;

        // Class letter
        const letA = getClassLetterWeight(a);
        const letB = getClassLetterWeight(b);
        if (letA !== letB) return letA - letB;

        return a.localeCompare(b);
      });
  }, [classCounts]);

  // 3. Build scheduled matches list based on sorted classes & saved brackets
  const { allScheduledMatches, stats } = useMemo(() => {
    // Run auto-resolve on brackets for weigh-in disqualifications
    autoResolveAllBracketsLocal(athletes);

    const unsortedMatches: ScheduledMatch[] = [];

    // Gather all valid non-bye matches
    sortedClasses.forEach(className => {
      const bracketKey = "silat_bracket_" + className;
      const saved = localStorage.getItem(bracketKey);
      if (!saved) return;

      let bracketData;
      try {
        bracketData = JSON.parse(saved);
      } catch (e) {
        return;
      }

      if (!bracketData || !bracketData.matches) return;
      const roundsCount = bracketData.roundsCount;
      const totalParticipants = classCounts[className] || 0;

      for (let r = 1; r <= roundsCount; r++) {
        const roundMatches = bracketData.matches[r] || [];
        roundMatches.forEach((match: MatchNode, mIdx: number) => {
          const isBye = match.p1?.isBye || match.p2?.isBye;
          if (isBye) return;

          // Determine tournament phase: 1 = Penyisihan, 2 = Perempat Final, 3 = Semifinal, 4 = Final
          let phase = 1; // Penyisihan (roundsCount - r >= 3)
          const dist = roundsCount - r;
          if (dist === 0) {
            phase = 4; // Final
          } else if (dist === 1) {
            phase = 3; // Semifinal
          } else if (dist === 2) {
            phase = 2; // Perempat Final
          }

          unsortedMatches.push({
            partaiNum: 0, // Assigned after sorting
            className,
            round: r,
            matchIndex: mIdx,
            p1: match.p1,
            p2: match.p2,
            score1: match.score1,
            score2: match.score2,
            winner: match.winner,
            roundName: "", // Set after sorting
            totalParticipants,
            phase,
            roundsCount
          });
        });
      }
    });

    // Sort matches:
    // Rule 1: Phase (1 = Penyisihan, 2 = Perempat Final, 3 = Semifinal, 4 = Final)
    // Rule 2: Round index ascending (very important so earlier rounds are played before later rounds)
    // Rule 3: Match index ascending ("mengambil dari bagan paling atas dulu")
    // Rule 4: Participant count of their class DESC
    // Rule 5: Standard category weight/hierarchy ordering
    const classSortIndex = (cls: string) => sortedClasses.indexOf(cls);

    unsortedMatches.sort((a, b) => {
      // Phase first (Penyisihan, then Perempat Final, then Semifinal, then Final)
      if (a.phase !== b.phase) {
        return a.phase - b.phase;
      }

      // Round index ascending
      if (a.round !== b.round) {
        return a.round - b.round;
      }

      // Match index ascending ("mengambil dari bagan paling atas dulu")
      if (a.matchIndex !== b.matchIndex) {
        return a.matchIndex - b.matchIndex;
      }

      // Participant count descending
      if (b.totalParticipants !== a.totalParticipants) {
        return b.totalParticipants - a.totalParticipants;
      }

      // Group by class cleanly using predetermined weights
      const classIdxA = classSortIndex(a.className);
      const classIdxB = classSortIndex(b.className);
      if (classIdxA !== classIdxB) {
        return classIdxA - classIdxB;
      }

      return 0;
    });

    // Map sorted matches to Partai Numbers and human-readable Round Names
    const keyToPartaiMap: Record<string, number> = {};
    const finalMatches = unsortedMatches.map((m, index) => {
      const lookupKey = `${m.className}_${m.round}_${m.matchIndex}`;
      const defaultPartaiNum = index + 1;
      const override = manualOverrides[lookupKey]?.partaiNum;
      const partaiNum = override ?? defaultPartaiNum;
      
      let roundName = "PENYISIHAN";
      if (m.phase === 4) {
        roundName = "FINAL";
      } else if (m.phase === 3) {
        roundName = "SEMIFINAL";
      } else if (m.phase === 2) {
        roundName = "PEREMPAT FINAL";
      } else {
        roundName = "PENYISIHAN";
      }

      keyToPartaiMap[lookupKey] = partaiNum;

      return {
        ...m,
        partaiNum,
        roundName
      };
    });

    finalMatches.sort((a, b) => a.partaiNum - b.partaiNum);

    // Populate feeder matches
    finalMatches.forEach(m => {
      if (m.round > 1) {
        const f1Key = `${m.className}_${m.round - 1}_${m.matchIndex * 2}`;
        const f2Key = `${m.className}_${m.round - 1}_${m.matchIndex * 2 + 1}`;
        m.feeder1Partai = keyToPartaiMap[f1Key];
        m.feeder2Partai = keyToPartaiMap[f2Key];
      }
    });

    // Calculate overall stats
    const total = finalMatches.length;
    const completed = finalMatches.filter(m => m.winner !== undefined && m.winner !== null).length;
    const pending = total - completed;

    return { 
      allScheduledMatches: finalMatches,
      stats: { total, completed, pending }
    };
  }, [sortedClasses, classCounts, refreshKey, manualOverrides]);

  // Extract unique categories for filter
  const categoriesList = useMemo(() => {
    const cats = new Set<string>();
    allScheduledMatches.forEach(m => {
      const cat = m.className.split(" - ")[0];
      if (cat) cats.add(cat);
    });
    return Array.from(cats);
  }, [allScheduledMatches]);

  // Extract classes currently in schedule
  const classesRepresented = useMemo(() => {
    const list = new Set<string>();
    allScheduledMatches.forEach(m => {
      list.add(m.className);
    });
    return Array.from(list);
  }, [allScheduledMatches]);

  // Helper to determine Gelanggang
  const getGelanggang = (partaiNum: number) => {
    if (manualGelanggang[partaiNum]) {
      return manualGelanggang[partaiNum];
    }
    if (totalGelanggang === 1) return 1;
    if (totalGelanggang === 2) {
      return (partaiNum % 2 !== 0) ? 1 : 2;
    }
    if (totalGelanggang === 3) {
      const mod = partaiNum % 3;
      if (mod === 1) return 1;
      if (mod === 2) return 2;
      return 3;
    }
    return 1;
  };

  // Helper to determine Day Number
  const getMatchKey = (m: ScheduledMatch) => `${m.className}_${m.round}_${m.matchIndex}`;

  const getDayAndSessionCalc = (partaiNum: number) => {
    let remaining = partaiNum;
    let dayNum = 1;
    while (true) {
      const dayLim = dailyLimits[dayNum] || { pagi: autoSessionLimit, siang: autoSessionLimit, malam: autoSessionLimit };
      const dayTotal = dayLim.pagi + dayLim.siang + dayLim.malam;
      
      if (dayTotal <= 0) {
        dayNum++;
        if (dayNum > totalDays + 10) return { dayNum: 1, session: "PAGI", relNum: remaining }; // Fallback prevent infinite loop
        continue;
      }
      
      if (remaining <= dayTotal) {
        let session = "PAGI";
        if (remaining > dayLim.pagi) session = "SIANG";
        if (remaining > dayLim.pagi + dayLim.siang) session = "MALAM";
        return { dayNum, session, relNum: remaining };
      }
      remaining -= dayTotal;
      dayNum++;
    }
  };

  const getDayNumber = (m: ScheduledMatch | number) => {
    if (typeof m !== "number") {
      const matchKey = getMatchKey(m);
      if (manualOverrides[matchKey]?.dayNum) return manualOverrides[matchKey].dayNum!;
      return getDayAndSessionCalc(m.partaiNum).dayNum;
    }
    return getDayAndSessionCalc(m).dayNum;
  };

  const getSession = (m: ScheduledMatch | number) => {
    if (typeof m !== "number") {
      const matchKey = getMatchKey(m);
      if (manualOverrides[matchKey]?.session) return manualOverrides[matchKey].session!;
      return getDayAndSessionCalc(m.partaiNum).session;
    }
    return getDayAndSessionCalc(m).session;
  };

  const getRelativePartaiNum = (m: ScheduledMatch | number) => {
    if (typeof m !== "number") {
      const matchKey = getMatchKey(m);
      if (manualOverrides[matchKey]?.dayNum || manualOverrides[matchKey]?.session) return m.partaiNum;
      return getDayAndSessionCalc(m.partaiNum).relNum;
    }
    return getDayAndSessionCalc(m).relNum;
  };

  // Helper for dynamic total days based on settings
  const totalDays = useMemo(() => {
    if (settings.eventStartDate && settings.eventEndDate) {
      const start = new Date(settings.eventStartDate);
      const end = new Date(settings.eventEndDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays > 0 ? diffDays : 1;
    }
    return 1;
  }, [settings.eventStartDate, settings.eventEndDate]);
  
  // Auto-calculated limits based on total matches and total days
  const autoSessionLimit = useMemo(() => {
    if (stats.total <= 0) return 15;
    return Math.ceil(stats.total / (totalDays * 3));
  }, [stats.total, totalDays]);
  
  const limitPagi = autoSessionLimit;
  const limitSiang = autoSessionLimit;
  const limitMalam = autoSessionLimit;

  const getDefaultDateForDay = (dayNum: number) => {
    let date = new Date();
    if (settings.eventStartDate) {
      const parts = settings.eventStartDate.split("-");
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // 0-indexed
        const day = parseInt(parts[2], 10);
        date = new Date(year, month, day);
      }
    }
    date.setDate(date.getDate() + (dayNum - 1));
    return date.toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getDayDateString = (dayNum: number) => {
    return customDayDates[dayNum] || getDefaultDateForDay(dayNum);
  };

  useEffect(() => {
    if (selectedDay !== "ALL") {
      setPrintDayDate(getDayDateString(parseInt(selectedDay)));
    } else {
      setPrintDayDate(getDayDateString(1));
    }
  }, [selectedDay, customDayDates, totalDays]);

  // 4. Filter scheduled matches
  const filteredMatches = useMemo(() => {
    return allScheduledMatches.filter(m => {
      const mGelanggang = getGelanggang(m.partaiNum);
      const mSession = getSession(m.partaiNum);
      const mDay = getDayNumber(m.partaiNum);

      // Search Query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const p1Name = m.p1?.nama?.toLowerCase() || "";
        const p1Cont = m.p1?.kontingen?.toLowerCase() || "";
        const p2Name = m.p2?.nama?.toLowerCase() || "";
        const p2Cont = m.p2?.kontingen?.toLowerCase() || "";
        const clsFormatted = formatClassName(m.className).toLowerCase();
        const numStr = `partai ${m.partaiNum} #${m.partaiNum}`;

        const matchesQuery = 
          p1Name.includes(query) || 
          p1Cont.includes(query) || 
          p2Name.includes(query) || 
          p2Cont.includes(query) || 
          clsFormatted.includes(query) ||
          numStr.includes(query);

        if (!matchesQuery) return false;
      }

      // Category filter
      if (selectedCategory !== "ALL") {
        if (!m.className.startsWith(selectedCategory)) return false;
      }

      // Class detail filter
      if (selectedClassFilter !== "ALL") {
        if (m.className !== selectedClassFilter) return false;
      }

      // Status filter
      if (selectedStatus !== "ALL") {
        const isCompleted = m.winner !== undefined && m.winner !== null;
        if (selectedStatus === "DONE" && !isCompleted) return false;
        if (selectedStatus === "WAIT" && isCompleted) return false;
      }

      // Gelanggang filter
      if (selectedGelanggang !== "ALL") {
        if (mGelanggang.toString() !== selectedGelanggang) return false;
      }

      // Session filter
      if (selectedSession !== "ALL") {
        if (mSession !== selectedSession) return false;
      }

      // Day filter
      if (selectedDay !== "ALL") {
        if (mDay.toString() !== selectedDay) return false;
      }

      return true;
    });
  }, [allScheduledMatches, searchQuery, selectedCategory, selectedClassFilter, selectedStatus, selectedGelanggang, selectedSession, selectedDay, totalGelanggang, limitPagi, limitSiang, limitMalam, manualGelanggang]);

  // Propagation logic to advance competitors in brackets
  const propagateWinner = (
    round: number, 
    matchIdx: number, 
    winnerComp: Competitor | undefined, 
    updatedMatches: Record<number, MatchNode[]>, 
    roundsCount: number
  ) => {
    const nextRound = round + 1;
    if (nextRound > roundsCount) {
      return;
    }

    const nextMatchIdx = Math.floor(matchIdx / 2);
    const playerSlot = matchIdx % 2 === 0 ? "p1" : "p2";
    
    if (!updatedMatches[nextRound]) {
      updatedMatches[nextRound] = [];
    }

    const nextMatch = updatedMatches[nextRound][nextMatchIdx];
    if (!nextMatch) return;

    const prevSlotComp = nextMatch[playerSlot];
    nextMatch[playerSlot] = winnerComp || null;

    // Reset scores & winner of next match if competitor changes
    if (winnerComp?.nama !== prevSlotComp?.nama) {
      nextMatch.score1 = undefined;
      nextMatch.score2 = undefined;
      const prevWinner = nextMatch.winner;
      nextMatch.winner = undefined;
      
      // Recursive reset down the tournament tree branches
      if (prevWinner) {
        propagateWinner(nextRound, nextMatchIdx, undefined, updatedMatches, roundsCount);
      }
    }
  };

  // Declare Winner handler
  const handleDeclareWinner = (m: ScheduledMatch, playerNum: 1 | 2) => {
    if (userRole !== "admin") {
      alert("Hanya Admin yang dapat meng-klik dan menentukan pemenang pertandingan.");
      return;
    }

    const competitor = playerNum === 1 ? m.p1 : m.p2;
    if (!competitor || competitor.isBye || competitor.isPlaceholder) {
      alert("Belum ada kompetitor siap bertanding di sudut ini.");
      return;
    }
    
    // 2-Step Verification for changes
    if (m.winner) {
      if (m.winner.nama === competitor.nama) {
        const confirmCancel = window.confirm(`Batalkan kemenangan ${competitor.nama}? Jadwal bagan di depannya akan direset.`);
        if (!confirmCancel) return;
      } else {
        const step1 = window.confirm(`Peringatan: Pemenang sudah ditentukan yaitu ${m.winner.nama}. Anda yakin ingin MENGUBAH pemenang menjadi ${competitor.nama}?`);
        if (!step1) return;
        const step2 = window.confirm(`Konfirmasi Langkah 2: Mengubah pemenang akan mereset jadwal bagan di depannya. Apakah Anda BENAR-BENAR yakin?`);
        if (!step2) return;
      }
    } else {
      const step1 = window.confirm(`Tetapkan ${competitor.nama} sebagai pemenang?`);
      if (!step1) return;
    }


    const bracketKey = "silat_bracket_" + m.className;
    const saved = localStorage.getItem(bracketKey);
    if (!saved) return;

    let bracketData;
    try {
      bracketData = JSON.parse(saved);
    } catch (e) {
      return;
    }

    const updatedMatches = bracketData.matches;
    const roundsCount = bracketData.roundsCount;
    const match = updatedMatches[m.round]?.[m.matchIndex];

    if (!match) return;

    let previousWinner = match.winner;
    let newWinner: Competitor | undefined = undefined;

    // Toggle: click again to clear
    if (previousWinner?.nama === competitor.nama) {
      newWinner = undefined;
    } else {
      newWinner = competitor;
    }

    match.winner = newWinner;
    match.score1 = newWinner === match.p1 ? 1 : undefined;
    match.score2 = newWinner === match.p2 ? 1 : undefined;

    // Propagate
    propagateWinner(m.round, m.matchIndex, newWinner, updatedMatches, roundsCount);

    // Set tournament absolute winner if final round is decided
    let currentFinalWinner: Competitor | null = null;
    const finalRoundMatches = updatedMatches[roundsCount] || [];
    if (finalRoundMatches[0]?.winner) {
      currentFinalWinner = finalRoundMatches[0].winner;
    }
    bracketData.winner = currentFinalWinner;

    // Save updated bracket state back
    localStorage.setItem(bracketKey, JSON.stringify(bracketData));

    // Force Schedule refresh
    setRefreshKey(prev => prev + 1);
  };


  const printArena = selectedGelanggang === "ALL" ? "SEMUA GELANGGANG" : selectedGelanggang;
  // Print trigger
  const handlePrint = () => {
    setIsPrinting(true);
  };

  const handleExportCsv = () => {
    const headers = ["PARTAI", "HARI", "SESI", "KONTINGEN MERAH", "NAMA MERAH", "NAMA BIRU", "KONTINGEN BIRU", "KELAS", "BABAK", "ARENA"];
    const rows = filteredMatches.map(m => {
      const getSession = (m: ScheduledMatch) => {
        const override = manualOverrides[`${m.className}_${m.round}_${m.matchIndex}`];
        if (override && override.session) return override.session;
        return getDayAndSessionCalc(m.partaiNum).session;
      };
      const getDayNumber = (m: ScheduledMatch) => {
        const override = manualOverrides[`${m.className}_${m.round}_${m.matchIndex}`];
        if (override && override.dayNum) return override.dayNum;
        return getDayAndSessionCalc(m.partaiNum).dayNum;
      };
      
      let redName = m.p1 ? m.p1.nama : `Pemenang Partai #${m.feeder1Partai}`;
      let redCont = m.p1 ? m.p1.kontingen : "-";
      let blueName = m.p2 ? m.p2.nama : `Pemenang Partai #${m.feeder2Partai}`;
      let blueCont = m.p2 ? m.p2.kontingen : "-";

      if (m.p1?.isPlaceholder) {
        redName = "Belum Diundi";
        redCont = "-";
      }
      if (m.p2?.isPlaceholder) {
        blueName = "Belum Diundi";
        blueCont = "-";
      }

      return [
        m.partaiNum,
        getDayNumber(m),
        getSession(m),
        redCont,
        redName,
        blueName,
        blueCont,
        m.className,
        m.roundName,
        m.arena || "2"
      ].map(x => `"${x}"`).join(",");
    });
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Jadwal_Pertandingan.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isPrinting) {
    const getEventHeaders = () => {
      return {
        line1: "PEKAN OLAHRAGA KABUPATEN",
        line2: eventTitle.toUpperCase(),
        line3: "CABOR PENCAK SILAT",
        line4: "IPSI KABUPATEN SIDOARJO"
      };
    };
    
    const headers = getEventHeaders();

    return (
      <div className="bg-white min-h-screen p-8 text-slate-900 font-sans">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm 10mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            header, aside, footer, nav, .print\:hidden, .no-print, button, select, input {
              display: none !important;
            }
            body, html, #root {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
              height: auto !important;
              min-height: 100% !important;
              overflow: visible !important;
            }
          }
        `}} />

        {/* PREVIEW CONFIGURATION PANEL - ONLY VISIBLE ON SCREEN */}
        <div className="mb-6 p-4 bg-slate-100 border-2 border-slate-300 rounded-xl print:hidden shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
            <div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>⚙️</span> Pengaturan Kertas & Jadwal Cetak (Pratinjau)
              </h2>
              <p className="text-[10px] text-rose-600 font-bold mt-1">Jika tombol tidak merespon, buka aplikasi di Tab Baru (Open in New Tab).</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportCsv}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs"
              >
                📊 Excel (CSV)
              </button>
              <button
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs"
              >
                🖨️ Cetak PDF / Print
              </button>
              <button
                onClick={() => setIsPrinting(false)}
                className="bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold px-4 py-1.5 rounded-lg transition-all text-xs"
              >
                Kembali
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">Hari & Tanggal</label>
              <input
                type="text"
                value={printDayDate}
                onChange={(e) => setPrintDayDate(e.target.value)}
                placeholder="Hari, Tanggal Bulan Tahun"
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">Jam / Waktu</label>
              <input
                type="text"
                value={printTimeRange}
                onChange={(e) => setPrintTimeRange(e.target.value)}
                placeholder="08:00 - 12:00"
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">Keterangan Gelanggang</label>
              <input
                type="text"
                value={printGelanggang}
                onChange={(e) => setPrintGelanggang(e.target.value)}
                placeholder="GELANGGANG - 2"
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic mt-2.5">
            * Silakan ganti teks di atas secara manual jika diperlukan. Panel abu-abu ini otomatis disembunyikan saat dicetak ke kertas/PDF.
          </p>
        </div>

        {/* KOP BANNER - MATCHING PDF STYLE OR CUSTOM LOGO */}
        {settings.logoUrl ? (
          <div className="w-full flex justify-center mb-5 print:hidden">
            <img
              src={settings.logoUrl}
              alt="KOP BANNER"
              className="w-full max-h-[160px] object-contain"
            />
          </div>
        ) : (
          <div className="bg-[#4d9b56] text-white p-5 rounded-xl flex items-center justify-between border border-slate-950 mb-5 relative">
            {/* Left Trophy/Shield Circle */}
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border border-slate-950 shadow-sm shrink-0">
              <Trophy className="text-[#4d9b56]" size={28} />
            </div>

            {/* Centered Typography */}
            <div className="text-center flex-1 px-4">
              <div className="text-[11px] font-black tracking-[0.15em] text-white/90 uppercase">
                {headers.line1}
              </div>
              <h1 className="text-xl font-black tracking-tight text-white uppercase my-0.5 leading-none">
                {headers.line2}
              </h1>
              <div className="text-[11px] font-black tracking-[0.15em] text-white/90 uppercase">
                {headers.line3}
              </div>
              <div className="text-[9px] font-bold text-white/80 uppercase tracking-widest mt-0.5">
                {headers.line4}
              </div>
            </div>

            {/* Right Award/Shield Circle */}
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border border-slate-950 shadow-sm shrink-0">
              <Award className="text-[#4d9b56]" size={28} />
            </div>
          </div>
        )}

        {/* THREE BADGES ROW - MATCHING PDF STYLE */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-white text-slate-900 font-extrabold text-center py-1.5 rounded-lg border border-slate-950 shadow-sm text-[10px] flex items-center justify-center uppercase">
            {selectedDay !== "ALL" ? `HARI ${selectedDay} – ${printDayDate}` : printDayDate}
          </div>
          <div className="bg-white text-slate-900 font-extrabold text-center py-1.5 rounded-lg border border-slate-950 shadow-sm text-[10px] flex items-center justify-center uppercase">
            {printTimeRange}
          </div>
          <div className="bg-white text-slate-900 font-extrabold text-center py-1.5 rounded-lg border border-slate-950 shadow-sm text-[10px] flex items-center justify-center uppercase">
            {printGelanggang}
          </div>
        </div>

        {/* PRINT TRIGGER BUTTONS FOR INTERACTION */}
        <div className="mb-4 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase print:hidden">
          <div>Menampilkan {filteredMatches.length} partai aktif <br/><span className="text-rose-500">(Buka tab baru jika tombol cetak tidak berfungsi)</span></div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg">Cetak</button>
            <button onClick={() => setIsPrinting(false)} className="bg-slate-200 text-slate-850 px-3 py-1.5 rounded-lg">Kembali</button>
          </div>
        </div>

        {/* PRINT TABLE - PERFECT PDF COPIER */}
        <table className="w-full border-collapse border-2 border-slate-950 text-[10px] font-sans">
          <thead>
            <tr className="border-b-2 border-slate-950 text-[10px] uppercase font-black tracking-wider">
              <th className="py-2.5 px-1 text-center bg-slate-100 border border-slate-400 text-slate-900 w-12 font-black">NO</th>
              <th className="py-2.5 px-1 text-center bg-slate-100 border border-slate-400 text-slate-900 w-16 font-black">PARTAI</th>
              <th className="py-2.5 px-1.5 text-center bg-slate-100 border border-slate-400 text-slate-900 w-28 font-black">KELAS</th>
              <th className="py-2.5 px-3 text-center bg-[#2b72cf] text-white border border-slate-400 w-1/3 font-black">SUDUT BIRU</th>
              <th className="py-2.5 px-3 text-center bg-[#d82424] text-white border border-slate-400 w-1/3 font-black">SUDUT MERAH</th>
              <th className="py-2.5 px-1 text-center bg-slate-100 border border-slate-400 text-slate-900 w-20 font-black">SKOR</th>
              <th className="py-2.5 px-1 text-center bg-slate-100 border border-slate-400 text-slate-900 w-24 font-black">BABAK</th>
            </tr>
          </thead>
          <tbody>
            {filteredMatches.map((m, index) => {
              const isFinished = m.winner !== undefined && m.winner !== null;
              
              let redName = m.p1 ? m.p1.nama : `Pemenang Partai #${m.feeder1Partai}`;
              let redCont = m.p1 ? m.p1.kontingen : "-";
              let blueName = m.p2 ? m.p2.nama : `Pemenang Partai #${m.feeder2Partai}`;
              let blueCont = m.p2 ? m.p2.kontingen : "-";

              if (m.p1?.isPlaceholder) {
                redName = "Belum Diundi";
                redCont = "-";
              }
              if (m.p2?.isPlaceholder) {
                blueName = "Belum Diundi";
                blueCont = "-";
              }

              const details = getShortClassAndGender(m.className);

              // Map round names like "SEMIFINAL" -> "Semi F", etc.
              let shortRoundName = m.roundName;
              if (m.roundName.toUpperCase() === "SEMIFINAL") {
                shortRoundName = "Semi F";
              } else if (m.roundName.toUpperCase() === "FINAL") {
                shortRoundName = "Final";
              } else if (m.roundName.toUpperCase() === "PEREMPAT FINAL") {
                shortRoundName = "Peremp F";
              }

              return (
                <tr key={m.partaiNum} className="border-b border-slate-300">
                  {/* NO */}
                  <td className="py-2 px-1 text-center font-bold text-slate-900 border border-slate-300 bg-slate-50">
                    {index + 1}
                  </td>
                  
                  {/* PARTAI */}
                  <td className="py-2 px-2 text-center font-extrabold text-slate-900 border border-slate-300">
                    {m.partaiNum}
                  </td>
                  
                  {/* KELAS */}
                  <td className="py-2.5 px-1.5 text-center border border-slate-300 bg-white text-slate-950 font-bold leading-tight">
                    <div className="text-[9px] font-black tracking-wide text-emerald-700 uppercase mb-0.5">
                      {details.line1}
                    </div>
                    <div className="font-extrabold text-[11px] text-slate-900 uppercase my-0.5">
                      {details.line2}
                    </div>
                    <div className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 inline-block px-1.5 rounded-sm ${details.isSeni ? "bg-indigo-100 text-indigo-700" : "bg-emerald-50 text-emerald-700"}`}>
                      {details.isSeni ? "Seni Jurus" : "Tanding"}
                    </div>
                  </td>
                  
                  {/* SUDUT BIRU */}
                  {(() => {
                    const blueStatus = getCompetitorWeighInStatus(m.p2, athletes);
                    return (
                      <td className={`py-2 px-3 border border-slate-300 bg-white text-center leading-normal ${m.winner?.nama === m.p2?.nama ? "bg-blue-50/20" : ""}`}>
                        <div className="font-black text-slate-950 uppercase tracking-tight text-[11px]">
                          {blueName}
                          {blueStatus && (blueStatus === "OVER" || blueStatus === "UNDER" || blueStatus === "BELUM") && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-rose-100 text-rose-700 uppercase ${blueStatus === "BELUM" ? "print:hidden" : ""}`}>
                              ({blueStatus === "BELUM" ? "BELUM TIMBANG" : "DISK TIMBANG"})
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] text-slate-600 font-bold italic mt-0.5">
                          {blueCont}
                        </div>
                      </td>
                    );
                  })()}
                  
                  {/* SUDUT MERAH */}
                  {(() => {
                    const redStatus = getCompetitorWeighInStatus(m.p1, athletes);
                    return (
                      <td className={`py-2 px-3 border border-slate-300 bg-white text-center leading-normal ${m.winner?.nama === m.p1?.nama ? "bg-rose-50/20" : ""}`}>
                        <div className="font-black text-slate-950 uppercase tracking-tight text-[11px]">
                          {redName}
                          {redStatus && (redStatus === "OVER" || redStatus === "UNDER" || redStatus === "BELUM") && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded text-[8px] font-black bg-rose-100 text-rose-700 uppercase ${redStatus === "BELUM" ? "print:hidden" : ""}`}>
                              ({redStatus === "BELUM" ? "BELUM TIMBANG" : "DISK TIMBANG"})
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] text-slate-600 font-bold italic mt-0.5">
                          {redCont}
                        </div>
                      </td>
                    );
                  })()}
                  
                  {/* SKOR */}
                  <td className="py-2 px-1 border border-slate-300 text-center font-black text-slate-950">
                    <div className="flex items-center justify-center gap-1.5 py-1">
                      <div className="w-5 h-5 border border-slate-400 bg-white flex items-center justify-center font-black text-[10px]">
                        {isFinished ? m.score2 ?? "" : ""}
                      </div>
                      <div className="w-5 h-5 border border-slate-400 bg-white flex items-center justify-center font-black text-[10px]">
                        {isFinished ? m.score1 ?? "" : ""}
                      </div>
                    </div>
                  </td>
                  
                  {/* BABAK */}
                  <td className="py-2 px-2 text-center border border-slate-300 font-black text-slate-800 uppercase text-[9px]">
                    <div className="font-extrabold">{shortRoundName}</div>
                    <div className="text-[8px] text-slate-500 font-semibold mt-1 tracking-tight">
                      GEL {getGelanggang(m.partaiNum)} • HARI {getDayNumber(m.partaiNum)} • {getSession(m.partaiNum)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ATTENTION NOTES - EXACTLY MATCHING THE PDF */}
        <div className="mt-6 border-t border-slate-300 pt-4 text-[10px] text-slate-800 leading-normal font-sans">
          <p className="font-black underline mb-1 uppercase tracking-wide text-[10.5px]">Perhatian untuk Official Team :</p>
          <ol className="list-decimal list-inside space-y-1 font-medium">
            <li>Diharap meneliti secara cermat jadwal Pertandingan diatas! Jika terdapat kesalahan, segera melaporkannya ke Sekretaris Pertandingan untuk dibenarkan sebagaimana mestinya.</li>
            <li>Diharap memeriksa kelengkapan pesilatnya yang akan bertanding (cap protector harus dipakai dalam celana dalam, Pesilat Putri dilarang memakai perhiasan/aksesories berbahaya, dan kuku harus dipotong pendek)!</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 shadow-md border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-3 py-1 text-[9px] font-black tracking-widest uppercase inline-block mb-1">
              🏆 {eventTitle}
            </span>
            <h1 className="text-2xl font-black uppercase tracking-tight">
              JADWAL PERTANDINGAN RESMI
            </h1>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Sistem klasifikasi pertandingan terstruktur. Menyelesaikan babak **Penyisihan** terlebih dahulu, dilanjutkan dengan **Semifinal**, dan diakhiri dengan babak perebutan juara **Final**.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/30 self-stretch md:self-auto justify-center"
          >
            <Printer size={16} />
            CETAK JADWAL RESMI
          </button>
        </div>

        {/* ADMIN CONFIGURATION PANEL FOR GELANGGANG & SESSIONS */}
        {userRole === "admin" && (
          <div className="border-t border-slate-800 pt-4 mt-2 space-y-4">
            <div className="bg-slate-900/50 rounded-2xl p-4.5 border border-slate-800">
              {/* Config 1: Arena System Selector */}
              <div className="space-y-2 mb-6">
                <label className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                  <Layers size={13} className="text-emerald-500" />
                  SISTEM ARENA / GELANGGANG
                </label>
                <div className="grid grid-cols-3 max-w-sm gap-2">
                  {[1, 2, 3].map((g) => (
                    <button
                      key={g}
                      onClick={() => setTotalGelanggang(g)}
                      className={`py-2 rounded-xl text-xs font-black transition-all border ${
                        totalGelanggang === g
                          ? "bg-emerald-600 text-white border-emerald-500"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {g} GELANGGANG
                    </button>
                  ))}
                </div>
              </div>

              {/* Multi-day date configuration */}
              <h4 className="text-[10px] font-black tracking-widest text-emerald-400 uppercase flex items-center gap-1.5 mb-2">
                <Calendar size={13} />
                PENGATURAN TANGGAL & KUOTA PARTAI ({totalDays} HARI)
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mb-4">
                Sesuaikan tanggal dan target jumlah partai (Pagi/Siang/Malam) untuk setiap harinya. Kosongkan kuota jika tidak ada jadwal.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
                {Array.from({ length: totalDays }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dayLim = dailyLimits[dayNum] || { pagi: autoSessionLimit, siang: autoSessionLimit, malam: autoSessionLimit };
                  return (
                    <div key={dayNum} className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-850">
                      <label className="block text-[9px] font-extrabold text-slate-400 uppercase">
                        HARI {dayNum}
                      </label>
                      <input
                        type="text"
                        value={getDayDateString(dayNum)}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomDayDates(prev => ({
                            ...prev,
                            [dayNum]: val
                          }));
                        }}
                        placeholder={`Hari ${dayNum}`}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 mb-2"
                      />
                      <div className="grid grid-cols-3 gap-1">
                        <div className="text-center">
                          <label className="block text-[8px] font-bold text-amber-500 mb-0.5">PAGI</label>
                          <input type="number" min={0} value={dayLim.pagi} onChange={e => {
                            const val = parseInt(e.target.value) || 0;
                            setDailyLimits(prev => ({ ...prev, [dayNum]: { ...dayLim, pagi: val } }));
                          }} className="w-full bg-slate-900 border border-slate-800 rounded px-1 py-1.5 text-xs text-center text-amber-400 font-bold" />
                        </div>
                        <div className="text-center">
                          <label className="block text-[8px] font-bold text-orange-500 mb-0.5">SIANG</label>
                          <input type="number" min={0} value={dayLim.siang} onChange={e => {
                            const val = parseInt(e.target.value) || 0;
                            setDailyLimits(prev => ({ ...prev, [dayNum]: { ...dayLim, siang: val } }));
                          }} className="w-full bg-slate-900 border border-slate-800 rounded px-1 py-1.5 text-xs text-center text-orange-400 font-bold" />
                        </div>
                        <div className="text-center">
                          <label className="block text-[8px] font-bold text-blue-500 mb-0.5">MALAM</label>
                          <input type="number" min={0} value={dayLim.malam} onChange={e => {
                            const val = parseInt(e.target.value) || 0;
                            setDailyLimits(prev => ({ ...prev, [dayNum]: { ...dayLim, malam: val } }));
                          }} className="w-full bg-slate-900 border border-slate-800 rounded px-1 py-1.5 text-xs text-center text-blue-400 font-bold" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Partai Terbentuk</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Calendar size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Partai Selesai</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{stats.completed}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">Partai Menunggu</div>
            <div className="text-2xl font-black text-sky-600 mt-1">{stats.pending}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
            <RefreshCw size={20} className="animate-spin" style={{ animationDuration: "12s" }} />
          </div>
        </div>
      </div>

      {/* FILTERS PANEL */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
        {/* Dynamic Gelanggang, Session & Day tabs */}
        <div className="flex flex-wrap gap-2.5 border-b border-slate-100 pb-4">
          {/* Day selectors */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-[11px] font-bold text-slate-600">
            <span className="px-2 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider">HARI:</span>
            <button
              onClick={() => setSelectedDay("ALL")}
              className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                selectedDay === "ALL" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
              }`}
            >
              Semua Hari
            </button>
            {Array.from({ length: totalDays }).map((_, idx) => {
              const num = idx + 1;
              return (
                <button
                  key={num}
                  onClick={() => setSelectedDay(num.toString())}
                  className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                    selectedDay === num.toString() ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
                  }`}
                >
                  Hari {num}
                </button>
              );
            })}
          </div>

          {/* Gelanggang selectors */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-[11px] font-bold text-slate-600">
            <span className="px-2 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider">GEL:</span>
            <button
              onClick={() => setSelectedGelanggang("ALL")}
              className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                selectedGelanggang === "ALL" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
              }`}
            >
              Semua
            </button>
            {Array.from({ length: totalGelanggang }).map((_, idx) => {
              const num = idx + 1;
              return (
                <button
                  key={num}
                  onClick={() => setSelectedGelanggang(num.toString())}
                  className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                    selectedGelanggang === num.toString() ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
                  }`}
                >
                  Gelanggang {num}
                </button>
              );
            })}
          </div>

          {/* Session selectors */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-[11px] font-bold text-slate-600">
            <span className="px-2 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider">SESI:</span>
            <button
              onClick={() => setSelectedSession("ALL")}
              className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                selectedSession === "ALL" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
              }`}
            >
              Semua Sesi
            </button>
            <button
              onClick={() => setSelectedSession("PAGI")}
              className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1 ${
                selectedSession === "PAGI" ? "bg-white text-amber-600 shadow-sm font-extrabold" : "hover:text-slate-900"
              }`}
            >
              <Sunrise size={13} />
              Pagi ({limitPagi})
            </button>
            <button
              onClick={() => setSelectedSession("SIANG")}
              className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1 ${
                selectedSession === "SIANG" ? "bg-white text-orange-600 shadow-sm font-extrabold" : "hover:text-slate-900"
              }`}
            >
              <Sun size={13} />
              Siang ({limitSiang})
            </button>
            <button
              onClick={() => setSelectedSession("MALAM")}
              className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1 ${
                selectedSession === "MALAM" ? "bg-white text-sky-600 shadow-sm font-extrabold" : "hover:text-slate-900"
              }`}
            >
              <Moon size={13} />
              Malam ({limitMalam})
            </button>
          </div>
        </div>

        {/* Dropdowns filters */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari atlet, kontingen, nomor partai..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-150 hover:border-slate-300 focus:border-slate-950 text-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs font-semibold transition-all focus:outline-none placeholder-slate-400"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-52 relative">
            <Filter size={14} className="absolute left-4 top-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedClassFilter("ALL"); // Reset
              }}
              className="w-full bg-slate-50 border border-slate-150 hover:border-slate-300 focus:border-slate-950 text-slate-700 rounded-2xl pl-10 pr-4 py-3.5 text-xs font-bold appearance-none focus:outline-none"
            >
              <option value="ALL">Semua Kategori</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Detailed Class Dropdown */}
          <div className="w-full md:w-64 relative">
            <Award size={14} className="absolute left-4 top-4 text-slate-400" />
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-150 hover:border-slate-300 focus:border-slate-950 text-slate-700 rounded-2xl pl-10 pr-4 py-3.5 text-xs font-bold appearance-none focus:outline-none"
            >
              <option value="ALL">Semua Kelas Spesifik</option>
              {classesRepresented
                .filter(cls => selectedCategory === "ALL" || cls.startsWith(selectedCategory))
                .map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="w-full md:w-44 relative">
            <Trophy size={14} className="absolute left-4 top-4 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-150 hover:border-slate-300 focus:border-slate-950 text-slate-700 rounded-2xl pl-10 pr-4 py-3.5 text-xs font-bold appearance-none focus:outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="WAIT">Belum Main</option>
              <option value="DONE">Selesai</option>
            </select>
          </div>
        </div>
      </div>

      {/* SCHEDULE LIST / TABLE */}
      {filteredMatches.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center mx-auto text-slate-300">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-extrabold text-slate-950 text-sm uppercase">Jadwal Pertandingan Kosong</h3>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Tidak ada partai pertandingan yang cocok dengan filter pencarian Anda, atau belum ada bagan yang disimpan oleh Admin.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
              Urutan Partai ({filteredMatches.length} Partai Cocok)
            </h3>
            {userRole === "admin" && (
              <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 uppercase">
                ⚡ MODE ADMIN: Klik nama sudut atlet untuk meng-ACC kemenangan
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {filteredMatches.map((m, index) => {
              const isFinished = m.winner !== undefined && m.winner !== null;
              const gelNum = getGelanggang(m.partaiNum);
              const mSession = getSession(m.partaiNum);

              // Competitor name resolutions
              let redName = m.p1 ? m.p1.nama : `Pemenang Partai #${m.feeder1Partai}`;
              let redCont = m.p1 ? m.p1.kontingen : "";
              let blueName = m.p2 ? m.p2.nama : `Pemenang Partai #${m.feeder2Partai}`;
              let blueCont = m.p2 ? m.p2.kontingen : "";

              const redStatus = getCompetitorWeighInStatus(m.p1, athletes);
              const blueStatus = getCompetitorWeighInStatus(m.p2, athletes);

              let redIsWaiting = !m.p1;
              let blueIsWaiting = !m.p2;

              if (m.p1?.isPlaceholder) {
                redName = "Belum Diundi";
                redCont = "Tunggu bagan diacak";
                redIsWaiting = true;
              }
              if (m.p2?.isPlaceholder) {
                blueName = "Belum Diundi";
                blueCont = "Tunggu bagan diacak";
                blueIsWaiting = true;
              }

              // Color coordinate Gelanggang badges
              const gelBadgeColor = 
                gelNum === 1 
                  ? "bg-slate-950 border-slate-800 text-slate-200" 
                  : gelNum === 2 
                    ? "bg-violet-950 border-violet-800 text-violet-200" 
                    : "bg-amber-950 border-amber-800 text-amber-200";

              // Session badge
              const sessionBadge = 
                mSession === "PAGI" 
                  ? { bg: "bg-amber-50 border-amber-200 text-amber-700", icon: <Sunrise size={11} /> }
                  : mSession === "SIANG"
                    ? { bg: "bg-orange-50 border-orange-200 text-orange-700", icon: <Sun size={11} /> }
                    : { bg: "bg-sky-50 border-sky-200 text-sky-700", icon: <Moon size={11} /> };

              return (
                <div 
                  key={m.partaiNum}
                  className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  {/* Left Column: NO, Partai, and Metadata */}
                  <div className="flex items-center gap-4 min-w-[320px]">
                    {/* Column 1: Row sequence "NO" */}
                    <div className="text-slate-400 font-extrabold text-xs text-center w-6">
                      {index + 1}
                    </div>

                    {/* Column 2: Partai Badge */}
                    <div 
                      className={`rounded-2xl p-3.5 text-center min-w-[76px] shadow-sm flex flex-col justify-center border ${userRole === "admin" ? "cursor-pointer hover:bg-slate-800 bg-slate-950 border-slate-800" : "bg-slate-950 border-slate-800"}`}
                      onClick={() => {
                        if (userRole !== "admin") return;
                        const newPartai = prompt("Ubah Nomor Partai secara manual (angka):", m.partaiNum.toString());
                        if (newPartai && !isNaN(parseInt(newPartai))) {
                          const matchKey = `${m.className}_${m.round}_${m.matchIndex}`;
                          setManualOverrides(prev => ({
                            ...prev,
                            [matchKey]: { ...prev[matchKey], partaiNum: parseInt(newPartai) }
                          }));
                        }
                      }}
                    >
                      <span className="text-[7px] font-black tracking-widest text-slate-400 uppercase">Partai</span>
                      <strong className="text-sm font-black text-emerald-400">#{m.partaiNum}</strong>
                    </div>

                    {/* Column 3: Class, Round, Arena & Session details */}
                    <div className="space-y-1.5">
                      <div className="font-black text-slate-900 text-[11px] uppercase leading-tight">
                        {(() => {
                          const det = getShortClassAndGender(m.className);
                          return (
                            <div className="flex flex-col">
                              <span className="text-emerald-700 text-[9px] mb-0.5">{det.line1}</span>
                              <span className="text-slate-900 text-sm">{det.line2}</span>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-bold text-slate-400">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase font-black">
                          {m.roundName}
                        </span>
                        <span className={`px-2 py-0.5 rounded uppercase font-black border ${getShortClassAndGender(m.className).isSeni ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                          {getShortClassAndGender(m.className).isSeni ? "Seni Jurus" : "Tanding"}
                        </span>
                        <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded uppercase font-black cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => {
                          if (userRole !== "admin") return;
                          const newHari = prompt("Ubah Hari untuk partai ini (angka):", getDayNumber(m).toString());
                          if (newHari && !isNaN(parseInt(newHari))) {
                            const newSession = prompt("Ubah Sesi (PAGI / SIANG / MALAM):", getSession(m));
                            if (newSession) {
                              const matchKey = `${m.className}_${m.round}_${m.matchIndex}`;
                              setManualOverrides(prev => ({
                                ...prev,
                                [matchKey]: { ...prev[matchKey], dayNum: parseInt(newHari), session: newSession.toUpperCase() }
                              }));
                            }
                          }
                        }}>
                          HARI {getDayNumber(m)} • {mSession} (Klik Edit)
                        </span>
                        
                        {totalGelanggang > 1 && (
                          userRole === "admin" ? (
                            <select
                              value={gelNum}
                              onChange={(e) => {
                                const newGel = parseInt(e.target.value);
                                setManualGelanggang(prev => ({
                                  ...prev,
                                  [m.partaiNum]: newGel
                                }));
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className={`px-1.5 py-0.5 rounded border uppercase font-black text-[9px] cursor-pointer bg-slate-950 text-emerald-400 border-emerald-800/40 focus:outline-none`}
                            >
                              {Array.from({ length: totalGelanggang }).map((_, idx) => (
                                <option key={idx + 1} value={idx + 1} className="bg-slate-950 text-white">
                                  GEL {idx + 1}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className={`px-2 py-0.5 rounded border uppercase font-black ${gelBadgeColor}`}>
                              GEL {gelNum}
                            </span>
                          )
                        )}

                        <span className={`px-2 py-0.5 rounded border uppercase font-black flex items-center gap-1 ${sessionBadge.bg}`}>
                          {sessionBadge.icon}
                          SESI {mSession}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Center Section: Blue Corner vs Red Corner */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-7 items-center gap-3">
                    {/* BLUE CORNER (Player 2) */}
                    <div 
                      onClick={() => handleDeclareWinner(m, 2)}
                      className={`col-span-3 p-4 rounded-2xl border-l-4 transition-all flex items-center justify-between ${
                        userRole === "admin" && !blueIsWaiting ? "cursor-pointer hover:scale-[1.01] active:scale-[0.99]" : ""
                      } ${
                        isFinished 
                          ? m.winner?.nama === m.p2?.nama 
                            ? "border-blue-500 bg-blue-50/40 text-blue-950 font-black"
                            : "border-slate-200 bg-slate-50/20 text-slate-400 opacity-50"
                          : blueIsWaiting
                            ? "border-dashed border-slate-300 bg-slate-50/30 text-slate-400"
                            : "border-blue-500 bg-white shadow-sm hover:bg-blue-50/5 text-slate-800"
                      }`}
                    >
                      <div className="space-y-0.5 truncate pr-2">
                        <div className="text-[7px] font-extrabold text-blue-600/75 tracking-wider uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          Sudut Biru
                        </div>
                        <h4 className="font-extrabold text-xs leading-tight truncate">
                          {blueName}
                          {blueStatus && (blueStatus === "OVER" || blueStatus === "UNDER" || blueStatus === "BELUM") && (
                            <span className={`ml-1.5 inline-block px-1.5 py-0.5 rounded text-[8px] font-black bg-rose-100 text-rose-700 uppercase animate-pulse ${blueStatus === "BELUM" ? "print:hidden" : ""}`}>
                              {blueStatus === "BELUM" ? "BELUM TIMBANG" : `DISK TIMBANG (${blueStatus})`}
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] font-semibold opacity-80 truncate">
                          {blueCont || "—"}
                        </p>
                      </div>
                      {isFinished && m.winner?.nama === m.p2?.nama && (
                        <span className="bg-blue-100 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-0.5 shrink-0">
                          ✓ MENANG
                        </span>
                      )}
                    </div>

                    {/* VS & SCORE BADGE */}
                    <div className="col-span-1 text-center py-2 flex flex-col items-center justify-center">
                      {isFinished ? (
                        <div className="space-y-0.5">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded-full uppercase">
                            Selesai
                          </span>
                          <div className="text-xs font-black text-slate-800 tracking-tight">
                            {m.score2 ?? "-"} : {m.score1 ?? "-"}
                          </div>
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[9px] text-slate-500 shadow-inner">
                          VS
                        </div>
                      )}
                    </div>

                    {/* RED CORNER (Player 1) */}
                    <div 
                      onClick={() => handleDeclareWinner(m, 1)}
                      className={`col-span-3 p-4 rounded-2xl border-l-4 transition-all flex items-center justify-between ${
                        userRole === "admin" && !redIsWaiting ? "cursor-pointer hover:scale-[1.01] active:scale-[0.99]" : ""
                      } ${
                        isFinished 
                          ? m.winner?.nama === m.p1?.nama 
                            ? "border-rose-500 bg-rose-50/40 text-rose-950 font-black"
                            : "border-slate-200 bg-slate-50/20 text-slate-400 opacity-50"
                          : redIsWaiting
                            ? "border-dashed border-slate-300 bg-slate-50/30 text-slate-400"
                            : "border-rose-500 bg-white shadow-sm hover:bg-rose-50/5 text-slate-800"
                      }`}
                    >
                      <div className="space-y-0.5 truncate pr-2">
                        <div className="text-[7px] font-extrabold text-rose-600/75 tracking-wider uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Sudut Merah
                        </div>
                        <h4 className="font-extrabold text-xs leading-tight truncate">
                          {redName}
                          {redStatus && (redStatus === "OVER" || redStatus === "UNDER" || redStatus === "BELUM") && (
                            <span className={`ml-1.5 inline-block px-1.5 py-0.5 rounded text-[8px] font-black bg-rose-100 text-rose-700 uppercase animate-pulse ${redStatus === "BELUM" ? "print:hidden" : ""}`}>
                              {redStatus === "BELUM" ? "BELUM TIMBANG" : `DISK TIMBANG (${redStatus})`}
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] font-semibold opacity-80 truncate">
                          {redCont || "—"}
                        </p>
                      </div>
                      {isFinished && m.winner?.nama === m.p1?.nama && (
                        <span className="bg-rose-100 text-rose-700 text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-0.5 shrink-0">
                          ✓ MENANG
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
    </div>
  );
}

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Award, Printer, Play, Save, Trash2, Users, CheckCircle2, ChevronRight, Shuffle, Settings, X, Download, Check, Pencil } from "lucide-react";
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

interface BracketsModuleProps {
  athletes: Athlete[];
  userRole: "admin" | "kontingen";
}

export default function BracketsModule({ athletes, userRole }: BracketsModuleProps) {
  const [selectedClass, setSelectedClass] = useState("");
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [classCounts, setClassCounts] = useState<Record<string, number>>({});
  const [classAthletes, setClassAthletes] = useState<Athlete[]>([]);
  
  // Bracket generation states
  const [matches, setMatches] = useState<Record<number, MatchNode[]>>({});
  const [roundsCount, setRoundsCount] = useState(0);
  const [winner, setWinner] = useState<Competitor | null>(null);
  const [isPrintingAll, setIsPrintingAll] = useState(false);

  // Lottery draw (proses pengundian) states
  const [isLotteryActive, setIsLotteryActive] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const shuffleTimerRef = useRef<any>(null);
  const [lotteryCurrentSlot, setLotteryCurrentSlot] = useState<{ matchIndex: number; playerNum: 1 | 2 } | null>(null);
  const [lotteryCurrentAthlete, setLotteryCurrentAthlete] = useState<{ name: string; kontingen: string } | null>(null);

  // New States for bracket configuration & print preview
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [showResetVerifyModal, setShowResetVerifyModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminPasswordError, setAdminPasswordError] = useState("");
  // Compute saved classes for initial view
  const savedClasses = useMemo(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith("silat_bracket_"));
    const classes = keys.map(k => k.substring(14));
    
    const catOrder = [
      "pra usia",
      "usia dini 1",
      "usia dini 2",
      "usia dini",
      "pra remaja",
      "remaja",
      "dewasa",
      "master"
    ];
    
    const getCatWeight = (cl: string) => {
      const lower = cl.toLowerCase();
      for (let i = 0; i < catOrder.length; i++) {
        if (lower.includes(catOrder[i])) return i;
      }
      return 99;
    };
    
    return classes.sort((a, b) => {
      const wA = getCatWeight(a);
      const wB = getCatWeight(b);
      if (wA !== wB) return wA - wB;
      return a.localeCompare(b);
    });
  }, []);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printType, setPrintType] = useState<"single" | "all">("single");
  const [printScale, setPrintScale] = useState(100);
  const [editSlotInfo, setEditSlotInfo] = useState<{ matchIndex: number; playerNum: 1 | 2 } | null>(null);
  const [editSlotName, setEditSlotName] = useState("");
  const [editSlotKontingen, setEditSlotKontingen] = useState("");
  const [editMatchNumInfo, setEditMatchNumInfo] = useState<{ round: number; matchIndex: number } | null>(null);
  const [editMatchNumValue, setEditMatchNumValue] = useState("");

  const handleEditMatchNumberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMatchNumInfo) {
      setMatches(prev => {
        const updated = { ...prev };
        if (updated[editMatchNumInfo.round] && updated[editMatchNumInfo.round][editMatchNumInfo.matchIndex]) {
          updated[editMatchNumInfo.round][editMatchNumInfo.matchIndex].matchNumber = editMatchNumValue;
        }
        return updated;
      });
      setEditMatchNumInfo(null);
    }
  };

  // Load all unique classes that have at least 1 VALIDATED (ACC) athletes
  useEffect(() => {
    const classMap: Record<string, number> = {};
    athletes.forEach(a => {
      if (a.isAcc) {
        let cleanClass = a.kelas.replace(/ \[(?:Aktual|Validasi|Revisi):.*?\]/g, "");
        let matchType = "";
        if (cleanClass.startsWith("Prestasi | ")) {
          matchType = "Prestasi";
          cleanClass = cleanClass.replace("Prestasi | ", "");
        } else if (cleanClass.startsWith("Pemasalan | ")) {
          matchType = "Pemasalan";
          cleanClass = cleanClass.replace("Pemasalan | ", "");
        }
        const key = matchType ? `${matchType} - ${a.kategori} - ${a.jk} | ${cleanClass}` : `${a.kategori} - ${a.jk} - ${cleanClass}`;
        classMap[key] = (classMap[key] || 0) + 1;
      }
    });

    setClassCounts(classMap);
    const activeKeys = Object.keys(classMap).filter(k => classMap[k] >= 1);

    // Custom sorting based on user's category order requirements:
    // UD, PRA REMAJA, REMAJA, DEWASA, MASTER, followed by letters alphabetically
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
      // Find something like "KELAS A", "KELAS B", etc.
      const match = classStr.match(/KELAS\s+([A-Z])/i);
      if (match) {
        return match[1].charCodeAt(0);
      }
      return 999;
    };

    const sortedKeys = activeKeys.sort((a, b) => {
      const catA = getCategoryWeight(a);
      const catB = getCategoryWeight(b);
      if (catA !== catB) return catA - catB;

      const genA = getGenderWeight(a);
      const genB = getGenderWeight(b);
      if (genA !== genB) return genA - genB;

      const letA = getClassLetterWeight(a);
      const letB = getClassLetterWeight(b);
      if (letA !== letB) return letA - letB;

      return a.localeCompare(b);
    });

    setAvailableClasses(sortedKeys);
  }, [athletes]);

  // Generate blank bracket with placeholder competitors
  const generateBlankBracket = (athletesList: Athlete[], forcedCount?: number) => {
    const n = forcedCount || (athletesList.length > 1 ? athletesList.length : 2);
    if (n < 2) {
      setMatches({});
      setRoundsCount(0);
      setWinner(null);
      return;
    }

    // Find next power of 2
    let p = 2;
    while (p < n) {
      p *= 2;
    }

    const totalRounds = Math.log2(p);
    const initialMatches: Record<number, MatchNode[]> = {};

    const byesCount = p - n;
    const byeIndices: number[] = [];
    const r1MatchesCount = p / 2;
    if (byesCount > 0) {
      for (let i = 0; i < byesCount; i++) {
        const matchIdx = Math.floor((i * r1MatchesCount) / byesCount);
        byeIndices.push(matchIdx * 2 + 1);
      }
    }

    // For Round 1
    const r1Matches: MatchNode[] = [];
    for (let m = 0; m < r1MatchesCount; m++) {
      const idx1 = m * 2;
      const idx2 = m * 2 + 1;
      const hasBye1 = byeIndices.includes(idx1);
      const hasBye2 = byeIndices.includes(idx2);

      r1Matches.push({
        round: 1,
        matchIndex: m,
        p1: hasBye1 
          ? { nama: "BYE", kontingen: "-", isBye: true } 
          : { nama: `Menunggu Undian (Slot ${idx1 + 1})`, kontingen: "-", isPlaceholder: true },
        p2: hasBye2 
          ? { nama: "BYE", kontingen: "-", isBye: true } 
          : { nama: `Menunggu Undian (Slot ${idx2 + 1})`, kontingen: "-", isPlaceholder: true }
      });
    }
    initialMatches[1] = r1Matches;

    // Resolve auto-advancements for BYEs in Round 1
    for (let m = 0; m < r1MatchesCount; m++) {
      const match = r1Matches[m];
      if (match.p1?.isBye && match.p2 && !match.p2.isBye) {
        match.winner = match.p2;
        match.score2 = 1;
      } else if (match.p2?.isBye && match.p1 && !match.p1.isBye) {
        match.winner = match.p1;
        match.score1 = 1;
      }
    }

    // For subsequent rounds
    for (let r = 2; r <= totalRounds; r++) {
      const roundMatchesCount = p / Math.pow(2, r);
      const roundMatches: MatchNode[] = [];
      for (let m = 0; m < roundMatchesCount; m++) {
        roundMatches.push({
          round: r,
          matchIndex: m,
          p1: null,
          p2: null
        });
      }
      initialMatches[r] = roundMatches;
    }

    // Propagate auto-advanced BYE winners to Round 2
    if (totalRounds >= 2) {
      for (let m = 0; m < r1MatchesCount; m++) {
        const match = initialMatches[1][m];
        if (match.winner) {
          const nextM = Math.floor(m / 2);
          const nextSlot = m % 2 === 0 ? "p1" : "p2";
          initialMatches[2][nextM][nextSlot] = match.winner;
        }
      }
    }

    setMatches(initialMatches);
    setRoundsCount(totalRounds);
    setWinner(null);
  };

  // Restore previously selected class or automatically pick first saved bracket class on load
  useEffect(() => {
    if (availableClasses.length > 0 && !selectedClass) {
      const lastSelected = localStorage.getItem("silat_last_selected_class_bracket");
      if (lastSelected && availableClasses.includes(lastSelected)) {
        setSelectedClass(lastSelected);
      } else {
        const savedClass = availableClasses.find(cl => localStorage.getItem("silat_bracket_" + cl) !== null);
        if (savedClass) {
          setSelectedClass(savedClass);
        } else {
          setSelectedClass(availableClasses[0]);
        }
      }
    }
  }, [availableClasses]);

  // Load athletes and saved brackets when selected class changes
  useEffect(() => {
    if (!selectedClass) {
      setClassAthletes([]);
      setMatches({});
      setWinner(null);
      return;
    }

    // Save selected class
    localStorage.setItem("silat_last_selected_class_bracket", selectedClass);

    const filtered = athletes.filter(a => {
      if (!a.isAcc) return false;
      let cleanClass = a.kelas.replace(/ \[(?:Aktual|Validasi|Revisi):.*?\]/g, "");
      let matchType = "";
      if (cleanClass.startsWith("Prestasi | ")) {
        matchType = "Prestasi";
        cleanClass = cleanClass.replace("Prestasi | ", "");
      } else if (cleanClass.startsWith("Pemasalan | ")) {
        matchType = "Pemasalan";
        cleanClass = cleanClass.replace("Pemasalan | ", "");
      }
      const key = matchType ? `${matchType} - ${a.kategori} - ${a.jk} | ${cleanClass}` : `${a.kategori} - ${a.jk} - ${cleanClass}`;
      return key === selectedClass;
    });

    let groupedAthletes = filtered;
    if (selectedClass.toLowerCase().includes("ganda") || selectedClass.toLowerCase().includes("beregu")) {
      const contingentMap = new Map();
      filtered.forEach(a => {
        if (!contingentMap.has(a.kontingen)) {
          contingentMap.set(a.kontingen, { ...a, name: a.name });
        } else {
          const group = contingentMap.get(a.kontingen);
          group.name += ` & ${a.name}`;
          contingentMap.set(a.kontingen, group);
        }
      });
      groupedAthletes = Array.from(contingentMap.values());
    }

    setClassAthletes(groupedAthletes);
    
    // Auto-resolve brackets for weigh-in disqualifications first
    autoResolveAllBracketsLocal(athletes);

    // Check if there is a saved bracket in localStorage
    const saved = localStorage.getItem("silat_bracket_" + selectedClass);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMatches(parsed.matches || {});
        setRoundsCount(parsed.roundsCount || 0);
        setWinner(parsed.winner || null);
      } catch (e) {
        console.error(e);
        setMatches({});
        setWinner(null);
      }
    } else {
      if (userRole === "admin") {
        generateBlankBracket(groupedAthletes);
      } else {
        setMatches({});
        setWinner(null);
      }
    }
  }, [selectedClass, athletes, userRole]);

  // Seeding draw lottery process inside bracket branches (Interactive Start / Stop)
  const handleStartLottery = () => {
    const n = classAthletes.length > 1 ? classAthletes.length : 2;
    if (n < 2) {
      alert("Butuh minimal 2 slot peserta untuk diundi!");
      return;
    }

    if (shuffleTimerRef.current) {
      clearInterval(shuffleTimerRef.current);
    }

    setIsLotteryActive(true);
    setIsShuffling(true);
    setWinner(null);

    // 1. Determine size P of Round 1
    let p = 2;
    while (p < n) {
      p *= 2;
    }

    const byesCount = p - n;
    const byeIndices: number[] = [];
    const r1MatchesCount = p / 2;
    if (byesCount > 0) {
      for (let i = 0; i < byesCount; i++) {
        const matchIdx = Math.floor((i * r1MatchesCount) / byesCount);
        byeIndices.push(matchIdx * 2 + 1);
      }
    }

    const totalRounds = Math.log2(p);
    setRoundsCount(totalRounds);

    const pool = classAthletes.length > 0 ? classAthletes : [{ name: "Atlet Contoh", kontingen: "Kontingen" }];

    // Start fast interval shuffling names
    shuffleTimerRef.current = setInterval(() => {
      const tempMatches: Record<number, MatchNode[]> = {};
      const r1MatchesCount = p / 2;
      const r1Matches: MatchNode[] = [];

      for (let m = 0; m < r1MatchesCount; m++) {
        const idx1 = m * 2;
        const idx2 = m * 2 + 1;
        const randA1 = pool[Math.floor(Math.random() * pool.length)];
        const randA2 = pool[Math.floor(Math.random() * pool.length)];

        r1Matches.push({
          round: 1,
          matchIndex: m,
          p1: byeIndices.includes(idx1) 
            ? { nama: "BYE", kontingen: "-", isBye: true } 
            : { nama: randA1.name, kontingen: randA1.kontingen, isFlickering: true },
          p2: byeIndices.includes(idx2) 
            ? { nama: "BYE", kontingen: "-", isBye: true } 
            : { nama: randA2.name, kontingen: randA2.kontingen, isFlickering: true }
        });
      }
      tempMatches[1] = r1Matches;

      // Fill subsequent blank rounds
      for (let r = 2; r <= totalRounds; r++) {
        const roundMatchesCount = p / Math.pow(2, r);
        const roundMatches: MatchNode[] = [];
        for (let m = 0; m < roundMatchesCount; m++) {
          roundMatches.push({
            round: r,
            matchIndex: m,
            p1: null,
            p2: null
          });
        }
        tempMatches[r] = roundMatches;
      }

      setMatches(tempMatches);
    }, 60);
  };

  const handleStopLottery = () => {
    if (shuffleTimerRef.current) {
      clearInterval(shuffleTimerRef.current);
      shuffleTimerRef.current = null;
    }

    setIsShuffling(false);
    setIsLotteryActive(false);

    // Determine size P of Round 1
    const n = classAthletes.length > 1 ? classAthletes.length : 2;
    let p = 2;
    while (p < n) {
      p *= 2;
    }

    const byesCount = p - n;
    const byeIndices: number[] = [];
    const r1MatchesCount = p / 2;
    if (byesCount > 0) {
      for (let i = 0; i < byesCount; i++) {
        const matchIdx = Math.floor((i * r1MatchesCount) / byesCount);
        byeIndices.push(matchIdx * 2 + 1);
      }
    }

    // Prepare randomized athletes pool
    const finalPool = [...classAthletes].sort(() => Math.random() - 0.5);
    let poolIdx = 0;

    const completedMatches: Record<number, MatchNode[]> = {};
    const r1Matches: MatchNode[] = [];

    for (let m = 0; m < r1MatchesCount; m++) {
      const idx1 = m * 2;
      const idx2 = m * 2 + 1;
      const hasBye1 = byeIndices.includes(idx1);
      const hasBye2 = byeIndices.includes(idx2);

      let p1Data: Competitor;
      if (hasBye1) {
        p1Data = { nama: "BYE", kontingen: "-", isBye: true };
      } else if (poolIdx < finalPool.length) {
        const selectedA = finalPool[poolIdx++];
        p1Data = { nama: selectedA.name, kontingen: selectedA.kontingen };
      } else {
        p1Data = { nama: `Peserta Tambahan ${idx1 + 1}`, kontingen: "-" };
      }

      let p2Data: Competitor;
      if (hasBye2) {
        p2Data = { nama: "BYE", kontingen: "-", isBye: true };
      } else if (poolIdx < finalPool.length) {
        const selectedA = finalPool[poolIdx++];
        p2Data = { nama: selectedA.name, kontingen: selectedA.kontingen };
      } else {
        p2Data = { nama: `Peserta Tambahan ${idx2 + 1}`, kontingen: "-" };
      }

      r1Matches.push({
        round: 1,
        matchIndex: m,
        p1: p1Data,
        p2: p2Data
      });
    }
    completedMatches[1] = r1Matches;

    const totalRounds = Math.log2(p);
    for (let r = 2; r <= totalRounds; r++) {
      const roundMatchesCount = p / Math.pow(2, r);
      const roundMatches: MatchNode[] = [];
      for (let m = 0; m < roundMatchesCount; m++) {
        roundMatches.push({
          round: r,
          matchIndex: m,
          p1: null,
          p2: null
        });
      }
      completedMatches[r] = roundMatches;
    }

    // Resolve auto-advancements for BYEs and finalize
    for (let m = 0; m < r1MatchesCount; m++) {
      const match = completedMatches[1][m];
      let matchWinner: Competitor | undefined = undefined;
      if (match.p1?.isBye && match.p2 && !match.p2.isBye && !match.p2.isPlaceholder) {
        matchWinner = match.p2;
      } else if (match.p2?.isBye && match.p1 && !match.p1.isBye && !match.p1.isPlaceholder) {
        matchWinner = match.p1;
      }

      if (matchWinner) {
        match.winner = matchWinner;
        match.score1 = matchWinner === match.p1 ? 1 : undefined;
        match.score2 = matchWinner === match.p2 ? 1 : undefined;
        
        // propagate to Round 2
        const nextM = Math.floor(m / 2);
        const nextSlot = m % 2 === 0 ? "p1" : "p2";
        if (completedMatches[2] && completedMatches[2][nextM]) {
          completedMatches[2][nextM][nextSlot] = matchWinner;
        }
      }
    }

    setMatches(completedMatches);
    setRoundsCount(totalRounds);
    setWinner(null);

    // Auto-save to localStorage
    const dataToSave = {
      matches: completedMatches,
      roundsCount: totalRounds,
      winner: null
    };
    localStorage.setItem("silat_bracket_" + selectedClass, JSON.stringify(dataToSave));
    alert(`Sukses! Seluruh nama peserta berhasil diacak di dalam bagan dan disimpan ke sistem.`);
  };

  useEffect(() => {
    return () => {
      if (shuffleTimerRef.current) {
        clearInterval(shuffleTimerRef.current);
      }
    };
  }, []);

  const isAthleteSeeded = (athleteName: string) => {
    if (!matches[1]) return false;
    return matches[1].some(m => 
      (m.p1 && m.p1.nama === athleteName) || 
      (m.p2 && m.p2.nama === athleteName)
    );
  };

  // Click competitor to select winner & advance
  const handleSelectWinner = (roundNum: number, matchIdx: number, playerNum: 1 | 2) => {
    if (userRole !== "admin") return;
    if (isLotteryActive) return;

    const updated = { ...matches };
    const match = updated[roundNum][matchIdx];
    
    const competitor = playerNum === 1 ? match.p1 : match.p2;
    if (!competitor || competitor.isBye || competitor.isPlaceholder) return;

    let previousWinner = match.winner;
    let newWinner: Competitor | undefined = undefined;

    // Toggle logic: click already declared winner to cancel, else set as winner
    if (previousWinner?.nama === competitor.nama) {
      newWinner = undefined;
    } else {
      newWinner = competitor;
    }

    match.winner = newWinner;
    match.score1 = newWinner === match.p1 ? 1 : undefined;
    match.score2 = newWinner === match.p2 ? 1 : undefined;

    // Propagate updates to subsequent rounds
    propagateWinner(roundNum, matchIdx, newWinner, updated);

    setMatches(updated);

    // Determine absolute tournament winner
    let currentFinalWinner: Competitor | null = null;
    const finalRoundMatches = updated[roundsCount] || [];
    if (finalRoundMatches[0]?.winner) {
      currentFinalWinner = finalRoundMatches[0].winner;
    }
    setWinner(currentFinalWinner);

    // Save updated bracket state immediately
    const dataToSave = {
      matches: updated,
      roundsCount,
      winner: currentFinalWinner
    };
    localStorage.setItem("silat_bracket_" + selectedClass, JSON.stringify(dataToSave));
  };

  const propagateWinner = (round: number, matchIdx: number, winnerComp: Competitor | undefined, updatedMatches: Record<number, MatchNode[]>) => {
    const nextRound = round + 1;
    
    if (nextRound > roundsCount) {
      return;
    }

    const nextMatchIdx = Math.floor(matchIdx / 2);
    const playerSlot = matchIdx % 2 === 0 ? "p1" : "p2";
    const nextMatch = updatedMatches[nextRound][nextMatchIdx];

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
        propagateWinner(nextRound, nextMatchIdx, undefined, updatedMatches);
      }
    }
  };

  const handleEditCompetitorName = (matchIndex: number, playerNum: 1 | 2, newName: string, newKontingen: string) => {
    const updated = JSON.parse(JSON.stringify(matches));
    const match = updated[1][matchIndex];
    if (playerNum === 1) {
      if (!match.p1) match.p1 = { nama: "", kontingen: "" };
      match.p1.nama = newName;
      match.p1.kontingen = newKontingen;
      match.p1.isPlaceholder = false;
      match.p1.isBye = newName.toUpperCase() === "BYE";
    } else {
      if (!match.p2) match.p2 = { nama: "", kontingen: "" };
      match.p2.nama = newName;
      match.p2.kontingen = newKontingen;
      match.p2.isPlaceholder = false;
      match.p2.isBye = newName.toUpperCase() === "BYE";
    }

    // Resolve auto-advancements for BYEs in Round 1
    if (match.p1?.isBye && match.p2 && !match.p2.isBye) {
      match.winner = match.p2;
      match.score2 = 1;
    } else if (match.p2?.isBye && match.p1 && !match.p1.isBye) {
      match.winner = match.p1;
      match.score1 = 1;
    } else {
      match.winner = undefined;
      match.score1 = undefined;
      match.score2 = undefined;
    }

    // Propagate auto-advanced BYE winners to Round 2
    if (roundsCount >= 2) {
      const nextM = Math.floor(matchIndex / 2);
      const nextSlot = matchIndex % 2 === 0 ? "p1" : "p2";
      if (updated[2] && updated[2][nextM]) {
        updated[2][nextM][nextSlot] = match.winner || null;
      }
    }

    setMatches(updated);
    
    // Auto-save if already saved previously
    const isSaved = localStorage.getItem("silat_bracket_" + selectedClass) !== null;
    if (isSaved) {
      const dataToSave = {
        matches: updated,
        roundsCount,
        winner
      };
      localStorage.setItem("silat_bracket_" + selectedClass, JSON.stringify(dataToSave));
    }
  };

  const handleExportBracketExcel = (className: string) => {
    let htmlContent = `
      <table border="1" style="border-collapse: collapse; font-family: sans-serif;">
        <thead>
          <tr style="background-color: #0f172a; color: white;">
            <th colspan="7" style="padding: 12px; font-size: 16px; font-weight: bold; text-align: center;">
              BAGAN PERTANDINGAN - ${className.toUpperCase()}
            </th>
          </tr>
          <tr style="background-color: #334155; color: white; font-weight: bold; font-size: 11px;">
            <th style="padding: 8px; text-align: center; width: 80px;">BABAK</th>
            <th style="padding: 8px; text-align: center; width: 80px;">PARTAI</th>
            <th style="padding: 8px; text-align: left; width: 180px;">SUDUT BIRU</th>
            <th style="padding: 8px; text-align: left; width: 150px;">KONTINGEN BIRU</th>
            <th style="padding: 8px; text-align: left; width: 180px;">SUDUT MERAH</th>
            <th style="padding: 8px; text-align: left; width: 150px;">KONTINGEN MERAH</th>
            <th style="padding: 8px; text-align: center; width: 150px;">PEMENANG / SKOR</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (let r = 1; r <= roundsCount; r++) {
      const roundMatches = matches[r] || [];
      const roundName = getRoundName(roundMatches.length);
      roundMatches.forEach((m, idx) => {
        const p1Name = m.p1 ? (m.p1.isBye ? "BYE" : m.p1.nama) : "-";
        const p1Kont = m.p1?.kontingen || "-";
        const p2Name = m.p2 ? (m.p2.isBye ? "BYE" : m.p2.nama) : "-";
        const p2Kont = m.p2?.kontingen || "-";
        const winnerName = m.winner ? m.winner.nama : "Belum Ada";
        
        htmlContent += `
          <tr style="font-size: 11px;">
            <td style="padding: 6px; text-align: center; font-weight: bold; background-color: #f8fafc;">${roundName}</td>
            <td style="padding: 6px; text-align: center; background-color: #f8fafc;">Partai ${idx + 1}</td>
            <td style="padding: 6px; color: #1e3a8a; font-weight: bold;">${p1Name}</td>
            <td style="padding: 6px; color: #1e3a8a;">${p1Kont}</td>
            <td style="padding: 6px; color: #9f1239; font-weight: bold;">${p2Name}</td>
            <td style="padding: 6px; color: #9f1239;">${p2Kont}</td>
            <td style="padding: 6px; text-align: center; font-weight: bold; background-color: #f0fdf4; color: #166534;">${winnerName}</td>
          </tr>
        `;
      });
    }

    if (winner) {
      htmlContent += `
        <tr style="background-color: #fef3c7; font-size: 12px; font-weight: bold;">
          <td colspan="2" style="padding: 10px; text-align: center;">🏆 JUARA KELAS</td>
          <td colspan="5" style="padding: 10px; color: #78350f; font-size: 13px;">${winner.nama.toUpperCase()} (${winner.kontingen.toUpperCase()})</td>
        </tr>
      `;
    }

    htmlContent += `
        </tbody>
      </table>
    `;

    const template = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:Name>Bagan - Silat Digital</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
        <meta charset="UTF-8">
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;

    const blob = new Blob([template], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bagan_pertandingan_${className.toLowerCase().replace(/[^a-z0-9]/g, "_")}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveBracket = () => {
    if (Object.keys(matches).length === 0) {
      alert("Tidak ada bagan untuk disimpan! Silakan acak undian terlebih dahulu.");
      return;
    }
    const dataToSave = {
      matches,
      roundsCount,
      winner
    };
    localStorage.setItem("silat_bracket_" + selectedClass, JSON.stringify(dataToSave));
    alert(`Bagan pertandingan untuk kelas "${selectedClass}" berhasil disimpan secara permanen!`);
  };

  const handleResetBracket = () => {
    setShowResetVerifyModal(true);
  };

  const handleVerifyPasswordAndReset = () => {
    if (adminPasswordInput === "admin123") {
      localStorage.removeItem("silat_bracket_" + selectedClass);
      generateBlankBracket(classAthletes);
      setShowResetVerifyModal(false);
      setAdminPasswordInput("");
      setAdminPasswordError("");
      alert("Bagan kelas berhasil diset ulang!");
    } else {
      setAdminPasswordError("Sandi Master Admin Salah!");
    }
  };

  const handlePrint = () => {
    setPrintType("single");
    setShowPrintPreview(true);
  };

  const handlePrintAll = () => {
    setPrintType("all");
    setShowPrintPreview(true);
  };

  const getRoundName = (matchesCount: number) => {
    if (matchesCount === 1) return "🏆 FINAL";
    if (matchesCount === 2) return "🥈 SEMIFINAL";
    if (matchesCount === 4) return "🥉 PEREMPAT FINAL";
    return "Penyisihan";
  };

  // Rendering for full-screen printing view
  if (isPrintingAll) {
    const savedKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("silat_bracket_")) {
        savedKeys.push(key);
      }
    }

    return (
      <div className="bg-white min-h-screen p-6 md:p-8 space-y-12 text-slate-800">
        {/* Embedded print stylesheets */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: A4 landscape;
              margin: 5mm 5mm;
            }
            
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            header, aside, footer, nav, .no-print, .print-hidden, .print\:hidden, button, select, .sidebar, .navbar, .alert {
              display: none !important;
            }

            body, html, #root, #root > div, main {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              height: 100% !important;
              max-width: none !important;
              overflow: visible !important;
              box-shadow: none !important;
            }

            .page-break-after {
              page-break-after: always !important;
              break-after: page !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              width: 100% !important;
              height: 98vh !important;
              max-height: 98vh !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: center !important;
              align-items: center !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
              box-sizing: border-box !important;
              transform: scale(var(--print-scale, 1)) !important;
              transform-origin: center center !important;
            }

            .printable-bracket-workspace {
              width: 100% !important;
              height: 98vh !important;
              max-height: 98vh !important;
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: center !important;
              align-items: center !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              overflow: visible !important;
              background: white !important;
              transform: scale(var(--print-scale, 1)) !important;
              transform-origin: center center !important;
            }

            .rounds-container {
              width: 100% !important;
              display: flex !important;
              justify-content: center !important;
              align-items: stretch !important;
              gap: 20px !important;
              padding: 10px 0 !important;
            }

            .bg-slate-300 {
              background-color: #334155 !important; /* Slate-700 for extremely crisp printable lines */
              border-color: #334155 !important;
            }

            .border-slate-200 {
              border-color: #64748b !important; /* Darker Slate-500 borders for visible box frames in print */
            }
          }
        `}} />

        <div className="flex justify-between items-center bg-slate-900 text-white p-5 rounded-2xl no-print">
          <div>
            <h2 className="font-extrabold text-sm md:text-base uppercase">Cetak Seluruh Bagan Pertandingan ({savedKeys.length} Kelas)</h2>
            <p className="text-xs text-slate-300 font-semibold mt-1">Hanya mencakup kelas-kelas yang bagannya sudah diacak dan disimpan.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all"
            >
              Cetak Dokumen
            </button>
            <button
              onClick={() => setIsPrintingAll(false)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs px-4 py-2 rounded-xl transition-all"
            >
              Kembali
            </button>
          </div>
        </div>

        {savedKeys.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-bold border border-dashed rounded-3xl">
            Belum ada bagan kelas yang diacak & disimpan oleh panitia.
          </div>
        ) : (
          savedKeys.map((key) => {
            const classNameKey = key.substring(14);
            let bracketData: { matches: Record<number, MatchNode[]>; roundsCount: number; winner: Competitor | null } | null = null;
            try {
              bracketData = JSON.parse(localStorage.getItem(key) || "");
            } catch (e) {
              return null;
            }

            if (!bracketData || !bracketData.matches) return null;

            const r1Count = bracketData.matches[1]?.length || 2;
            const containerHeight = Math.max(480, r1Count * 140);

            let printScale = 1;
            if (r1Count >= 16) {
              printScale = 0.35;
            } else if (r1Count >= 8) {
              printScale = 0.55;
            } else if (r1Count >= 4) {
              printScale = 0.75;
            } else {
              printScale = 0.95;
            }

            return (
              <div 
                key={key} 
                className="page-break-after border-b-2 border-dashed border-slate-300 pb-10"
                style={{ '--print-scale': printScale } as React.CSSProperties}
              >
                <div className="text-center mb-6 border-b-2 border-slate-900 pb-3 w-full">
                  <h1 className="text-xl font-black text-slate-950 uppercase">{classNameKey}</h1>
                  <h2 className="text-[10px] font-bold text-slate-500 tracking-widest">
                    SISTEM BRACKET BAGAN PERTANDINGAN RESMI - SILAT DIGITAL
                  </h2>
                </div>

                <div className="rounds-container flex gap-8 items-stretch py-4 justify-center" style={{ height: `${containerHeight}px` }}>
                  {Array.from({ length: bracketData.roundsCount }).map((_, rIdx) => {
                    const roundNum = rIdx + 1;
                    const roundMatches = bracketData?.matches[roundNum] || [];
                    const isLastRound = roundNum === bracketData?.roundsCount;
                    const verticalStemHeight = containerHeight / (roundMatches.length * 2);

                    return (
                      <div key={roundNum} className="flex flex-col relative" style={{ width: "210px" }}>
                        <div className="text-center font-black text-[9px] text-emerald-800 uppercase tracking-wider bg-emerald-50 py-1 rounded-md border border-emerald-100 mb-2">
                          {getRoundName(roundMatches.length)}
                        </div>

                        <div className="flex-1 flex flex-col justify-around h-full">
                          {roundMatches.map((match, mIdx) => {
                            const isByeMatch = roundNum === 1 && (match.p1?.isBye || match.p2?.isBye);
                            return (
                              <div key={mIdx} className="relative py-2">
                                <div className={`bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm relative z-10 transition-all ${
                                  isByeMatch ? "opacity-0 pointer-events-none select-none invisible" : ""
                                }`}>
                                  {/* Competitor 1 */}
                                  {(() => {
                                    const p1Status = getCompetitorWeighInStatus(match.p1, athletes);
                                    return (
                                      <div className={`p-2 border-b border-slate-100 border-l-4 border-l-blue-600 flex justify-between items-center ${
                                        match.winner && match.winner.nama !== match.p1?.nama ? "opacity-35 bg-slate-50" : "bg-blue-50/10"
                                      }`}>
                                        <div className="truncate pr-1">
                                          <span className={`font-black text-[10px] uppercase block truncate ${
                                            match.winner && match.winner.nama !== match.p1?.nama ? "line-through text-slate-400" : "text-blue-950"
                                          }`}>
                                            {match.p1 ? (match.p1.isBye ? "BYE" : match.p1.nama) : "???"}
                                            {p1Status && (p1Status === "OVER" || p1Status === "UNDER" || p1Status === "BELUM") && (
                                              <span className={`ml-1 px-1 py-0.5 rounded text-[7px] font-extrabold bg-rose-100 text-rose-700 uppercase ${p1Status === "BELUM" ? "print:hidden" : ""}`}>
                                                ({p1Status === "BELUM" ? "BELUM TIMBANG" : "DISK TIMBANG"})
                                              </span>
                                            )}
                                          </span>
                                          <span className="text-[8px] text-blue-800/70 font-bold block truncate">{match.p1?.kontingen || "-"}</span>
                                        </div>
                                      </div>
                                    );
                                  })()}

                                  {/* Competitor 2 */}
                                  {(() => {
                                    const p2Status = getCompetitorWeighInStatus(match.p2, athletes);
                                    return (
                                      <div className={`p-2 border-l-4 border-l-rose-600 flex justify-between items-center ${
                                        match.winner && match.winner.nama !== match.p2?.nama ? "opacity-35 bg-slate-50" : "bg-rose-50/10"
                                      }`}>
                                        <div className="truncate pr-1">
                                          <span className={`font-black text-[10px] uppercase block truncate ${
                                            match.winner && match.winner.nama !== match.p2?.nama ? "line-through text-slate-400" : "text-rose-950"
                                          }`}>
                                            {match.p2 ? (match.p2.isBye ? "BYE" : match.p2.nama) : "???"}
                                            {p2Status && (p2Status === "OVER" || p2Status === "UNDER" || p2Status === "BELUM") && (
                                              <span className={`ml-1 px-1 py-0.5 rounded text-[7px] font-extrabold bg-rose-100 text-rose-700 uppercase ${p2Status === "BELUM" ? "print:hidden" : ""}`}>
                                                ({p2Status === "BELUM" ? "BELUM TIMBANG" : "DISK TIMBANG"})
                                              </span>
                                            )}
                                          </span>
                                          <span className="text-[8px] text-rose-800/70 font-bold block truncate">{match.p2?.kontingen || "-"}</span>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>

                                {/* Connectors */}
                                {!isLastRound && (
                                  <>
                                    <div className={`absolute right-[-16px] top-1/2 w-[16px] h-0 border-t-2 border-slate-300 z-0 ${isByeMatch ? 'hidden' : ''}`}></div>
                                    <div 
                                      className={`absolute right-[-16px] w-0 border-l-2 border-slate-300 z-0 ${isByeMatch ? 'hidden' : ''}`}
                                      style={mIdx % 2 === 0 
                                        ? { top: "50%", height: `${verticalStemHeight}px` } 
                                        : { bottom: "50%", height: `${verticalStemHeight}px` }
                                      }
                                    ></div>
                                  </>
                                )}
                                {roundNum > 1 && (
                                  <div className="absolute left-[-16px] top-1/2 w-[16px] h-0 border-t-2 border-slate-300 bg-slate-300 z-0"></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Winner column */}
                  <div className="flex flex-col justify-center" style={{ width: "160px" }}>
                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-center space-y-1">
                      <div className="text-amber-800 font-black text-[9px] uppercase tracking-wider border-b border-amber-200 pb-1">
                        🏆 Juara Kelas
                      </div>
                      {bracketData.winner ? (
                        <div>
                          <h4 className="font-black text-[11px] text-amber-950 uppercase leading-none">{bracketData.winner.nama}</h4>
                          <p className="text-[8px] text-amber-700 font-bold mt-1">{bracketData.winner.kontingen}</p>
                        </div>
                      ) : (
                        <span className="text-[9px] text-slate-400 font-bold">Menunggu...</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }

  const isSaved = localStorage.getItem("silat_bracket_" + selectedClass) !== null;

  // Dynamic height of bracket rounds workspace layout
  const r1MatchesCountMax = matches[1]?.length || 2;
  const containerHeight = Math.max(500, r1MatchesCountMax * 140);

  let printScaleSingle = 100;
  if (r1MatchesCountMax >= 16) {
    printScaleSingle = 45;
  } else if (r1MatchesCountMax >= 8) {
    printScaleSingle = 65;
  } else if (r1MatchesCountMax >= 4) {
    printScaleSingle = 80;
  } else {
    printScaleSingle = 95;
  }

  // Get keys of saved brackets
  const savedKeys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("silat_bracket_")) {
      savedKeys.push(key);
    }
  }
  
  const catOrderStr = [
    "pra usia",
    "usia dini 1",
    "usia dini 2",
    "usia dini",
    "pra remaja",
    "remaja",
    "dewasa",
    "master"
  ];
  
  savedKeys.sort((a, b) => {
    const getCatW = (cl: string) => {
      const lower = cl.toLowerCase();
      for (let j = 0; j < catOrderStr.length; j++) {
        if (lower.includes(catOrderStr[j])) return j;
      }
      return 99;
    };
    const wA = getCatW(a);
    const wB = getCatW(b);
    if (wA !== wB) return wA - wB;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-6">
      {/* Embedded print stylesheets */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 landscape;
            margin: 5mm 5mm;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          header, aside, footer, nav, .no-print, .print-hidden, .print\:hidden, button, select, .sidebar, .navbar, .alert {
            display: none !important;
          }

          body, html, #root, #root > div, main {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
            max-width: none !important;
            overflow: visible !important;
            box-shadow: none !important;
          }

          .page-break-after {
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            width: 100% !important;
            height: 98vh !important;
            max-height: 98vh !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            transform: scale(var(--print-scale, 1)) !important;
            transform-origin: center center !important;
          }

          .printable-bracket-workspace {
            width: 100% !important;
            height: 98vh !important;
            max-height: 98vh !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            overflow: visible !important;
            background: white !important;
            transform: scale(var(--print-scale, 1)) !important;
            transform-origin: center center !important;
          }

          .rounds-container {
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
            align-items: stretch !important;
            gap: 20px !important;
            padding: 10px 0 !important;
          }

          .bg-slate-300 {
            background-color: #334155 !important;
            border-color: #334155 !important;
          }

          .border-slate-200 {
            border-color: #64748b !important;
          }
        }
      `}} />

      {/* Control panel and filter */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2.5 rounded-2xl text-white">
              <Award size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base uppercase tracking-tight leading-none">
                Bagan Pertandingan
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">
                Sistem Pengundian & Bagan Braket Digital
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {userRole === "admin" && (
              <>
                <button
                  onClick={handlePrintAll}
                  className="bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Printer size={14} /> CETAK MASSAL ({savedKeys.length} BAGAN)
                </button>

                {selectedClass && Object.keys(matches).length > 0 && (
                  <>
                    <button
                      onClick={handleSaveBracket}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Save size={14} /> SIMPAN BAGAN
                    </button>
                    <button
                      onClick={handleResetBracket}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-800 font-extrabold text-xs px-3.5 py-2.5 rounded-xl transition-all border border-rose-200 cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 size={13} /> Set Ulang
                    </button>
                  </>
                )}

                {/* Hide lottery buttons if already saved */}
                {!isSaved && (
                  isShuffling ? (
                    <button
                      onClick={handleStopLottery}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md animate-pulse cursor-pointer flex items-center gap-1.5"
                    >
                      🛑 HENTIKAN UNDIAN (KUNCI NOMOR)
                    </button>
                  ) : (
                    <button
                      disabled={!selectedClass}
                      onClick={handleStartLottery}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    >
                      🎲 MULAI UNDIAN
                    </button>
                  )
                )}
              </>
            )}

            {selectedClass && Object.keys(matches).length > 0 && (
              <button
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all border border-blue-500 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer size={14} /> Cetak Bagan Ini
              </button>
            )}
          </div>
        </div>

          {/* Kategori Dropdown and Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Pilih Kategori Kelas Aktif</label>
            <select
              disabled={isLotteryActive}
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer disabled:opacity-60 shadow-sm"
            >
              <option value="">-- Pilih Kategori & Kelas --</option>
              {availableClasses.map((cl) => {
                const count = classCounts[cl] || 0;
                const isClassSaved = localStorage.getItem("silat_bracket_" + cl) !== null;
                return (
                  <option key={cl} value={cl}>
                    {isClassSaved ? "✅ [TERSURAT] " : "⏳ [KOSONG] "} {cl} ({count} Calon Peserta)
                  </option>
                );
              })}
            </select>
          </div>

          {!selectedClass && savedClasses.length > 0 && (
            <div className="mt-8 animate-fade-in pb-12 space-y-12">
              <div className="text-center pb-6 border-b border-slate-200 mb-6">
                <h3 className="text-lg font-black text-slate-900 uppercase">Seluruh Bagan Tersimpan</h3>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">Gunakan menu dropdown di atas untuk memilih kelas dan masuk ke Mode Edit/Penilaian.</p>
              </div>
              
              {savedClasses.map((cl) => {
                let bracketData: { matches: Record<number, any[]>; roundsCount: number; winner: any | null } | null = null;
                try {
                  bracketData = JSON.parse(localStorage.getItem("silat_bracket_" + cl) || "");
                } catch (e) {
                  return null;
                }
                if (!bracketData || !bracketData.matches) return null;
                
                const r1C = bracketData.matches[1]?.length || 2;
                const containerHeight = Math.max(480, r1C * 120);
                const roundsCount = bracketData.roundsCount;
                
                return (
                  <div key={cl} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm overflow-x-auto w-full">
                    <div className="text-center mb-6 border-b-2 border-slate-900 pb-4 min-w-max">
                      <h1 className="text-xl font-black text-slate-950 uppercase">{cl}</h1>
                      <h2 className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                        SISTEM BRACKET BAGAN PERTANDINGAN RESMI - SILAT TOURNAMENT
                      </h2>
                    </div>
                    
                    <div className="flex gap-8 items-stretch justify-center w-full min-w-max py-4" style={{ height: `${containerHeight}px` }}>
                      {Array.from({ length: roundsCount }).map((_, rIdx) => {
                        const roundNum = rIdx + 1;
                        const roundMatches = bracketData!.matches[roundNum] || [];
                        const isLastRound = roundNum === roundsCount;
                        const verticalStemHeight = containerHeight / (roundMatches.length * 2);
                        
                        return (
                          <div key={roundNum} className="flex flex-col relative" style={{ width: "220px" }}>
                            <div className="text-center font-black text-[10px] text-emerald-800 uppercase tracking-widest bg-emerald-50 py-1 rounded-lg border border-emerald-100 mb-2">
                              {roundNum === roundsCount ? "Final" : `Babak ${roundNum}`}
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-around h-full">
                              {roundMatches.map((match, mIdx) => {
                                const isByeMatch = roundNum === 1 && (match.p1?.isBye || match.p2?.isBye);
                                return (
                                  <div key={match.matchIndex} className="relative flex items-center justify-end" style={{ height: `${verticalStemHeight * 2}px` }}>
                                    <div className="flex flex-col w-full z-10 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden text-xs absolute right-0">
                                      <div className={`p-2 border-l-2 border-l-blue-600 flex justify-between items-center ${
                                        match.winner && match.winner.nama !== match.p1?.nama ? "opacity-30 bg-slate-50" : "bg-blue-50/5"
                                      }`}>
                                        <div className="truncate pr-2">
                                          <span className="font-black text-[10px] uppercase block truncate text-blue-950">
                                            {match.p1 ? (match.p1.isBye ? "BYE" : match.p1.nama) : "???"}
                                          </span>
                                          <span className="text-[8px] text-blue-800/70 font-semibold block truncate">
                                            {match.p1?.kontingen || "-"}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      <div className={`p-2 border-l-2 border-l-rose-600 flex justify-between items-center ${
                                        match.winner && match.winner.nama !== match.p2?.nama ? "opacity-30 bg-slate-50" : "bg-rose-50/5"
                                      }`}>
                                        <div className="truncate pr-2">
                                          <span className="font-black text-[10px] uppercase block truncate text-rose-950">
                                            {match.p2 ? (match.p2.isBye ? "BYE" : match.p2.nama) : "???"}
                                          </span>
                                          <span className="text-[8px] text-rose-800/70 font-semibold block truncate">
                                            {match.p2?.kontingen || "-"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {!isLastRound && (
                                      <>
                                        <div className="absolute right-[-16px] top-1/2 w-[16px] h-0 border-t-2 border-slate-300 z-0"></div>
                                        <div 
                                          className="absolute right-[-16px] w-0 border-l-2 border-slate-300 z-0"
                                          style={mIdx % 2 === 0 
                                            ? { top: "50%", height: `${verticalStemHeight}px` } 
                                            : { bottom: "50%", height: `${verticalStemHeight}px` }
                                          }
                                        ></div>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                      
                      <div className="flex flex-col justify-center pl-8" style={{ width: "200px" }}>
                        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-center space-y-2 shadow-sm relative">
                          <div className="absolute -left-[32px] top-1/2 w-[32px] h-0 border-t-2 border-slate-300 z-0"></div>
                          <div className="text-amber-800 font-black text-[10px] uppercase tracking-widest border-b border-amber-200 pb-2">
                            🏆 Juara Kelas
                          </div>
                          {bracketData.winner ? (
                            <div>
                              <h4 className="font-black text-sm text-amber-950 uppercase leading-tight">
                                {bracketData.winner.nama}
                              </h4>
                              <p className="text-[10px] text-amber-700 font-bold mt-1">
                                {bracketData.winner.kontingen}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-bold block py-2">
                              Menunggu...
                            </span>
                          )}
                        </div>
                      </div>
                      
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {selectedClass && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-inner">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Info Calon Peserta</span>
              <div className="text-xs font-extrabold text-slate-800 mt-1 flex justify-between items-center">
                <span>Terdapat <span className="text-emerald-600">{classAthletes.length} Atlet Valid</span></span>
                <button
                  onClick={() => setShowParticipantsModal(true)}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold text-[10px] px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Users size={12} /> LIHAT DAFTAR CALON
                </button>
              </div>
              <p className="text-[9px] text-slate-400 font-semibold mt-1.5 italic">
                {userRole === "admin" 
                  ? "* Klik nama atlet di bagan untuk meloloskan ke babak selanjutnya secara interaktif!"
                  : "* Bagan ini dikunci dan dikelola langsung oleh Panitia Pertandingan IPSI."
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lottery draw live status bar (non-blocking, beautiful) */}
      {isLotteryActive && lotteryCurrentAthlete && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between border border-slate-800 animate-pulse no-print">
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 animate-spin">⚙️</span>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block">Proses Undian Aktif</span>
              <strong className="text-xs text-slate-100 uppercase">{lotteryCurrentAthlete.name}</strong>
              <span className="text-[10px] text-slate-400 ml-1">({lotteryCurrentAthlete.kontingen})</span>
            </div>
          </div>
          <span className="bg-emerald-950 text-emerald-400 font-black text-[10px] px-3 py-1 rounded-full">
            MEMASANG ATLET KE BRACKET...
          </span>
        </div>
      )}

      {/* BRACKET VIEWPORT CONTAINER */}
      {selectedClass && (
        <div 
          className="printable-bracket-workspace bg-white rounded-3xl p-6 overflow-x-auto border border-slate-100 flex flex-col items-center justify-center relative shadow-sm min-h-[400px]"
          style={{ '--print-scale': printScaleSingle / 100, zoom: printScaleSingle / 100 } as React.CSSProperties}
        >
          {Object.keys(matches).length === 0 ? (
            <div className="text-center space-y-3 py-16 text-slate-400 no-print bg-slate-50 border border-dashed border-slate-200 rounded-3xl w-full">
              <Award size={48} className="mx-auto text-slate-300 animate-pulse" />
              <h4 className="font-extrabold text-slate-800 text-sm">Bagan Sedang Dipersiapkan</h4>
              <p className="text-xs font-semibold max-w-xs mx-auto text-slate-500 leading-relaxed">
                Bagan pertandingan untuk kelas ini belum diacak atau dibuat oleh admin. Silakan periksa kembali beberapa saat lagi.
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center min-w-max">
              {/* Header */}
              <div className="text-center mb-6 border-b-2 border-slate-900 pb-4 w-full">
                <h1 className="text-xl font-black text-slate-950 uppercase">{selectedClass}</h1>
                <h2 className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                  SISTEM BRACKET BAGAN PERTANDINGAN RESMI - SILAT TOURNAMENT
                </h2>
              </div>

              {/* Rounds Column Layout */}
              <div 
                className="rounds-container flex gap-8 items-stretch py-4 relative" 
                style={{ height: `${containerHeight}px` }}
              >
                {Array.from({ length: roundsCount }).map((_, rIdx) => {
                  const roundNum = rIdx + 1;
                  const roundMatches = matches[roundNum] || [];
                  const isLastRound = roundNum === roundsCount;
                  const verticalStemHeight = containerHeight / (roundMatches.length * 2);

                  return (
                    <div 
                      key={roundNum} 
                      className="flex flex-col relative" 
                      style={{ width: "220px" }}
                    >
                      <div className="text-center font-black text-[10px] text-emerald-800 uppercase tracking-widest bg-emerald-50 py-1 rounded-lg border border-emerald-100 mb-2">
                        {getRoundName(roundMatches.length)}
                      </div>

                      <div className="flex-1 flex flex-col justify-around h-full">
                        {roundMatches.map((match, mIdx) => {
                          const isMatchFlickering1 = match.p1?.isFlickering;
                          const isMatchFlickering2 = match.p2?.isFlickering;
                          const isByeMatch = roundNum === 1 && !isLotteryActive && (match.p1?.isBye || match.p2?.isBye);

                          return (
                            <div key={mIdx} className="relative py-2">
                              {/* Match Number */}
                                {userRole === "admin" ? (
                                  <div 
                                    onClick={() => {
                                      setEditMatchNumValue(match.matchNumber || "");
                                      setEditMatchNumInfo({ round: roundNum, matchIndex: mIdx });
                                    }}
                                    className={`absolute -right-6 ${isByeMatch ? "hidden" : ""} top-1/2 -translate-y-1/2 bg-slate-800 hover:bg-emerald-600 text-white font-black text-xs px-2 py-1 rounded-md shadow-sm z-20 cursor-pointer text-center min-w-[28px]`}
                                    title="Edit Nomor Partai"
                                  >
                                    {match.matchNumber || `?`}
                                  </div>
                                ) : (
                                  match.matchNumber && (
                                    <div className={`absolute -right-6 ${isByeMatch ? "hidden" : ""} top-1/2 -translate-y-1/2 bg-slate-800 text-white font-black text-xs px-2 py-1 rounded-md shadow-sm z-20 text-center min-w-[28px]`}>
                                      {match.matchNumber}
                                    </div>
                                  )
                                )}
                                
                              <div className={`bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm relative z-10 transition-all ${
                                isByeMatch ? "opacity-0 pointer-events-none select-none invisible" : ""
                              }`}>
                                {/* Competitor 1 (Blue) */}
                                <div 
                                  onClick={() => handleSelectWinner(roundNum, mIdx, 1)}
                                  className={`p-2.5 border-b border-slate-100 border-l-4 border-l-blue-600 flex justify-between items-center transition-all relative ${
                                    userRole === "admin" && !isLotteryActive && match.p1 && !match.p1.isPlaceholder && !match.p1.isBye 
                                      ? "hover:bg-blue-50/20 cursor-pointer" 
                                      : ""
                                  } ${
                                    match.winner && match.winner.nama !== match.p1?.nama 
                                      ? "opacity-35 bg-slate-50" 
                                      : "bg-blue-50/10"
                                  } ${isMatchFlickering1 ? "bg-amber-100 animate-pulse border-2 border-amber-400" : ""}`}
                                >
                                  <div className="truncate pr-5 flex-1">
                                    {(() => {
                                      const p1Status = getCompetitorWeighInStatus(match.p1, athletes);
                                      return (
                                        <span className={`font-black text-[10px] uppercase block truncate ${
                                          match.winner && match.winner.nama !== match.p1?.nama 
                                            ? "line-through text-slate-400" 
                                            : isMatchFlickering1 
                                              ? "text-amber-950 font-black" 
                                              : "text-blue-950"
                                        }`}>
                                          {match.p1 ? (match.p1.isBye ? "BYE" : match.p1.nama) : "???"}
                                          {p1Status && (p1Status === "OVER" || p1Status === "UNDER") && (
                                            <span className="ml-1.5 inline-block px-1 py-0.5 rounded text-[7px] font-black bg-rose-100 text-rose-700 uppercase animate-pulse">
                                              DISK TIMBANG
                                            </span>
                                          )}
                                        </span>
                                      );
                                    })()}
                                    <span className="text-[8px] text-blue-800/70 font-bold block truncate">
                                      {match.p1?.kontingen || "-"}
                                    </span>
                                  </div>
                                  
                                  {userRole === "admin" && roundNum === 1 && !isLotteryActive && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditSlotInfo({ matchIndex: mIdx, playerNum: 1 });
                                        setEditSlotName(match.p1?.nama || "");
                                        setEditSlotKontingen(match.p1?.kontingen || "");
                                      }}
                                      className="absolute right-1 top-1 p-1 hover:bg-blue-100 text-blue-700 rounded transition-all no-print"
                                      title="Edit Nama Slot"
                                    >
                                      <Pencil size={10} />
                                    </button>
                                  )}

                                  {match.winner && match.winner.nama === match.p1?.nama && (
                                    <CheckCircle2 size={12} className="text-blue-600 shrink-0" />
                                  )}
                                </div>

                                {/* Competitor 2 (Red) */}
                                <div 
                                  onClick={() => handleSelectWinner(roundNum, mIdx, 2)}
                                  className={`p-2.5 border-l-4 border-l-rose-600 flex justify-between items-center transition-all relative ${
                                    userRole === "admin" && !isLotteryActive && match.p2 && !match.p2.isPlaceholder && !match.p2.isBye 
                                      ? "hover:bg-rose-50/20 cursor-pointer" 
                                      : ""
                                  } ${
                                    match.winner && match.winner.nama !== match.p2?.nama 
                                      ? "opacity-35 bg-slate-50" 
                                      : "bg-rose-50/10"
                                  } ${isMatchFlickering2 ? "bg-amber-100 animate-pulse border-2 border-amber-400" : ""}`}
                                >
                                  <div className="truncate pr-5 flex-1">
                                    {(() => {
                                      const p2Status = getCompetitorWeighInStatus(match.p2, athletes);
                                      return (
                                        <span className={`font-black text-[10px] uppercase block truncate ${
                                          match.winner && match.winner.nama !== match.p2?.nama 
                                            ? "line-through text-slate-400" 
                                            : isMatchFlickering2 
                                              ? "text-amber-950 font-black" 
                                              : "text-rose-950"
                                        }`}>
                                          {match.p2 ? (match.p2.isBye ? "BYE" : match.p2.nama) : "???"}
                                          {p2Status && (p2Status === "OVER" || p2Status === "UNDER") && (
                                            <span className="ml-1.5 inline-block px-1 py-0.5 rounded text-[7px] font-black bg-rose-100 text-rose-700 uppercase animate-pulse">
                                              DISK TIMBANG
                                            </span>
                                          )}
                                        </span>
                                      );
                                    })()}
                                    <span className="text-[8px] text-rose-800/70 font-bold block truncate">
                                      {match.p2?.kontingen || "-"}
                                    </span>
                                  </div>

                                  {userRole === "admin" && roundNum === 1 && !isLotteryActive && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditSlotInfo({ matchIndex: mIdx, playerNum: 2 });
                                        setEditSlotName(match.p2?.nama || "");
                                        setEditSlotKontingen(match.p2?.kontingen || "");
                                      }}
                                      className="absolute right-1 top-1 p-1 hover:bg-rose-100 text-rose-700 rounded transition-all no-print"
                                      title="Edit Nama Slot"
                                    >
                                      <Pencil size={10} />
                                    </button>
                                  )}

                                  {match.winner && match.winner.nama === match.p2?.nama && (
                                    <CheckCircle2 size={12} className="text-rose-600 shrink-0" />
                                  )}
                                </div>
                              </div>

                              {/* Dynamically Calibrated Connector Stems */}
                              {!isLastRound && (
                                <>
                                  <div className={`absolute right-[-16px] top-1/2 w-[16px] h-0 border-t-2 border-slate-300 z-0 ${isByeMatch ? 'hidden' : ''}`}></div>
                                  <div 
                                    className={`absolute right-[-16px] w-0 border-l-2 border-slate-300 z-0 ${isByeMatch ? 'hidden' : ''}`}
                                    style={mIdx % 2 === 0 
                                      ? { top: "50%", height: `${verticalStemHeight}px` } 
                                      : { bottom: "50%", height: `${verticalStemHeight}px` }
                                    }
                                  ></div>
                                </>
                              )}
                              {roundNum > 1 && (
                                <div className="absolute left-[-16px] top-1/2 w-[16px] h-0 border-t-2 border-slate-300 bg-slate-300 z-0"></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Final Winner Slot */}
                <div className="flex flex-col justify-center" style={{ width: "180px" }}>
                  <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 text-center space-y-2 shadow-md relative z-10 animate-fade-in">
                    <div className="text-amber-800 font-black text-[10px] uppercase tracking-widest border-b border-amber-200 pb-1 flex items-center justify-center gap-1">
                      <span>🏆</span> Juara Kelas
                    </div>
                    {winner ? (
                      <div>
                        <h4 className="font-black text-xs text-amber-950 uppercase leading-snug">{winner.nama}</h4>
                        <p className="text-[9px] text-amber-700/80 font-bold mt-1">{winner.kontingen}</p>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold">Menunggu Final...</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CANDIDATE ATHLETES LIST MODAL (Click to open) */}
      {showParticipantsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-emerald-600" />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 uppercase">Calon Peserta Terdaftar ({classAthletes.length})</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">Atlet terverifikasi ACC yang siap diundi ke bagan kelas ini.</p>
                </div>
              </div>
              <button
                onClick={() => setShowParticipantsModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {classAthletes.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-bold">
                  Belum ada peserta terverifikasi di kelas ini.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {classAthletes.map((a, idx) => (
                    <div key={a.id || idx} className="p-3 rounded-xl bg-slate-50 border border-slate-150 flex justify-between items-center">
                      <div>
                        <span className="font-black text-xs text-slate-950 uppercase block">{a.name}</span>
                        <span className="text-[9px] text-slate-500 font-bold block mt-0.5">🏛️ {a.kontingen}</span>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 font-bold text-[8px] px-2 py-0.5 rounded-full uppercase">
                        Terverifikasi
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowParticipantsModal(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-2 rounded-xl transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RESET VERIFICATION WITH MASTER PASSWORD */}
      {showResetVerifyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h4 className="font-black text-slate-950 text-sm uppercase tracking-tight text-center">Verifikasi Sandi Master Admin</h4>
            <p className="text-[10px] text-slate-400 font-semibold text-center mt-1">
              Sandi Master diperlukan untuk menyetel ulang bagan yang sudah tersimpan secara permanen.
            </p>

            <div className="mt-4 space-y-3.5">
              <input
                type="password"
                placeholder="Masukkan Sandi Master Admin"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-center"
              />
              {adminPasswordError && (
                <div className="text-[10px] text-rose-600 font-extrabold text-center animate-shake">
                  ⚠️ {adminPasswordError}
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setShowResetVerifyModal(false);
                  setAdminPasswordInput("");
                  setAdminPasswordError("");
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-2 rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleVerifyPasswordAndReset}
                className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs py-2 rounded-xl transition-all shadow-md"
              >
                Verifikasi & Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SLOT NAME MANUAL EDITOR MODAL */}
      {editSlotInfo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="text-center">
              <h4 className="font-black text-slate-950 text-sm uppercase tracking-tight">Kustomisasi Nama Slot Bagan</h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                Ubah informasi nama slot dan kontingen di Round 1 Match {editSlotInfo.matchIndex + 1} Player {editSlotInfo.playerNum}.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nama Kompetitor</label>
                <input
                  type="text"
                  placeholder="Nama Peserta (Ketik 'BYE' jika mengosongkan)"
                  value={editSlotName}
                  onChange={(e) => setEditSlotName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nama Kontingen</label>
                <input
                  type="text"
                  placeholder="Nama Kontingen"
                  value={editSlotKontingen}
                  onChange={(e) => setEditSlotKontingen(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Quick Select from Valid Athletes */}
              {classAthletes.length > 0 && (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Pilih Cepat dari Calon Peserta</label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        const ath = classAthletes.find(a => a.name === e.target.value);
                        if (ath) {
                          setEditSlotName(ath.name);
                          setEditSlotKontingen(ath.kontingen);
                        }
                      }
                    }}
                    className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-200 rounded-xl font-bold text-[11px] text-emerald-950 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                  >
                    <option value="">-- Hubungkan dengan atlet terdaftar --</option>
                    {classAthletes.map((a, idx) => (
                      <option key={idx} value={a.name}>{a.name} ({a.kontingen})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setEditSlotInfo(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-2 rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  handleEditCompetitorName(editSlotInfo.matchIndex, editSlotInfo.playerNum, editSlotName, editSlotKontingen);
                  setEditSlotInfo(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2 rounded-xl transition-all shadow-md"
              >
                Simpan Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: MULTI-FORMAT (PDF & EXCEL) PRINT PREVIEW MODAL */}
      {showPrintPreview && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 no-print animate-fade-in">
          <div className="bg-slate-50 rounded-3xl max-w-5xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
            
            {/* Modal Top Control Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-200 pb-4 mb-4 gap-4">
              <div className="flex items-center gap-2">
                <Printer className="text-blue-600" size={22} />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 uppercase">
                    Pratinjau Cetak Bagan Pertandingan
                  </h4>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    {printType === "all" ? `Mencetak Seluruh Bagan (${savedKeys.length} Kelas)` : `Mencetak Bagan Kelas: ${selectedClass}`}
                  </p>
                </div>
              </div>

              {/* Live Print Scale Controller */}
              <div className="flex items-center gap-3 bg-slate-200/60 px-3 py-1.5 rounded-xl border border-slate-300/50">
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Skala Print:</span>
                <input
                  type="range"
                  min="30"
                  max="120"
                  step="5"
                  value={printScale}
                  onChange={(e) => setPrintScale(parseInt(e.target.value))}
                  className="w-24 sm:w-32 cursor-pointer accent-blue-600 h-1"
                />
                <span className="text-xs font-black text-blue-950 w-8 text-right">{printScale}%</span>
              </div>

              {/* Direct Export Action Triggers */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const styleElement = document.createElement("style");
                    styleElement.innerHTML = `
                      @media print {
                        .page-break-after, .printable-bracket-workspace {
                          transform: scale(${printScale / 100}) !important;
                          transform-origin: center center !important;
                        }
                      }
                    `;
                    document.head.appendChild(styleElement);
                    window.print();
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={13} /> CETAK PDF (A4 LANDSCAPE)
                </button>

                {printType !== "all" && (
                  <button
                    onClick={() => handleExportBracketExcel(selectedClass)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={13} /> EKSPOR EXCEL
                  </button>
                )}

                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Document Sheet Simulation Container */}
            <div className="flex-1 overflow-auto bg-slate-300 p-8 rounded-2xl border border-slate-400/50 flex justify-center items-start">
              <div 
                className="bg-white shadow-2xl rounded-sm p-8 max-w-full origin-top"
                style={{ 
                  width: "297mm",
                  minHeight: "210mm",
                  transform: `scale(${printScale / 100})`,
                  transformOrigin: "top center",
                  boxSizing: "border-box"
                }}
              >
                {printType === "all" ? (
                  savedKeys.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 font-bold">
                      Tidak ada bagan yang terisi untuk pratinjau cetak massal.
                    </div>
                  ) : (
                    savedKeys.map((key) => {
                      const classNameKey = key.substring(14);
                      let bracketData: { matches: Record<number, MatchNode[]>; roundsCount: number; winner: Competitor | null } | null = null;
                      try {
                        bracketData = JSON.parse(localStorage.getItem(key) || "");
                      } catch (e) {
                        return null;
                      }

                      if (!bracketData || !bracketData.matches) return null;
                      const r1C = bracketData.matches[1]?.length || 2;
                      const heightC = Math.max(480, r1C * 120);

                      return (
                        <div key={key} className="border-b border-slate-300 pb-12 mb-12 last:border-b-0 last:pb-0 last:mb-0">
                          <div className="text-center mb-6 border-b-2 border-slate-900 pb-3 w-full">
                            <h1 className="text-xl font-black text-slate-950 uppercase">{classNameKey}</h1>
                            <h2 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                              SISTEM BRACKET BAGAN PERTANDINGAN RESMI - SILAT TOURNAMENT
                            </h2>
                          </div>

                          <div className="flex gap-6 items-stretch py-4 justify-center" style={{ height: `${heightC}px` }}>
                            {Array.from({ length: bracketData.roundsCount }).map((_, rIdx) => {
                              const roundNum = rIdx + 1;
                              const roundMatches = bracketData?.matches[roundNum] || [];
                              const isLastRound = roundNum === bracketData?.roundsCount;
                              const vStemHeight = heightC / (roundMatches.length * 2);

                              return (
                                <div key={roundNum} className="flex flex-col relative" style={{ width: "170px" }}>
                                  <div className="text-center font-black text-[8px] text-emerald-800 uppercase tracking-wider bg-emerald-50 py-1 rounded border border-emerald-100 mb-2">
                                    {getRoundName(roundMatches.length)}
                                  </div>

                                  <div className="flex-1 flex flex-col justify-around h-full">
                                    {roundMatches.map((match, mIdx) => {
                                      const isByeMatch = roundNum === 1 && (match.p1?.isBye || match.p2?.isBye);
                                      return (
                                        <div key={mIdx} className="relative py-1">
                                          <div className={`bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm relative z-10 transition-all ${
                                            isByeMatch ? "opacity-0 pointer-events-none select-none invisible" : ""
                                          }`}>
                                            {/* Blue */}
                                            <div className={`p-1.5 border-b border-slate-100 border-l-2 border-l-blue-600 flex justify-between items-center ${
                                              match.winner && match.winner.nama !== match.p1?.nama ? "opacity-30 bg-slate-50" : "bg-blue-50/5"
                                            }`}>
                                              <div className="truncate pr-1">
                                                <span className="font-black text-[9px] uppercase block truncate text-blue-950">
                                                  {match.p1 ? (match.p1.isBye ? "BYE" : match.p1.nama) : "???"}
                                                </span>
                                                <span className="text-[7px] text-blue-800/70 font-semibold block truncate">{match.p1?.kontingen || "-"}</span>
                                              </div>
                                            </div>
                                            {/* Red */}
                                            <div className={`p-1.5 border-l-2 border-l-rose-600 flex justify-between items-center ${
                                              match.winner && match.winner.nama !== match.p2?.nama ? "opacity-30 bg-slate-50" : "bg-rose-50/5"
                                            }`}>
                                              <div className="truncate pr-1">
                                                <span className="font-black text-[9px] uppercase block truncate text-rose-950">
                                                  {match.p2 ? (match.p2.isBye ? "BYE" : match.p2.nama) : "???"}
                                                </span>
                                                <span className="text-[7px] text-rose-800/70 font-semibold block truncate">{match.p2?.kontingen || "-"}</span>
                                              </div>
                                            </div>
                                          </div>

                                          {!isLastRound && (
                                            <>
                                              <div className={`absolute right-[-12px] top-1/2 w-[12px] h-0 border-t border-slate-300 z-0 ${""}`}></div>
                                              <div 
                                                className={`absolute right-[-12px] w-0 border-l border-slate-300 z-0 ${""}`}
                                                style={mIdx % 2 === 0 
                                                  ? { top: "50%", height: `${vStemHeight}px` } 
                                                  : { bottom: "50%", height: `${vStemHeight}px` }
                                                }
                                              ></div>
                                            </>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}

                            {/* Final Winner */}
                            <div className="flex flex-col justify-center" style={{ width: "150px" }}>
                              <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5 text-center space-y-1">
                                <div className="text-amber-800 font-black text-[8px] uppercase tracking-wider border-b border-amber-200 pb-0.5">
                                  🏆 Juara Kelas
                                </div>
                                {bracketData.winner ? (
                                  <div>
                                    <h4 className="font-black text-[10px] text-amber-950 uppercase leading-none">{bracketData.winner.nama}</h4>
                                    <p className="text-[7px] text-amber-700 font-bold mt-1">{bracketData.winner.kontingen}</p>
                                  </div>
                                ) : (
                                  <span className="text-[8px] text-slate-400 font-bold">Menunggu...</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )
                ) : (
                  <div>
                    {/* Header */}
                    <div className="text-center mb-6 border-b-2 border-slate-900 pb-3 w-full">
                      <h1 className="text-xl font-black text-slate-950 uppercase">{selectedClass}</h1>
                      <h2 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                        SISTEM BRACKET BAGAN PERTANDINGAN RESMI - SILAT TOURNAMENT
                      </h2>
                    </div>

                    <div className="flex gap-6 items-stretch py-4 justify-center" style={{ height: `${containerHeight}px` }}>
                      {Array.from({ length: roundsCount }).map((_, rIdx) => {
                        const roundNum = rIdx + 1;
                        const roundMatches = matches[roundNum] || [];
                        const isLastRound = roundNum === roundsCount;
                        const vStemHeight = containerHeight / (roundMatches.length * 2);

                        return (
                          <div key={roundNum} className="flex flex-col relative" style={{ width: "170px" }}>
                            <div className="text-center font-black text-[8px] text-emerald-800 uppercase tracking-wider bg-emerald-50 py-1 rounded border border-emerald-100 mb-2">
                              {getRoundName(roundMatches.length)}
                            </div>

                            <div className="flex-1 flex flex-col justify-around h-full">
                              {roundMatches.map((match, mIdx) => {
                                const isByeMatch = roundNum === 1 && (match.p1?.isBye || match.p2?.isBye);
                                return (
                                  <div key={mIdx} className="relative py-1">
                                    <div className={`bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm relative z-10 transition-all ${
                                      isByeMatch ? "opacity-0 pointer-events-none select-none invisible" : ""
                                    }`}>
                                      {/* Blue */}
                                      <div className={`p-1.5 border-b border-slate-100 border-l-2 border-l-blue-600 flex justify-between items-center ${
                                        match.winner && match.winner.nama !== match.p1?.nama ? "opacity-35 bg-slate-50" : "bg-blue-50/5"
                                      }`}>
                                        <div className="truncate pr-1">
                                          <span className="font-black text-[9px] uppercase block truncate text-blue-950">
                                            {match.p1 ? (match.p1.isBye ? "BYE" : match.p1.nama) : "???"}
                                          </span>
                                          <span className="text-[7px] text-blue-800/70 font-semibold block truncate">{match.p1?.kontingen || "-"}</span>
                                        </div>
                                      </div>
                                      {/* Red */}
                                      <div className={`p-1.5 border-l-2 border-l-rose-600 flex justify-between items-center ${
                                        match.winner && match.winner.nama !== match.p2?.nama ? "opacity-35 bg-slate-50" : "bg-rose-50/5"
                                      }`}>
                                        <div className="truncate pr-1">
                                          <span className="font-black text-[9px] uppercase block truncate text-rose-950">
                                            {match.p2 ? (match.p2.isBye ? "BYE" : match.p2.nama) : "???"}
                                          </span>
                                          <span className="text-[7px] text-rose-800/70 font-semibold block truncate">{match.p2?.kontingen || "-"}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {!isLastRound && (
                                      <>
                                        <div className={`absolute right-[-12px] top-1/2 w-[12px] h-0 border-t border-slate-300 z-0 ${""}`}></div>
                                        <div 
                                          className={`absolute right-[-12px] w-0 border-l border-slate-300 z-0 ${""}`}
                                          style={mIdx % 2 === 0 
                                            ? { top: "50%", height: `${vStemHeight}px` } 
                                            : { bottom: "50%", height: `${vStemHeight}px` }
                                          }
                                        ></div>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {/* Winner Column */}
                      <div className="flex flex-col justify-center" style={{ width: "150px" }}>
                        <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5 text-center space-y-1">
                          <div className="text-amber-800 font-black text-[8px] uppercase tracking-wider border-b border-amber-200 pb-0.5">
                            🏆 Juara Kelas
                          </div>
                          {winner ? (
                            <div>
                              <h4 className="font-black text-[10px] text-amber-950 uppercase leading-none">{winner.nama}</h4>
                              <p className="text-[7px] text-amber-700 font-bold mt-1">{winner.kontingen}</p>
                            </div>
                          ) : (
                            <span className="text-[8px] text-slate-400 font-bold">Menunggu...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Print Scale Recommendation Helper */}
            <div className="mt-4 text-center text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              💡 Tip: Sesuaikan "Skala Print" slider di atas agar bagan tanding pas sempurna di dalam 1 lembar halaman cetak A4 Anda.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

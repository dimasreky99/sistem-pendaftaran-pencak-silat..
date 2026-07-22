import React, { useState, useEffect, useRef } from "react";
import { Scale, Search, CheckCircle, AlertTriangle, ChevronRight, RefreshCw, Clock, Filter, Check, ShieldAlert, Edit3, X, Maximize2 } from "lucide-react";
import { Athlete, Contingent } from "../types";

interface WeighInProps {
  athletes: Athlete[];
  onSaveWeighIn: (
    id: string,
    berat: number,
    status: "PAS" | "OVER" | "UNDER",
    waktuTimbang: string,
    additionalData?: Partial<Athlete>
  ) => void;
  contingents?: Contingent[];
}

function SignatureCanvas({
  label,
  name,
  onChangeName,
  signature,
  onChangeSignature
}: {
  label: string;
  name: string;
  onChangeName: (val: string) => void;
  signature: string;
  onChangeSignature: (val: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoomedCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isZoomDrawing, setIsZoomDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas and draw background grid/line
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, canvas.height - 20);
    ctx.lineTo(canvas.width - 10, canvas.height - 20);
    ctx.stroke();

    ctx.strokeStyle = "#0f172a"; // slate-900
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (signature) {
      const img = new Image();
      img.src = signature;
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
    }
  }, [signature]);

  useEffect(() => {
    if (!isZoomed) return;
    const timer = setTimeout(() => {
      const canvas = zoomedCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw zoomed baseline
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(15, canvas.height - 25);
      ctx.lineTo(canvas.width - 15, canvas.height - 25);
      ctx.stroke();

      if (signature) {
        const img = new Image();
        img.src = signature;
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isZoomed, signature]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    e.preventDefault();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onChangeSignature(canvas.toDataURL());
    }
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      const touch = e.touches[0];
      return {
        x: ((touch.clientX - rect.left) / rect.width) * canvas.width,
        y: ((touch.clientY - rect.top) / rect.height) * canvas.height
      };
    } else {
      return {
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height
      };
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, canvas.height - 20);
    ctx.lineTo(canvas.width - 10, canvas.height - 20);
    ctx.stroke();

    onChangeSignature("");
  };

  // Zoom Drawing Handlers
  const startZoomDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = zoomedCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsZoomDrawing(true);
    const pos = getZoomPos(e);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const drawZoom = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isZoomDrawing) return;
    const canvas = zoomedCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getZoomPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    e.preventDefault();
  };

  const stopZoomDrawing = () => {
    setIsZoomDrawing(false);
  };

  const getZoomPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = zoomedCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      const touch = e.touches[0];
      return {
        x: ((touch.clientX - rect.left) / rect.width) * canvas.width,
        y: ((touch.clientY - rect.top) / rect.height) * canvas.height
      };
    } else {
      return {
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height
      };
    }
  };

  const clearZoomCanvas = () => {
    const canvas = zoomedCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(15, canvas.height - 25);
    ctx.lineTo(canvas.width - 15, canvas.height - 25);
    ctx.stroke();
  };

  const saveZoomSignature = () => {
    const canvas = zoomedCanvasRef.current;
    if (canvas) {
      onChangeSignature(canvas.toDataURL());
    }
    setIsZoomed(false);
  };

  return (
    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider block">{label}</span>
        <button
          type="button"
          onClick={() => setIsZoomed(true)}
          className="text-[9px] font-black text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded transition-all cursor-pointer flex items-center gap-0.5"
        >
          <Maximize2 size={10} /> Perbesar
        </button>
      </div>

      <div className="relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-inner group">
        <canvas
          ref={canvasRef}
          width={400}
          height={180}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-[180px] cursor-crosshair touch-none bg-slate-50/50"
        />

        {!signature && (
          <div 
            onClick={() => setIsZoomed(true)}
            className="absolute inset-0 bg-slate-500/5 backdrop-blur-[0.5px] flex flex-col items-center justify-center text-[10px] font-black text-slate-400 hover:text-indigo-700 transition-all cursor-pointer space-y-1 select-none text-center p-2"
          >
            <span>✍️ SENTUH UNTUK TANDA TANGAN</span>
            <span className="text-[8px] opacity-75 font-bold uppercase tracking-wider">(KLIK UNTUK MEMPERBESAR AREA)</span>
          </div>
        )}

        <button
          type="button"
          onClick={clearCanvas}
          className="absolute right-3 bottom-3 bg-slate-950/80 hover:bg-slate-900 text-[10px] font-black uppercase text-white px-3 py-1.5 rounded-lg border border-slate-800 shadow-sm transition-colors cursor-pointer"
        >
          Hapus Coretan
        </button>
      </div>

      <input
        type="text"
        placeholder={label.toLowerCase().includes("pj") ? "Nama Penanggung Jawab Kontingen..." : "Nama Petugas Timbang..."}
        value={name}
        onChange={(e) => onChangeName(e.target.value)}
        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      />

      {/* Enlarged Full Screen Signature Modal */}
      {isZoomed && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-[4px] flex flex-col items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-slate-100 shadow-2xl space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-slate-150 pb-3">
              <div>
                <span className="text-[10px] uppercase font-black text-indigo-600 tracking-wider">Layar Tanda Tangan Lebar</span>
                <h4 className="font-extrabold text-slate-900 text-base uppercase leading-tight mt-0.5">{label}</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-semibold">
              Gunakan jari atau stylus Anda pada area kotak putih di bawah untuk membubuhkan tanda tangan yang rapi dan detail.
            </p>

            <div className="relative bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 overflow-hidden shadow-inner flex items-center justify-center p-2">
              <canvas
                ref={zoomedCanvasRef}
                width={700}
                height={320}
                onMouseDown={startZoomDrawing}
                onMouseMove={drawZoom}
                onMouseUp={stopZoomDrawing}
                onMouseLeave={stopZoomDrawing}
                onTouchStart={startZoomDrawing}
                onTouchMove={drawZoom}
                onTouchEnd={stopZoomDrawing}
                className="w-full max-w-full h-[320px] bg-white cursor-crosshair touch-none rounded-xl shadow-md border border-slate-200"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={clearZoomCanvas}
                className="bg-slate-100 hover:bg-slate-200 text-rose-600 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Hapus Coretan
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsZoomed(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={saveZoomSignature}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Simpan Tanda Tangan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WeighIn({ athletes, onSaveWeighIn, contingents }: WeighInProps) {
  // Live Clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const formattedTime = currentTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [selectedDetailAthlete, setSelectedDetailAthlete] = useState<Athlete | null>(null);

  // Custom non-blocking notification & modal states to prevent iframe browser blocking
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [customConfirm, setCustomConfirm] = useState<{ title: string; message: string; onConfirm: () => void; onCancel?: () => void } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  
  // Custom states for advanced dual weighing
  const [weighStage, setWeighStage] = useState<"penyisihan" | "semifinal">("penyisihan");
  const [singleWeighMode, setSingleWeighMode] = useState<boolean>(true);

  const [beratPenyisihan, setBeratPenyisihan] = useState("");
  const [namaPjPenyisihan, setNamaPjPenyisihan] = useState("");
  const [namaPetugasPenyisihan, setNamaPetugasPenyisihan] = useState("");
  const [parafPjPenyisihan, setParafPjPenyisihan] = useState("");
  const [parafPetugasPenyisihan, setParafPetugasPenyisihan] = useState("");

  const [beratSemifinal, setBeratSemifinal] = useState("");
  const [namaPjSemifinal, setNamaPjSemifinal] = useState("");
  const [namaPetugasSemifinal, setNamaPetugasSemifinal] = useState("");
  const [parafPjSemifinal, setParafPjSemifinal] = useState("");
  const [parafPetugasSemifinal, setParafPetugasSemifinal] = useState("");

  // Participant List Table States
  const [filterTab, setFilterTab] = useState<"semua" | "belum" | "sudah">("semua");
  const [listSearch, setListSearch] = useState("");

  const handleSearch = (val: string) => {
    setSearchQuery(val);
  };

  // Only validated athletes (isAcc) are eligible to weigh-in
  const eligibleAthletes = athletes.filter(a => a.isAcc);

  // Filter for search lookup in Step 1
  const searchResults = searchQuery.trim().length >= 2
    ? eligibleAthletes.filter(a => 
        (a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.kontingen.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const handleSelectAthlete = (atlet: Athlete) => {
    setSelectedAthlete(atlet);
    setSearchQuery("");
    
    // Auto-fill PJ name from contingent list
    const matchedContingent = contingents?.find(c => c.contingentName === atlet.kontingen);
    const defaultPjName = matchedContingent?.pjName || "";

    // Set states from atlet data
    setBeratPenyisihan(atlet.beratPenyisihan !== undefined ? atlet.beratPenyisihan.toString() : (atlet.beratAktual !== undefined ? atlet.beratAktual.toString() : ""));
    setNamaPjPenyisihan(atlet.namaPjPenyisihan || defaultPjName);
    setNamaPetugasPenyisihan(atlet.namaPetugasPenyisihan || "Petugas Timbang");
    setParafPjPenyisihan(atlet.parafPjPenyisihan || "");
    setParafPetugasPenyisihan(atlet.parafPetugasPenyisihan || "");

    setBeratSemifinal(atlet.beratSemifinal !== undefined ? atlet.beratSemifinal.toString() : "");
    setNamaPjSemifinal(atlet.namaPjSemifinal || defaultPjName);
    setNamaPetugasSemifinal(atlet.namaPetugasSemifinal || "Petugas Timbang");
    setParafPjSemifinal(atlet.parafPjSemifinal || "");
    setParafPetugasSemifinal(atlet.parafPetugasSemifinal || "");
    
    setWeighStage("penyisihan");
  };

  const calculateStatus = (weight: number, athlete: Athlete): "PAS" | "OVER" | "UNDER" => {
    const classStr = athlete.kelas.replace(/ \[(?:Aktual|Validasi):.*?\]/g, "");
    let status: "PAS" | "OVER" | "UNDER" = "PAS";

    const rangeMatch = classStr.match(/(\d+(?:\.\d+)?)\s*kg\s*-\s*(\d+(?:\.\d+)?)\s*kg/i);
    const underMatch = classStr.match(/(?:di bawah|<)\s*(\d+(?:\.\d+)?)\s*kg/i);
    const overMatch = classStr.match(/(?:>|di atas)\s*(\d+(?:\.\d+)?)\s*kg/i);

    if (rangeMatch) {
      const min = parseFloat(rangeMatch[1]);
      const max = parseFloat(rangeMatch[2]);
      if (weight < min) {
        status = "UNDER";
      } else if (weight > max) {
        status = "OVER";
      }
    } else if (underMatch) {
      const limit = parseFloat(underMatch[1]);
      if (weight > limit) {
        status = "OVER";
      }
    } else if (overMatch) {
      const limit = parseFloat(overMatch[1]);
      if (weight < limit) {
        status = "UNDER";
      }
    }
    return status;
  };

  const handleSaveWeighIn = () => {
    if (!selectedAthlete) return;

    const isPenyisihan = weighStage === "penyisihan";
    const weightStr = isPenyisihan ? beratPenyisihan : beratSemifinal;
    const weight = parseFloat(weightStr);

    if (isNaN(weight) || weight <= 0) {
      showToast("Harap masukkan berat badan aktual yang valid!", "error");
      return;
    }

    const currentPjName = isPenyisihan ? namaPjPenyisihan : namaPjSemifinal;
    const currentPetugasName = isPenyisihan ? namaPetugasPenyisihan : namaPetugasSemifinal;
    const currentPjSignature = isPenyisihan ? parafPjPenyisihan : parafPjSemifinal;
    const currentPetugasSignature = isPenyisihan ? parafPetugasPenyisihan : parafPetugasSemifinal;

    if (!currentPjName.trim() || !currentPetugasName.trim()) {
      showToast("Harap isi nama penanggung jawab dan petugas timbang!", "error");
      return;
    }

    const proceedToSave = () => {
      const status = calculateStatus(weight, selectedAthlete);

      const waktuString = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }) + ", " + new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });

      // Build the additional payload
      const additionalData: Partial<Athlete> = {};

      if (isPenyisihan) {
        additionalData.beratPenyisihan = weight;
        additionalData.statusPenyisihan = status;
        additionalData.waktuPenyisihan = waktuString;
        additionalData.namaPjPenyisihan = currentPjName;
        additionalData.namaPetugasPenyisihan = currentPetugasName;
        additionalData.parafPjPenyisihan = currentPjSignature;
        additionalData.parafPetugasPenyisihan = currentPetugasSignature;

        // In penyisihan mode, if singleWeighMode is enabled, propagate to Semifinal/Final too
        if (singleWeighMode) {
          additionalData.beratSemifinal = weight;
          additionalData.statusSemifinal = status;
          additionalData.waktuSemifinal = waktuString;
          additionalData.namaPjSemifinal = currentPjName;
          additionalData.namaPetugasSemifinal = currentPetugasName;
          additionalData.parafPjSemifinal = currentPjSignature;
          additionalData.parafPetugasSemifinal = currentPetugasSignature;
        }
      } else {
        // Semifinal
        additionalData.beratSemifinal = weight;
        additionalData.statusSemifinal = status;
        additionalData.waktuSemifinal = waktuString;
        additionalData.namaPjSemifinal = currentPjName;
        additionalData.namaPetugasSemifinal = currentPetugasName;
        additionalData.parafPjSemifinal = currentPjSignature;
        additionalData.parafPetugasSemifinal = currentPetugasSignature;

        // If singleWeighMode is enabled, propagate back to Penyisihan too
        if (singleWeighMode) {
          additionalData.beratPenyisihan = weight;
          additionalData.statusPenyisihan = status;
          additionalData.waktuPenyisihan = waktuString;
          additionalData.namaPjPenyisihan = currentPjName;
          additionalData.namaPetugasPenyisihan = currentPetugasName;
          additionalData.parafPjPenyisihan = currentPjSignature;
          additionalData.parafPetugasPenyisihan = currentPetugasSignature;
        }
      }

      // Determine the final status to expose to the overall application
      const overallWeight = additionalData.beratSemifinal !== undefined ? additionalData.beratSemifinal : (additionalData.beratPenyisihan || weight);
      const overallStatus = (additionalData.statusSemifinal !== undefined ? additionalData.statusSemifinal : (additionalData.statusPenyisihan || status)) as "PAS" | "OVER" | "UNDER";
      const overallWaktu = additionalData.waktuSemifinal !== undefined ? additionalData.waktuSemifinal : (additionalData.waktuPenyisihan || waktuString);

      const confirmAndSave = () => {
        onSaveWeighIn(selectedAthlete.id, overallWeight, overallStatus, overallWaktu, additionalData);
        showToast(`Berhasil menyimpan data timbang badan ${isPenyisihan ? "Penyisihan" : "Semifinal"} untuk ${selectedAthlete.name}!`, "success");
        resetState();
      };

      if (status !== "PAS") {
        const confirmText = `Berat badan aktual atlet (${weight} kg) tidak sesuai dengan kualifikasi kelasnya: ${status === "OVER" ? "BERLEBIH (OVER)" : "KURANG (UNDER)"}.\n\nTetap simpan hasil timbangan? (Atlet akan berstatus Diskualifikasi di Jadwal)`;
        setCustomConfirm({
          title: "Peringatan Berat Badan!",
          message: confirmText,
          onConfirm: confirmAndSave
        });
      } else {
        confirmAndSave();
      }
    };

    if (!currentPjSignature || !currentPetugasSignature) {
      setCustomConfirm({
        title: "Tanda Tangan Belum Lengkap",
        message: "Paraf / Tanda Tangan penanggung jawab atau petugas belum terisi di atas canvas.\n\nTetap simpan data timbang tanpa paraf?",
        onConfirm: proceedToSave
      });
    } else {
      proceedToSave();
    }
  };

  const resetState = () => {
    setSelectedAthlete(null);
    setBeratPenyisihan("");
    setBeratSemifinal("");
    setNamaPjPenyisihan("");
    setNamaPetugasPenyisihan("");
    setParafPjPenyisihan("");
    setParafPetugasPenyisihan("");
    setNamaPjSemifinal("");
    setNamaPetugasSemifinal("");
    setParafPjSemifinal("");
    setParafPetugasSemifinal("");
  };

  // Participant list calculations
  const totalCount = eligibleAthletes.length;
  const sudahCount = eligibleAthletes.filter(a => !!a.statusTimbang).length;
  const belumCount = eligibleAthletes.filter(a => !a.statusTimbang).length;

  const filteredAthletesList = eligibleAthletes.filter(a => {
    const matchesSearch = 
      a.name.toLowerCase().includes(listSearch.toLowerCase()) ||
      a.kontingen.toLowerCase().includes(listSearch.toLowerCase()) ||
      a.kelas.toLowerCase().includes(listSearch.toLowerCase()) ||
      (a.statusTimbang || "belum").toLowerCase().includes(listSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === "belum") {
      return !a.statusTimbang;
    }
    if (filterTab === "sudah") {
      return !!a.statusTimbang;
    }
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* HEADER WITH REAL-TIME CLOCK */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl border border-slate-800">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="bg-emerald-500 p-3.5 rounded-2xl text-slate-900 shadow-lg shadow-emerald-500/20">
            <Scale size={28} className="animate-pulse" />
          </div>
          <div>
            <h2 className="font-black text-xl md:text-2xl tracking-tight uppercase">
              Modul Timbang Badan Real-Time
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Data berat badan aktual sinkron otomatis ke jadwal dan mengontrol status diskualifikasi peserta.
            </p>
          </div>
        </div>
        
        {/* Real-time Clock Display */}
        <div className="bg-slate-800/80 border border-slate-700/60 px-5 py-3 rounded-2xl flex items-center gap-3.5 shrink-0 shadow-inner">
          <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400">
            <Clock size={20} />
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">{formattedDate}</div>
            <div className="font-mono font-black text-emerald-400 text-lg tracking-widest">{formattedTime}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUMN 1: WEIGH-IN INTERACTION FORM (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Scale size={16} className="text-emerald-600" />
              Proses Timbangan Baru
            </h3>

            {/* Select Athlete lookup input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">1. Cari & Pilih Atlet Terdaftar</label>
              <div className="relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ketik nama atau kontingen..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Search results popup list */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl max-h-56 overflow-y-auto shadow-xl z-30 divide-y divide-slate-100 p-1">
                  <div className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-wider bg-slate-50 rounded-lg mb-1">
                    Hasil Pencarian ({searchResults.length} Atlet)
                  </div>
                  {searchResults.map((atlet) => (
                    <div
                      key={atlet.id}
                      onClick={() => handleSelectAthlete(atlet)}
                      className="px-3.5 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-left rounded-lg transition-colors"
                    >
                      <div>
                        <div className="font-black text-slate-900 text-xs uppercase">{atlet.name}</div>
                        <div className="text-[10px] text-slate-500 font-bold mt-0.5">{atlet.kontingen} • {atlet.kelas.replace(/ \[(?:Aktual|Validasi):.*?\]/g, "")}</div>
                      </div>
                      <ChevronRight size={14} className="text-slate-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Athlete details & machine scale interface */}
            {selectedAthlete ? (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Status Atlet</span>
                    <h4 className="font-black text-emerald-800 text-sm uppercase leading-tight">{selectedAthlete.name}</h4>
                    <div className="text-[10px] text-slate-500 mt-1 font-bold">{selectedAthlete.kontingen}</div>
                  </div>
                  <button 
                    onClick={resetState}
                    className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold px-2 py-1 rounded shadow-sm transition-colors"
                  >
                    Ganti
                  </button>
                </div>

                {/* Range config card */}
                <div className="space-y-1 bg-white p-3.5 rounded-xl border border-slate-150">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Kategori & Batas Berat</span>
                  <strong className="text-slate-900 text-xs font-black block uppercase">
                    {selectedAthlete.kategori}
                  </strong>
                  <span className="text-xs text-blue-700 font-bold block mt-0.5">
                    {selectedAthlete.kelas.replace(/ \[(?:Aktual|Validasi):.*?\]/g, "")}
                  </span>
                </div>

                {/* Dual Stage / Step Timbang */}
                <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-slate-150">
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Tahap Timbang Badan</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setWeighStage("penyisihan")}
                      className={`py-2 px-3 rounded-lg text-xs font-extrabold uppercase tracking-wide border transition-all ${
                        weighStage === "penyisihan"
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      1. Penyisihan
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeighStage("semifinal")}
                      className={`py-2 px-3 rounded-lg text-xs font-extrabold uppercase tracking-wide border transition-all ${
                        weighStage === "semifinal"
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      2. Semifinal / Final
                    </button>
                  </div>

                  {/* Single weigh check */}
                  <label className="flex items-center gap-2 mt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={singleWeighMode}
                      onChange={(e) => setSingleWeighMode(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-[10px] font-bold text-slate-600 uppercase">
                      Timbang 1x (Penyisihan Mengikuti Semifinal)
                    </span>
                  </label>
                </div>

                {/* Weigh-in input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Masukkan Berat {weighStage === "penyisihan" ? "Penyisihan" : "Semifinal"} (kg)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      autoFocus
                      placeholder="Contoh: 42.5"
                      value={weighStage === "penyisihan" ? beratPenyisihan : beratSemifinal}
                      onChange={(e) => {
                        if (weighStage === "penyisihan") {
                          setBeratPenyisihan(e.target.value);
                          if (singleWeighMode) setBeratSemifinal(e.target.value);
                        } else {
                          setBeratSemifinal(e.target.value);
                          if (singleWeighMode) setBeratPenyisihan(e.target.value);
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-white border-2 border-emerald-500 rounded-xl font-black text-lg text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                    <span className="bg-emerald-600 text-white font-black text-sm px-4 flex items-center justify-center rounded-xl shrink-0">
                      KG
                    </span>
                  </div>
                </div>

                {/* Double Signature & Names Form */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <SignatureCanvas
                    label="1. PJ Kontingen"
                    name={weighStage === "penyisihan" ? namaPjPenyisihan : namaPjSemifinal}
                    onChangeName={(val) => {
                      if (weighStage === "penyisihan") {
                        setNamaPjPenyisihan(val);
                        if (singleWeighMode) setNamaPjSemifinal(val);
                      } else {
                        setNamaPjSemifinal(val);
                        if (singleWeighMode) setNamaPjPenyisihan(val);
                      }
                    }}
                    signature={weighStage === "penyisihan" ? parafPjPenyisihan : parafPjSemifinal}
                    onChangeSignature={(val) => {
                      if (weighStage === "penyisihan") {
                        setParafPjPenyisihan(val);
                        if (singleWeighMode) setParafPjSemifinal(val);
                      } else {
                        setParafPjSemifinal(val);
                        if (singleWeighMode) setParafPjPenyisihan(val);
                      }
                    }}
                  />

                  <SignatureCanvas
                    label="2. Petugas Timbang"
                    name={weighStage === "penyisihan" ? namaPetugasPenyisihan : namaPetugasSemifinal}
                    onChangeName={(val) => {
                      if (weighStage === "penyisihan") {
                        setNamaPetugasPenyisihan(val);
                        if (singleWeighMode) setNamaPetugasSemifinal(val);
                      } else {
                        setNamaPetugasSemifinal(val);
                        if (singleWeighMode) setNamaPetugasPenyisihan(val);
                      }
                    }}
                    signature={weighStage === "penyisihan" ? parafPetugasPenyisihan : parafPetugasSemifinal}
                    onChangeSignature={(val) => {
                      if (weighStage === "penyisihan") {
                        setParafPetugasPenyisihan(val);
                        if (singleWeighMode) setParafPetugasSemifinal(val);
                      } else {
                        setParafPetugasSemifinal(val);
                        if (singleWeighMode) setParafPetugasPenyisihan(val);
                      }
                    }}
                  />
                </div>

                {/* Already weighed warning */}
                {selectedAthlete.beratAktual && (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2 text-xs font-semibold text-amber-800 leading-normal">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-600" />
                    <span>
                      <strong className="font-extrabold">Sudah Timbang:</strong> Atlet ini memiliki rekam timbang <strong className="font-black underline">{selectedAthlete.beratAktual} kg</strong> ({selectedAthlete.statusTimbang}). Input ulang akan menimpa rekam sebelumnya.
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSaveWeighIn}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3.5 rounded-xl transition-all shadow-md shadow-emerald-950/20 text-center uppercase tracking-wider"
                  >
                    💾 Simpan & Sinkronkan
                  </button>
                  <button
                    onClick={resetState}
                    className="bg-white hover:bg-slate-100 text-slate-600 font-bold text-xs px-4 rounded-xl transition-all border border-slate-200"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 space-y-2.5">
                <Scale className="mx-auto text-slate-300 animate-bounce" size={32} />
                <p className="text-xs font-bold text-slate-500">Belum ada atlet yang dipilih</p>
                <p className="text-[10px] text-slate-400">Silakan cari nama atlet di atas, atau klik tombol "PILIH" pada tabel di sebelah kanan.</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: FULL PARTICIPANT WEIGH-IN STATUS DATA (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-5 lg:p-6 shadow-sm border border-slate-100 space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                  Daftar Peserta & Rekam Timbangan
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  Menampilkan seluruh data atlet tervalidasi beserta status timbang & waktu detilnya.
                </p>
              </div>
              
              {/* Reset/Refresh button */}
              <button 
                onClick={() => {
                  setListSearch("");
                  setFilterTab("semua");
                }}
                title="Reset Filter"
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => setFilterTab("semua")}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  filterTab === "semua"
                    ? "bg-slate-950 border-slate-950 text-white shadow-md shadow-slate-950/10"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                }`}
              >
                <div className="text-[9px] font-black uppercase opacity-75">Semua Atlet</div>
                <div className="text-lg font-black mt-1">{totalCount}</div>
              </button>

              <button
                onClick={() => setFilterTab("sudah")}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  filterTab === "sudah"
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-950/15"
                    : "bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50 text-emerald-900"
                }`}
              >
                <div className="text-[9px] font-black uppercase opacity-75">Sudah Timbang</div>
                <div className="text-lg font-black mt-1 flex items-center gap-1.5">
                  {sudahCount}
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md font-bold">
                    {totalCount > 0 ? Math.round((sudahCount / totalCount) * 100) : 0}%
                  </span>
                </div>
              </button>

              <button
                onClick={() => setFilterTab("belum")}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  filterTab === "belum"
                    ? "bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-950/15"
                    : "bg-rose-50/40 border-rose-100 hover:bg-rose-50 text-rose-900"
                }`}
              >
                <div className="text-[9px] font-black uppercase opacity-75">Belum Timbang</div>
                <div className="text-lg font-black mt-1 flex items-center gap-1.5">
                  {belumCount}
                  <span className="text-[10px] bg-rose-950/10 text-rose-700 px-1.5 py-0.5 rounded-md font-bold">
                    {belumCount} Atlet
                  </span>
                </div>
              </button>
            </div>

            {/* List Search Bar */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, kontingen, kategori, atau status..."
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* Athletes Table View */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-inner max-h-[480px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Nama / Kontingen</th>
                    <th className="py-3 px-3">Kelas / Batas</th>
                    <th className="py-3 px-3 text-center">Hasil Aktual</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3">Petugas Timbang</th>
                    <th className="py-3 px-3">Waktu Timbang</th>
                    <th className="py-3 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredAthletesList.length > 0 ? (
                    filteredAthletesList.map((atlet) => {
                      const weightsClean = atlet.kelas.replace(/ \[(?:Aktual|Validasi):.*?\]/g, "");
                      return (
                        <tr key={atlet.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Name / Contingent */}
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-slate-900 uppercase text-xs">
                              {atlet.name}
                            </div>
                            <div className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">
                              {atlet.kontingen}
                            </div>
                          </td>

                          {/* Class / Limits */}
                          <td className="py-3.5 px-3">
                            <div className="font-black text-slate-700 text-[10px]">
                              {atlet.kategori}
                            </div>
                            <div className="text-[9px] text-blue-600 font-bold mt-0.5">
                              {weightsClean}
                            </div>
                          </td>

                          {/* Actual weight */}
                          <td className="py-3.5 px-3 text-center font-black text-slate-900 text-xs">
                            {atlet.beratAktual !== undefined ? (
                              <span className="bg-slate-100 px-2 py-1 rounded-md">
                                {atlet.beratAktual} kg
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>

                          {/* Weigh-in status badge */}
                          <td className="py-3.5 px-3 text-center">
                            {atlet.statusTimbang === "PAS" && (
                              <span className="px-2 py-1 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wide flex items-center justify-center gap-0.5 w-18 mx-auto">
                                <Check size={10} className="stroke-[3]" /> PAS
                              </span>
                            )}
                            {atlet.statusTimbang === "OVER" && (
                              <span className="px-2 py-1 rounded-full text-[9px] font-black bg-rose-100 text-rose-800 uppercase tracking-wide flex items-center justify-center gap-0.5 w-18 mx-auto">
                                <ShieldAlert size={10} /> OVER
                              </span>
                            )}
                            {atlet.statusTimbang === "UNDER" && (
                              <span className="px-2 py-1 rounded-full text-[9px] font-black bg-amber-100 text-amber-800 uppercase tracking-wide flex items-center justify-center gap-0.5 w-18 mx-auto">
                                <ShieldAlert size={10} /> UNDER
                              </span>
                            )}
                            {!atlet.statusTimbang && (
                              <span className="px-2 py-1 rounded-full text-[9px] font-black bg-slate-100 text-slate-400 uppercase tracking-wide flex items-center justify-center w-18 mx-auto">
                                BELUM
                              </span>
                            )}
                          </td>

                          {/* Petugas Timbang */}
                          <td className="py-3.5 px-3 font-bold text-slate-700 text-xs">
                            {atlet.namaPetugasPenyisihan || atlet.namaPetugasSemifinal || (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>

                          {/* Weight date / timestamp */}
                          <td className="py-3.5 px-3 font-medium text-slate-500 text-[10px] leading-relaxed">
                            {atlet.waktuTimbang ? (
                              <div>
                                {atlet.waktuTimbang.split(", ").map((part, idx) => (
                                  <div key={idx} className={idx === 1 ? "font-mono text-emerald-600 font-bold" : ""}>
                                    {part}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-300">Belum Ditimbang</span>
                            )}
                          </td>

                          {/* Select Action button */}
                          <td className="py-3.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleSelectAthlete(atlet)}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase tracking-wider ${
                                  selectedAthlete?.id === atlet.id
                                    ? "bg-emerald-600 text-white"
                                    : "bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 cursor-pointer"
                                }`}
                              >
                                PILIH
                              </button>
                              <button
                                onClick={() => setSelectedDetailAthlete(atlet)}
                                className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase tracking-wider cursor-pointer"
                              >
                                DETAIL
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        Tidak ada atlet tervalidasi yang cocok dengan pencarian / tab ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Hint alert box */}
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex items-start gap-3 text-xs leading-normal font-semibold text-slate-600">
              <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-slate-800">Catatan Diskualifikasi Otomatis:</p>
                <p className="mt-0.5 opacity-90">
                  Sesuai regulasi, atlet yang <strong className="text-slate-900 font-extrabold">belum ditimbang</strong> atau berstatus <strong className="text-rose-600 font-extrabold">OVER / UNDER</strong> berat kelasnya akan ditandai diskualifikasi di jadwal & bagan bracket secara real-time.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Custom Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-5 py-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 animate-slideIn max-w-sm">
          <div className={`p-1.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : toast.type === 'error' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'}`}>
            <Check size={16} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500">Sistem Timbang</p>
            <p className="text-xs font-bold text-slate-100 mt-0.5">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal */}
      {customConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4 animate-scaleUp text-left">
            <div className="flex items-center gap-3 text-amber-600">
              <ShieldAlert size={24} />
              <h4 className="font-black text-slate-900 text-base uppercase tracking-tight">{customConfirm.title}</h4>
            </div>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed whitespace-pre-line">
              {customConfirm.message}
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  customConfirm.onConfirm();
                  setCustomConfirm(null);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-3 rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
              >
                Ya, Lanjutkan
              </button>
              <button
                type="button"
                onClick={() => {
                  if (customConfirm.onCancel) customConfirm.onCancel();
                  setCustomConfirm(null);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black py-3 rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Hasil Timbang & Tanda Tangan Modal */}
      {selectedDetailAthlete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-slate-100 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-left animate-scaleUp">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-black text-indigo-600 tracking-wider">Detail Hasil Timbang Badan</span>
                <h3 className="font-extrabold text-slate-900 text-lg uppercase leading-tight mt-0.5">{selectedDetailAthlete.name}</h3>
                <p className="text-xs text-slate-500 font-bold mt-1 uppercase">Kontingen: {selectedDetailAthlete.kontingen}</p>
              </div>
              <button
                onClick={() => setSelectedDetailAthlete(null)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-150">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Kategori Pertandingan</span>
                <span className="text-xs text-slate-800 font-black uppercase">{selectedDetailAthlete.kategori}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Kelas / Batasan Berat</span>
                <span className="text-xs text-indigo-700 font-black uppercase">{selectedDetailAthlete.kelas.replace(/ \[(?:Aktual|Validasi):.*?\]/g, "")}</span>
              </div>
            </div>

            {/* Weigh-in Stages Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Penyisihan Card */}
              <div className="border border-slate-200 rounded-2xl p-4.5 space-y-3.5 bg-white shadow-sm">
                <h4 className="font-extrabold text-xs text-slate-900 uppercase border-b border-slate-100 pb-1.5 flex justify-between items-center">
                  <span>1. TAHAP PENYISIHAN</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                    selectedDetailAthlete.statusPenyisihan === "PAS" ? "bg-emerald-100 text-emerald-800" :
                    selectedDetailAthlete.statusPenyisihan ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-400"
                  }`}>
                    {selectedDetailAthlete.statusPenyisihan || "BELUM TIMBANG"}
                  </span>
                </h4>

                {selectedDetailAthlete.beratPenyisihan !== undefined ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block">Berat Aktual</span>
                        <strong className="text-slate-800 font-extrabold text-sm">{selectedDetailAthlete.beratPenyisihan} kg</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block">Waktu Timbang</span>
                        <span className="text-slate-600 font-semibold text-[10px]">{selectedDetailAthlete.waktuPenyisihan || "—"}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 border-t border-slate-100 pt-3">
                      <div className="space-y-1">
                        <span className="text-[8px] text-slate-400 font-extrabold block uppercase">Paraf PJ Kontingen</span>
                        <div className="h-16 border border-slate-150 rounded-lg flex items-center justify-center bg-slate-50 overflow-hidden p-1">
                          {selectedDetailAthlete.parafPjPenyisihan ? (
                            <img src={selectedDetailAthlete.parafPjPenyisihan} alt="Paraf PJ" className="max-h-full max-w-full object-contain" />
                          ) : (
                            <span className="text-[8px] text-slate-400 font-bold text-center">TIDAK ADA PARAF</span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-800 font-black block text-center truncate">{selectedDetailAthlete.namaPjPenyisihan || "—"}</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[8px] text-slate-400 font-extrabold block uppercase">Paraf Petugas Timbang</span>
                        <div className="h-16 border border-slate-150 rounded-lg flex items-center justify-center bg-slate-50 overflow-hidden p-1">
                          {selectedDetailAthlete.parafPetugasPenyisihan ? (
                            <img src={selectedDetailAthlete.parafPetugasPenyisihan} alt="Paraf Petugas" className="max-h-full max-w-full object-contain" />
                          ) : (
                            <span className="text-[8px] text-slate-400 font-bold text-center">TIDAK ADA PARAF</span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-800 font-black block text-center truncate">{selectedDetailAthlete.namaPetugasPenyisihan || "—"}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-xs text-slate-400 py-6">Belum melakukan timbang badan penyisihan.</p>
                )}
              </div>

              {/* Semifinal/Final Card */}
              <div className="border border-slate-200 rounded-2xl p-4.5 space-y-3.5 bg-white shadow-sm">
                <h4 className="font-extrabold text-xs text-slate-900 uppercase border-b border-slate-100 pb-1.5 flex justify-between items-center">
                  <span>2. SEMIFINAL / FINAL</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                    selectedDetailAthlete.statusSemifinal === "PAS" ? "bg-emerald-100 text-emerald-800" :
                    selectedDetailAthlete.statusSemifinal ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-400"
                  }`}>
                    {selectedDetailAthlete.statusSemifinal || "BELUM TIMBANG"}
                  </span>
                </h4>

                {selectedDetailAthlete.beratSemifinal !== undefined ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block">Berat Aktual</span>
                        <strong className="text-slate-800 font-extrabold text-sm">{selectedDetailAthlete.beratSemifinal} kg</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block">Waktu Timbang</span>
                        <span className="text-slate-600 font-semibold text-[10px]">{selectedDetailAthlete.waktuSemifinal || "—"}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 border-t border-slate-100 pt-3">
                      <div className="space-y-1">
                        <span className="text-[8px] text-slate-400 font-extrabold block uppercase">Paraf PJ Kontingen</span>
                        <div className="h-16 border border-slate-150 rounded-lg flex items-center justify-center bg-slate-50 overflow-hidden p-1">
                          {selectedDetailAthlete.parafPjSemifinal ? (
                            <img src={selectedDetailAthlete.parafPjSemifinal} alt="Paraf PJ" className="max-h-full max-w-full object-contain" />
                          ) : (
                            <span className="text-[8px] text-slate-400 font-bold text-center">TIDAK ADA PARAF</span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-800 font-black block text-center truncate">{selectedDetailAthlete.namaPjSemifinal || "—"}</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[8px] text-slate-400 font-extrabold block uppercase">Paraf Petugas Timbang</span>
                        <div className="h-16 border border-slate-150 rounded-lg flex items-center justify-center bg-slate-50 overflow-hidden p-1">
                          {selectedDetailAthlete.parafPetugasSemifinal ? (
                            <img src={selectedDetailAthlete.parafPetugasSemifinal} alt="Paraf Petugas" className="max-h-full max-w-full object-contain" />
                          ) : (
                            <span className="text-[8px] text-slate-400 font-bold text-center">TIDAK ADA PARAF</span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-800 font-black block text-center truncate">{selectedDetailAthlete.namaPetugasSemifinal || "—"}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-xs text-slate-400 py-6">Belum melakukan timbang badan semifinal/final.</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedDetailAthlete(null)}
                className="bg-slate-950 hover:bg-slate-900 text-white font-black text-xs px-6 py-3 rounded-xl uppercase tracking-wider transition-all cursor-pointer"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

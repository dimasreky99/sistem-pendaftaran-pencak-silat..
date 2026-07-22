export interface ClassConfig {
  name: string;
  active: boolean;
  pa: boolean; // For boys/men
  pi: boolean; // For girls/women
}

export interface CategoryConfig {
  active: boolean;
  isBebas: boolean; // Is custom/free text instead of predefined classes
  classes: ClassConfig[];
  minYear?: number;
  maxYear?: number;
}

export interface SystemSettings {
  regStatus: "ON" | "OFF";
  regStart: string;
  regEnd: string;
  eventTitle: string;
  matchType: "Keduanya" | "Prestasi" | "Pemasalan";
  isFree: boolean;
  logoUrl: string;
  idCardBg: string;
  idCardBgColor: string; // fallback color theme
  categoryPrices: Record<string, number>;
  paymentInfo: string;
  qrisPhotoUrl?: string;
  signatureUrl?: string;
  stampUrl?: string;
  treasurerName?: string;
  invoiceCounter?: number;
  customFields: string[];
  photoLabels: string[];
  standardFieldLabels?: Record<string, string>;
  classData: Record<string, CategoryConfig>;
  eventStartDate?: string;
  eventEndDate?: string;
  adminWaNumber?: string;
  bestFighterScheme?: "Prestasi" | "Pemasalan" | "Keduanya" | "Per Kategori Umur";
}

export interface Contingent {
  id: string; // unique ID or username
  pjName: string;
  nowa: string;
  contingentName: string;
  username: string;
  passwordHash: string;
  role: "admin" | "kontingen";
  paymentStatus: "Lunas" | "Belum Lunas";
  buktiTransferUrl: string; // Base64 data or image link
  kodeUnik: number; // Unique payment suffix code
  customInvoiceNumber?: string;
  photoUrl?: string; // Optional Profile Photo URL / Base64
  managerPhotoUrl?: string;
  official1Name?: string;
  official1PhotoUrl?: string;
  official2Name?: string;
  official2PhotoUrl?: string;
  nominalRevisi?: number; // Overridden payment amount
}

export interface Athlete {
  id: string; // unique number
  name: string;
  nik: string;
  tglLahir: string;
  jk: "Putra" | "Putri";
  kategori: string; // e.g. "Remaja"
  kelas: string; // e.g. "Kelas A (39 kg - 43 kg)"
  kontingen: string;
  nowa: string;
  customData: string[]; // custom fields responses
  fotos: string[]; // Base64 strings matching photoLabels
  isAcc: boolean;
  revisiCatatan?: string; // notes if rejected/needs revision
  beratAktual?: number;
  statusTimbang?: "PAS" | "OVER" | "UNDER" | "BELUM" | "";
  waktuTimbang?: string;
  // Penyisihan Weigh In
  beratPenyisihan?: number;
  statusPenyisihan?: "PAS" | "OVER" | "UNDER" | "BELUM" | "";
  waktuPenyisihan?: string;
  namaPjPenyisihan?: string;
  namaPetugasPenyisihan?: string;
  parafPjPenyisihan?: string; // Base64 signature
  parafPetugasPenyisihan?: string; // Base64 signature
  // Semifinal/Final Weigh In
  beratSemifinal?: number;
  statusSemifinal?: "PAS" | "OVER" | "UNDER" | "BELUM" | "";
  waktuSemifinal?: string;
  namaPjSemifinal?: string;
  namaPetugasSemifinal?: string;
  parafPjSemifinal?: string; // Base64 signature
  parafPetugasSemifinal?: string; // Base64 signature
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  detail: string;
}

// Bracket Models
export interface Competitor {
  nama: string;
  kontingen: string;
  isBye?: boolean;
  isPlaceholder?: boolean;
  isFlickering?: boolean;
}

export interface MatchNode {
  round: number;
  matchIndex: number;
  matchNumber?: string;
  p1: Competitor | null;
  p2: Competitor | null;
  score1?: number;
  score2?: number;
  winner?: Competitor;
}

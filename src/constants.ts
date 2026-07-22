import { SystemSettings, Contingent, Athlete, ActivityLog } from "./types";

export const DEFAULT_KELAS_IPSI: Record<string, any> = {
  "Pra Usia Dini": {
    active: true,
    isBebas: false,
    minYear: 2019,
    maxYear: 2021,
    classes: [
      { name: "Jurus Tunggal Bebas", active: true, pa: true, pi: true }
    ]
  },
  "Usia Dini 1": {
    active: true,
    isBebas: false,
    minYear: 2016,
    maxYear: 2018,
    classes: [
      { name: "Tanding (Sesuai Usia/TB/BB)", active: true, pa: true, pi: true },
      { name: "Jurus Tunggal Tangan Kosong", active: true, pa: true, pi: true },
      { name: "Jurus Tunggal Senjata (Toya dan Golok)", active: true, pa: true, pi: true },
      { name: "Jurus Tunggal Bebas Tangan Kosong", active: true, pa: true, pi: true }
    ]
  },
  "Usia Dini 2": {
    active: true,
    isBebas: false,
    minYear: 2014,
    maxYear: 2015,
    classes: [
      { name: "Kelas A (26 kg - 28 kg)", active: true, pa: true, pi: true },
      { name: "Kelas B (28 kg - 30 kg)", active: true, pa: true, pi: true },
      { name: "Kelas C (30 kg - 32 kg)", active: true, pa: true, pi: true },
      { name: "Kelas D (32 kg - 34 kg)", active: true, pa: true, pi: true },
      { name: "Kelas E (34 kg - 36 kg)", active: true, pa: true, pi: true },
      { name: "Kelas F (36 kg - 38 kg)", active: true, pa: true, pi: true },
      { name: "Kelas G (38 kg - 40 kg)", active: true, pa: true, pi: true },
      { name: "Kelas H (40 kg - 42 kg)", active: true, pa: true, pi: true },
      { name: "Kelas I (42 kg - 44 kg)", active: true, pa: true, pi: true },
      { name: "Kelas J (44 kg - 46 kg)", active: true, pa: true, pi: true },
      { name: "Kelas K (46 kg - 48 kg)", active: true, pa: true, pi: true },
      { name: "Kelas L (48 kg - 50 kg)", active: true, pa: true, pi: true },
      { name: "Kelas M (50 kg - 52 kg)", active: true, pa: true, pi: true },
      { name: "Kelas N (52 kg - 54 kg)", active: true, pa: true, pi: true },
      { name: "Kelas O (54 kg - 56 kg)", active: true, pa: true, pi: true },
      { name: "Kelas P (56 kg - 58 kg)", active: true, pa: true, pi: true },
      { name: "Kelas Q (58 kg - 60 kg)", active: true, pa: true, pi: true },
      { name: "Kelas R (60 kg - 62 kg)", active: true, pa: true, pi: true },
      { name: "Kelas S (62 kg - 64 kg)", active: true, pa: true, pi: true },
      { name: "Kelas Open (64 kg - 68 kg)", active: true, pa: true, pi: true },
      { name: "Jurus Tunggal Tangan Kosong", active: true, pa: true, pi: true },
      { name: "Jurus Tunggal Senjata (Toya dan Golok)", active: true, pa: true, pi: true },
      { name: "Jurus Tunggal", active: true, pa: true, pi: true },
      { name: "Jurus Tunggal Bebas Tangan Kosong", active: true, pa: true, pi: true },
      { name: "Jurus Tunggal Bebas Senjata", active: true, pa: true, pi: true },
      { name: "Jurus Tunggal Bebas", active: true, pa: true, pi: true },
      { name: "Jurus Ganda Tangan Kosong", active: true, pa: true, pi: true },
      { name: "Jurus Regu A 1 - 6", active: true, pa: true, pi: true }
    ]
  },
  "Pra Remaja": {
    active: true,
    isBebas: false,
    minYear: 2011,
    maxYear: 2013,
    classes: [
      { name: "Kelas A (30 kg - 33 kg)", active: true, pa: true, pi: true },
      { name: "Kelas B (33 kg - 36 kg)", active: true, pa: true, pi: true },
      { name: "Kelas C (36 kg - 39 kg)", active: true, pa: true, pi: true },
      { name: "Kelas D (39 kg - 42 kg)", active: true, pa: true, pi: true },
      { name: "Kelas E (42 kg - 45 kg)", active: true, pa: true, pi: true },
      { name: "Kelas F (45 kg - 48 kg)", active: true, pa: true, pi: true },
      { name: "Kelas G (48 kg - 51 kg)", active: true, pa: true, pi: true },
      { name: "Kelas H (51 kg - 54 kg)", active: true, pa: true, pi: true },
      { name: "Kelas I (54 kg - 57 kg)", active: true, pa: true, pi: true },
      { name: "Kelas J (57 kg - 60 kg)", active: true, pa: true, pi: true },
      { name: "Kelas K (60 kg - 63 kg)", active: true, pa: true, pi: true },
      { name: "Kelas L (63 kg - 66 kg)", active: true, pa: true, pi: true },
      { name: "Kelas M (66 kg - 69 kg)", active: true, pa: true, pi: true },
      { name: "Kelas N (69 kg - 72 kg)", active: true, pa: true, pi: true },
      { name: "Kelas O (72 kg - 75 kg)", active: true, pa: true, pi: true },
      { name: "Kelas P (75 kg - 78 kg)", active: true, pa: true, pi: true },
      { name: "Kelas Open (78 kg - 84 kg)", active: true, pa: true, pi: true },
      { name: "Jurus Tunggal Tangan Kosong", active: true, pa: true, pi: true },
      { name: "Jurus Tunggal Senjata (Toya dan Golok)", active: true, pa: true, pi: true },
      { name: "Jurus Tunggal", active: true, pa: true, pi: true },
      { name: "Jurus Tunggal Bebas Tangan Kosong", active: true, pa: true, pi: true },
      { name: "Jurus Tunggal Bebas Senjata", active: true, pa: true, pi: true },
      { name: "Jurus Tunggal Bebas", active: true, pa: true, pi: true },
      { name: "Jurus Ganda Tangan Kosong", active: true, pa: true, pi: true },
      { name: "Jurus Ganda Senjata", active: true, pa: true, pi: true },
      { name: "Jurus Regu A (1 - 6)", active: true, pa: true, pi: true },
      { name: "Jurus Regu B (7 - 12)", active: true, pa: true, pi: true }
    ]
  },
  "Remaja": {
    active: true,
    isBebas: false,
    minYear: 2008,
    maxYear: 2010,
    classes: [
      { name: "Kelas < 39 (Di bawah 39 kg)", active: true, pa: true, pi: true },
      { name: "Kelas A (39 kg - 43 kg)", active: true, pa: true, pi: true },
      { name: "Kelas B (43 kg - 47 kg)", active: true, pa: true, pi: true },
      { name: "Kelas C (47 kg - 51 kg)", active: true, pa: true, pi: true },
      { name: "Kelas D (51 kg - 55 kg)", active: true, pa: true, pi: true },
      { name: "Kelas E (55 kg - 59 kg)", active: true, pa: true, pi: true },
      { name: "Kelas F (59 kg - 63 kg)", active: true, pa: true, pi: true },
      { name: "Kelas G (63 kg - 67 kg)", active: true, pa: true, pi: true },
      { name: "Kelas H (67 kg - 71 kg)", active: true, pa: true, pi: true },
      { name: "Kelas I (71 kg - 75 kg)", active: true, pa: true, pi: true },
      { name: "Kelas J (75 kg - 79 kg)", active: true, pa: true, pi: true },
      { name: "Kelas K (79 kg - 83 kg)", active: true, pa: true, pi: false },
      { name: "Kelas L (83 kg - 87 kg)", active: true, pa: true, pi: false },
      { name: "Kelas Open 1 (87 kg - 100 kg)", active: true, pa: true, pi: false },
      { name: "Kelas Open 2 (di atas 100 kg)", active: true, pa: true, pi: false },
      { name: "Kelas Open 1 (79 kg - 92 kg)", active: true, pa: false, pi: true },
      { name: "Kelas Open 2 (di atas 92 kg)", active: true, pa: false, pi: true },
      { name: "Jurus Tunggal", active: true, pa: true, pi: true },
      { name: "Jurus Tunggal Bebas", active: true, pa: true, pi: true },
      { name: "Jurus Ganda", active: true, pa: true, pi: true },
      { name: "Jurus Regu", active: true, pa: true, pi: true }
    ]
  },
  "Dewasa": {
    active: true,
    isBebas: false,
    minYear: 1991,
    maxYear: 2007,
    classes: [
      { name: "Kelas < 45 (Di bawah 45 kg)", active: true, pa: true, pi: true },
      { name: "Kelas A (45 kg - 50 kg)", active: true, pa: true, pi: true },
      { name: "Kelas B (50 kg - 55 kg)", active: true, pa: true, pi: true },
      { name: "Kelas C (55 kg - 60 kg)", active: true, pa: true, pi: true },
      { name: "Kelas D (60 kg - 65 kg)", active: true, pa: true, pi: true },
      { name: "Kelas E (65 kg - 70 kg)", active: true, pa: true, pi: true },
      { name: "Kelas F (70 kg - 75 kg)", active: true, pa: true, pi: true },
      { name: "Kelas G (75 kg - 80 kg)", active: true, pa: true, pi: true },
      { name: "Kelas H (80 kg - 85 kg)", active: true, pa: true, pi: true },
      { name: "Kelas I (85 kg - 90 kg)", active: true, pa: true, pi: false },
      { name: "Kelas J (90 kg - 95 kg)", active: true, pa: true, pi: false },
      { name: "Kelas Open 1 (95 kg - 110 kg)", active: true, pa: true, pi: false },
      { name: "Kelas Open 2 (di atas 110 kg)", active: true, pa: true, pi: false },
      { name: "Kelas Open 1 (85 kg - 100 kg)", active: true, pa: false, pi: true },
      { name: "Kelas Open 2 (di atas 100 kg)", active: true, pa: false, pi: true },
      { name: "Jurus Tunggal", active: true, pa: true, pi: true },
      { name: "Jurus Tunggal Bebas", active: true, pa: true, pi: true },
      { name: "Jurus Ganda", active: true, pa: true, pi: true },
      { name: "Jurus Regu", active: true, pa: true, pi: true }
    ]
  },
  "Master 1": {
    active: true,
    isBebas: false,
    minYear: 1981,
    maxYear: 1990,
    classes: [
      { name: "Kelas < 45 (Di bawah 45 kg)", active: true, pa: true, pi: true },
      { name: "Kelas A (45 kg - 50 kg)", active: true, pa: true, pi: true },
      { name: "Kelas B (50 kg - 55 kg)", active: true, pa: true, pi: true },
      { name: "Kelas C (55 kg - 60 kg)", active: true, pa: true, pi: true },
      { name: "Kelas D (60 kg - 65 kg)", active: true, pa: true, pi: true },
      { name: "Kelas E (65 kg - 70 kg)", active: true, pa: true, pi: true },
      { name: "Kelas F (70 kg - 75 kg)", active: true, pa: true, pi: true },
      { name: "Kelas G (75 kg - 80 kg)", active: true, pa: true, pi: true },
      { name: "Kelas H (80 kg - 85 kg)", active: true, pa: true, pi: true },
      { name: "Kelas I (85 kg - 90 kg)", active: true, pa: true, pi: false },
      { name: "Kelas J (90 kg - 95 kg)", active: true, pa: true, pi: false },
      { name: "Kelas Open 1 (95 kg - 110 kg)", active: true, pa: true, pi: false },
      { name: "Kelas Open 2 (di atas 110 kg)", active: true, pa: true, pi: false },
      { name: "Kelas Open 1 (85 kg - 100 kg)", active: true, pa: false, pi: true },
      { name: "Kelas Open 2 (di atas 100 kg)", active: true, pa: false, pi: true },
      { name: "Jurus Tunggal Tangan Kosong", active: true, pa: true, pi: true },
      { name: "Jurus Tunggal Bersenjata", active: true, pa: true, pi: true },
      { name: "Jurus Tunggal Bebas Tangan Kosong", active: true, pa: true, pi: true },
      { name: "Jurus Tunggal Bebas Bersenjata", active: true, pa: true, pi: true },
      { name: "Jurus Ganda Tangan Kosong", active: true, pa: true, pi: true },
      { name: "Jurus Regu A", active: true, pa: true, pi: true },
      { name: "Jurus Regu B", active: true, pa: true, pi: true }
    ]
  },
  "Master 2": {
    active: true,
    isBebas: false,
    minYear: 1966,
    maxYear: 1980,
    classes: [
      { name: "Kelas < 45 (Di bawah 45 kg)", active: true, pa: true, pi: true },
      { name: "Kelas A (45 kg - 50 kg)", active: true, pa: true, pi: true },
      { name: "Kelas B (50 kg - 55 kg)", active: true, pa: true, pi: true },
      { name: "Kelas C (55 kg - 60 kg)", active: true, pa: true, pi: true },
      { name: "Kelas D (60 kg - 65 kg)", active: true, pa: true, pi: true },
      { name: "Kelas E (65 kg - 70 kg)", active: true, pa: true, pi: true },
      { name: "Kelas F (70 kg - 75 kg)", active: true, pa: true, pi: true },
      { name: "Kelas G (75 kg - 80 kg)", active: true, pa: true, pi: true },
      { name: "Kelas H (80 kg - 85 kg)", active: true, pa: true, pi: true },
      { name: "Kelas I (85 kg - 90 kg)", active: true, pa: true, pi: false },
      { name: "Kelas J (90 kg - 95 kg)", active: true, pa: true, pi: false },
      { name: "Kelas Open 1 (95 kg - 110 kg)", active: true, pa: true, pi: false },
      { name: "Kelas Open 2 (di atas 110 kg)", active: true, pa: true, pi: false },
      { name: "Kelas Open 1 (85 kg - 100 kg)", active: true, pa: false, pi: true },
      { name: "Kelas Open 2 (di atas 100 kg)", active: true, pa: false, pi: true },
      { name: "Jurus Tunggal Tangan Kosong", active: true, pa: true, pi: true },
      { name: "Jurus Tunggal Bersenjata", active: true, pa: true, pi: true },
      { name: "Jurus Tunggal Bebas Tangan Kosong", active: true, pa: true, pi: true },
      { name: "Jurus Tunggal Bebas Bersenjata", active: true, pa: true, pi: true },
      { name: "Jurus Ganda Tangan Kosong", active: true, pa: true, pi: true },
      { name: "Jurus Regu A", active: true, pa: true, pi: true },
      { name: "Jurus Regu B", active: true, pa: true, pi: true }
    ]
  }
};

export const DEFAULT_SETTINGS: SystemSettings = {
  regStatus: "ON",
  regStart: "",
  regEnd: "",
  eventTitle: "SH TERATE CUP 2026",
  matchType: "Keduanya",
  isFree: false,
  logoUrl: "", // inline base64 or dynamic thumbnail
  idCardBg: "",
  idCardBgColor: "slate",
  categoryPrices: {
    "Pra Usia Dini": 150000,
    "Usia Dini 1": 150000,
    "Usia Dini 2": 150000,
    "Pra Remaja": 200000,
    "Remaja": 200000,
    "Dewasa": 250000,
    "Master 1": 300000,
    "Master 2": 300000
  },
  paymentInfo: "Silakan melakukan transfer pembayaran ke Rekening Resmi Panitia:\n\nBANK MANDIRI: 138-00-1234567-8\na.n. PANITIA PELAKSANA SH TERATE CUP\n\nSertakan Kode Unik kontingen Anda saat mentransfer. Upload bukti transfer murni berformat JPG/PNG pada menu Pembayaran agar admin dapat melakukan validasi data atlet Anda.",
  customFields: ["Nama Pelatih Utama", "Tingkat Sabuk / Sabuk"],
  photoLabels: ["KTP / KIA atau Akte Lahir", "Pas Foto 3x4 (Background Merah/Biru)"],
  standardFieldLabels: {
    namaLengkap: "Nama Lengkap Sesuai KTP/Akte",
    nik: "NIK (Nomor Induk Kependudukan)",
    tglLahir: "Tanggal Lahir (Otomatis)",
    jk: "Jenis Kelamin (Otomatis via NIK)",
    nowa: "No. WhatsApp Atlet/Wali",
    tinggiBadan: "Tinggi Badan (cm)",
    beratBadan: "Berat Badan (kg)",
    alamat: "Alamat Lengkap",
    kontingen: "Asal Kontingen / Sekolah / Instansi"
  },
  classData: DEFAULT_KELAS_IPSI,
  eventStartDate: "2026-07-20",
  bestFighterScheme: "Per Kategori Umur"
};

// Seeding high-fidelity seed data
export const INITIAL_CONTINGENTS: Contingent[] = [
  {
    id: "admin",
    pjName: "Dimas Reky",
    nowa: "081234567890",
    contingentName: "Panitia Pusat",
    username: "DIM",
    passwordHash: "admin123",
    role: "admin",
    paymentStatus: "Lunas",
    buktiTransferUrl: "",
    kodeUnik: 0
  }
];

export const INITIAL_ATHLETES: Athlete[] = [];
export const INITIAL_LOGS: ActivityLog[] = [];

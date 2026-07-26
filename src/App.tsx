/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, ChangeEvent, FormEvent, useEffect } from "react";
import { 
  BookOpen, 
  Layout, 
  Map as MapIcon, 
  Calendar, 
  FileText, 
  Sparkles, 
  Plus, 
  Trash2,
  ChevronRight,
  Download,
  Loader2,
  Upload,
  BarChart3,
  X,
  LogOut,
  Check,
  Clock,
  CheckCircle2,
  UserPlus,
  Users,
  Shield,
  User,
  Settings,
  Sliders,
  Database,
  RefreshCcw,
  Globe,
  Zap,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Printer,
  Building2,
  Cpu,
  Layers,
  Target,
  Code2,
  FileSpreadsheet,
  Copy,
  ExternalLink,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { RPSData, CourseInfo, CPL, CPMK, SubCPMK, WeeklyPlan, Lecturer, UserRole } from "./types";
import mammoth from "mammoth";
import { 
  generateRPSContent, 
  generateCourseDescription, 
  generateWeeklyPlansOnly, 
  generateCPLsOnly, 
  generateCPMKsOnly, 
  generateSubCPMKsOnly 
} from "./services/geminiService";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import RPSPreview from "./components/RPSPreview";
import LandingPage from "./components/LandingPage";

const initialRPS: RPSData = {
  courseInfo: {
    name: "",
    code: "",
    sksTeori: 2,
    sksPraktek: 0,
    semester: 1,
    description: "",
    lecturer: "",
    datePrepared: new Date().toISOString().split("T")[0],
    program: "S1 Bisnis Digital",
    university: "Politeknik Sawunggalih Aji",
    rumpunMK: "Mata kuliah wajib program studi",
    lecturerNidn: "",
    pustakaUtama: ["Dave Chaffey & Fiona Ellis-Chadwick. (2019). Digital Marketing 7th Edition. Pearson.", "Philip Kotler, Hermawan Kartajaya & Iwan Setiawan. (2017). Marketing 4.0. Wiley."],
    pustakaPendukung: [],
    modelPembelajaran: "Project Based Learning",
    dosenPengampu: [],
    pengembangRPS: "",
    pengembangNidn: "",
    koordinatorRMK: "",
    koordinatorProdi: "HUJJATULLAH FAZLURRAHMAN",
    koordinatorProdiNidn: "0612048501",
    ketuaSpmi: "Ceicilia Rosma W, S.E., M.Si., Ak",
    spmiNidn: "",
  },
  cpls: [],
  cpmks: [],
  subCpmks: [],
  weeklyPlans: Array.from({ length: 16 }, (_, i) => {
    const weekNum = i + 1;
    if (weekNum === 8) {
      return {
        week: weekNum,
        subCPMKIds: [],
        materials: "Evaluasi UTS (Ujian Tengah Semester)",
        method: "Ujian Tertulis/Proyek",
        media: "Lembar Soal",
        duration: "100 menit",
        experience: "Mengerjakan soal ujian",
        assessmentCriteria: "Ketepatan jawaban",
        assessmentIndicator: "Skor jawaban",
        weight: 15,
      };
    }
    if (weekNum === 16) {
      return {
        week: weekNum,
        subCPMKIds: [],
        materials: "Evaluasi UAS (Ujian Akhir Semester)",
        method: "Ujian Tertulis/Proyek",
        media: "Lembar Soal",
        duration: "100 menit",
        experience: "Mengerjakan soal ujian akhir",
        assessmentCriteria: "Ketepatan jawaban",
        assessmentIndicator: "Skor jawaban",
        weight: 20,
      };
    }
    return {
      week: weekNum,
      subCPMKIds: [],
      materials: "",
      method: "Ceramah & Diskusi",
      media: "LCD, Laptop, Whiteboard",
      duration: "2 x 50 menit",
      experience: "",
      assessmentCriteria: "",
      assessmentIndicator: "",
      weight: 5,
    };
  }),
  assessmentComponents: [
    { id: '1', name: 'TUGAS INDIVIDU', type: 'Tugas', description: 'Kognitif/Pengetahuan - Tugas', c1: 5, c2: 5, c3: 5, c4: 5, c5: 5, totalWeight: 25 },
    { id: '2', name: 'UTS', type: 'UTS', description: 'Kognitif/Pengetahuan - Ujian Tengah Semester', c1: 10, c2: 10, c3: 5, c4: 0, c5: 0, totalWeight: 25 },
    { id: '3', name: 'UAS', type: 'UAS', description: 'Hasil Proyek', c1: 0, c2: 0, c3: 0, c4: 25, c5: 0, totalWeight: 25 },
    { id: '4', name: 'KEHADIRAN/PARTISIPASI', type: 'Partisipasi', description: 'Aktivitas Partisipatif', c1: 0, c2: 0, c3: 0, c4: 0, c5: 25, totalWeight: 25 },
  ]
};

export default function App() {
  const [rps, setRps] = useState<RPSData>(initialRPS);
  const [activeSection, setActiveSection] = useState("info");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingWeekly, setIsGeneratingWeekly] = useState(false);
  const [isGeneratingCPL, setIsGeneratingCPL] = useState(false);
  const [isGeneratingCPMK, setIsGeneratingCPMK] = useState(false);
  const [isGeneratingSubCPMK, setIsGeneratingSubCPMK] = useState(false);
  const [oldRpsContent, setOldRpsContent] = useState("");
  const [uploadedFileObj, setUploadedFileObj] = useState<{ name: string; size: number; type: string; base64Pdf?: { mimeType: string; data: string } } | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<Lecturer | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [lecturers, setLecturers] = useState<Lecturer[]>(() => {
    const saved = localStorage.getItem('lecturers');
    const defaultLecturers: Lecturer[] = [
      { id: '1', name: 'Dr. Ratih Amelia, S.E., M.M.', nidn: '0701017001', email: 'ratih@polsa.ac.id', password: 'password123', role: 'dosen' },
      { id: '2', name: 'HUJJATULLAH FAZLURRAHMAN', nidn: 'admin', email: 'admin@polsa.ac.id', password: 'admin123', role: 'admin' },
      { id: '3', name: 'Kapala Program Studi', nidn: 'kaprodi', email: 'kaprodi@polsa.ac.id', password: 'kaprodi123', role: 'kaprodi' },
      { id: '4', name: 'Dosen Bisnis Digital', nidn: 'bisnisdigital', email: 'bisnisdigital@polsa.ac.id', password: 'dosen123', role: 'dosen' },
      { id: '5', name: 'Ceicilia Rosma W, S.E., M.Si., Ak', nidn: 'spmi', email: 'spmi@polsa.ac.id', password: 'spmi123', role: 'spmi' }
    ];
    if (!saved) return defaultLecturers;
    
    const parsed = JSON.parse(saved);
    // Ensure critical users exist in the saved data
    defaultLecturers.forEach(def => {
      if (!parsed.find((l: any) => l.nidn === def.nidn)) {
        parsed.push(def);
      }
    });
    return parsed;
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [customTemplates, setCustomTemplates] = useState<{name: string, desc: string, type: string}[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [newCompName, setNewCompName] = useState("");
  const [newCompDesc, setNewCompDesc] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PDF Export Wizard States
  const [showPdfWizard, setShowPdfWizard] = useState(false);
  const [isSimulatingPdf, setIsSimulatingPdf] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [simulatedStep, setSimulatedStep] = useState("");
  const [includeSignature, setIncludeSignature] = useState(true);
  const [includeOfficialStamp, setIncludeOfficialStamp] = useState(true);
  const [paperSize, setPaperSize] = useState("A4");

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'dosen' | 'kaprodi' | 'spmi';
    title: string;
    message: string;
    targetDoc?: RPSData;
  } | null>(null);

  const [successNotice, setSuccessNotice] = useState<string | null>(null);


  const [programStudis, setProgramStudis] = useState<{id: string, name: string, code: string}[]>(() => {
    const saved = localStorage.getItem('programStudis');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'D4 Bisnis Digital', code: 'BD' },
      { id: '2', name: 'D4 TRPL', code: 'TRPL' },
      { id: '3', name: 'D3 Administrasi Bisnis', code: 'AB' },
      { id: '4', name: 'D3 Akuntansi', code: 'AK' },
      { id: '5', name: 'D3 Teknik Informatika', code: 'TI' }
    ];
  });
  const [showCustomProdiModal, setShowCustomProdiModal] = useState(false);
  const [customProdiName, setCustomProdiName] = useState("");
  const [customProdiCode, setCustomProdiCode] = useState("");
  const [showCustomDosenModal, setShowCustomDosenModal] = useState(false);
  const [customDosenName, setCustomDosenName] = useState("");
  const [customDosenNidn, setCustomDosenNidn] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    nidn: "",
    email: "",
    role: "dosen" as UserRole,
    password: ""
  });
  const [editingUser, setEditingUser] = useState<Lecturer | null>(null);
  const [editPasswordValue, setEditPasswordValue] = useState("");
  const [globalCPLs, setGlobalCPLs] = useState<CPL[]>(() => {
    const saved = localStorage.getItem('globalCPLs');
    return saved ? JSON.parse(saved) : [];
  });
  const [publishedRPS, setPublishedRPS] = useState<(RPSData & {id: string, status: string, creator: string, version: number})[]>(() => {
    const saved = localStorage.getItem('publishedRPS');
    return saved ? JSON.parse(saved) : [];
  });

  const [globalCourses, setGlobalCourses] = useState<{id: string, name: string, code: string, sks: number, desc: string}[]>(() => {
    const saved = localStorage.getItem('globalCourses');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Manajemen Pemasaran Digital', code: 'BD201', sks: 3, desc: 'Mempelajari strategi pemasaran di era digital.' },
      { id: '2', name: 'Analisis Data Bisnis', code: 'BD202', sks: 3, desc: 'Teknik pengolahan data untuk pengambilan keputusan bisnis.' }
    ];
  });

  const [systemConfig, setSystemConfig] = useState(() => {
    const saved = localStorage.getItem('systemConfig');
    const defaults = {
      academicYear: '2023/2024',
      activeSemester: 'Genap',
      rpsFormat: 'V1-2024',
      lastBackup: '-',
      institutionLogo: 'input_file_0.png',
      universityName: 'POLITEKNIK SAWUNGGALIH AJI',
      universityAlias: 'POLSA KUTOARJO',
      gasWebhookUrl: '',
      gasAutoSync: false
    };
    if (saved) {
      try {
        return { ...defaults, ...JSON.parse(saved) };
      } catch (e) {
        return defaults;
      }
    }
    return defaults;
  });

  const [showGasModal, setShowGasModal] = useState(false);
  const [gasTestStatus, setGasTestStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    localStorage.setItem('programStudis', JSON.stringify(programStudis));
    localStorage.setItem('globalCPLs', JSON.stringify(globalCPLs));
    localStorage.setItem('publishedRPS', JSON.stringify(publishedRPS));
    localStorage.setItem('globalCourses', JSON.stringify(globalCourses));
    localStorage.setItem('lecturers', JSON.stringify(lecturers));
    localStorage.setItem('systemConfig', JSON.stringify(systemConfig));
  }, [programStudis, globalCPLs, publishedRPS, globalCourses, lecturers, systemConfig]);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const user = lecturers.find(l => 
      (l.nidn.toLowerCase() === trimmedUsername || l.email.toLowerCase() === trimmedUsername) && 
      l.password === trimmedPassword
    );
    
    if (user) {
      setUserRole(user.role);
      setLoggedInUser(user);
      setPassword("");
      setLoginError(null);
      if (user.role === 'admin') setActiveSection('admin-dashboard');
      else if (user.role === 'kaprodi') setActiveSection('admin-rps');
      else setActiveSection('dosen-status');
    } else {
      setLoginError("NIDN / Username atau password salah. Cek isian atau klik tombol Akun Uji Coba di bawah.");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      setUserRole(null);
      setLoggedInUser(null);
      setUsername("");
      setPassword("");
    }
  };

  const validateFields = (): boolean => {
    const errors: Record<string, string> = {};
    if (!rps.courseInfo.name.trim()) errors.name = "Nama matakuliah wajib diisi";
    if (!rps.courseInfo.description.trim()) errors.description = "Deskripsi wajib diisi";
    if (rps.courseInfo.sksTeori + rps.courseInfo.sksPraktek <= 0) errors.sks = "Total SKS harus lebih dari 0";
    if (rps.courseInfo.semester <= 0) errors.semester = "Semester harus minimal 1";
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveDraftAndPrint = () => {
    const creatorName = loggedInUser?.name || 'Dosen Pengampu';
    const existingIdx = publishedRPS.findIndex(r => 
      r.courseInfo.name === rps.courseInfo.name && 
      r.creator === creatorName
    );
    
    let updatedDoc;
    if (existingIdx >= 0) {
      updatedDoc = {
        ...rps,
        id: publishedRPS[existingIdx].id,
        status: rps.status || 'Draft',
        creator: creatorName,
        version: publishedRPS[existingIdx].version || 1
      };
      const updatedList = [...publishedRPS];
      updatedList[existingIdx] = updatedDoc;
      setPublishedRPS(updatedList);
    } else {
      updatedDoc = { 
        ...rps, 
        id: Date.now().toString(), 
        status: 'Draft', 
        creator: creatorName,
        version: 1 
      };
      setPublishedRPS(prev => [...prev, updatedDoc]);
    }
    setRps(updatedDoc);
    setActiveSection('preview');
    
    setTimeout(() => {
      setShowPdfWizard(true);
    }, 450);
  };

  const handleSaveAndSubmit = (targetDoc?: RPSData) => {
    const docToSubmit = targetDoc || rps;
    setConfirmModal({
      isOpen: true,
      type: 'dosen',
      title: 'Konfirmasi Pengajuan Validasi',
      message: `Apakah Anda yakin ingin mengajukan RPS "${docToSubmit.courseInfo.name || 'Mata Kuliah'}" untuk divalidasi oleh Kaprodi?`,
      targetDoc: docToSubmit
    });
  };

  const executeValidation = () => {
    if (!confirmModal) return;

    if (confirmModal.type === 'dosen') {
      const docToProcess = confirmModal.targetDoc || rps;
      const creatorName = loggedInUser?.name || docToProcess.creator || 'Dosen Pengampu';
      const existingIdx = publishedRPS.findIndex(r => 
        (r.courseInfo.name === docToProcess.courseInfo.name && r.creator === creatorName) ||
        r.id === docToProcess.id
      );
      
      let updatedDoc: RPSData;
      if (existingIdx >= 0) {
        updatedDoc = {
          ...docToProcess,
          id: publishedRPS[existingIdx].id,
          status: 'Menunggu Validasi Kaprodi',
          creator: creatorName,
          version: (publishedRPS[existingIdx].version || 1) + 1
        };
        const updatedList = [...publishedRPS];
        updatedList[existingIdx] = updatedDoc;
        setPublishedRPS(updatedList);
      } else {
        updatedDoc = { 
          ...docToProcess, 
          id: docToProcess.id || Date.now().toString(), 
          status: 'Menunggu Validasi Kaprodi', 
          creator: creatorName,
          version: 1 
        };
        setPublishedRPS(prev => [...prev, updatedDoc]);
      }
      
      setRps(updatedDoc);
      setConfirmModal(null);
      setSuccessNotice("Pengajuan Validasi Berhasil! Tanda centang Koordinator Mata Kuliah telah terbit pada halaman Preview & Cetak.");
      setActiveSection('preview');
    } else if (confirmModal.type === 'kaprodi') {
      const docToProcess = confirmModal.targetDoc || rps;
      const existingIdx = publishedRPS.findIndex(r => r.courseInfo.name === docToProcess.courseInfo.name || r.id === docToProcess.id);
      const newStatus = 'Validasi Kaprodi (Menunggu SPMI)';
      
      let updatedDoc: RPSData;
      if (existingIdx >= 0) {
        updatedDoc = {
          ...docToProcess,
          id: publishedRPS[existingIdx].id,
          status: newStatus,
          creator: publishedRPS[existingIdx].creator,
          version: publishedRPS[existingIdx].version || 1
        };
        const updatedList = [...publishedRPS];
        updatedList[existingIdx] = updatedDoc;
        setPublishedRPS(updatedList);
      } else {
        updatedDoc = { 
          ...docToProcess, 
          id: docToProcess.id || Date.now().toString(), 
          status: newStatus, 
          creator: loggedInUser?.name || 'Kaprodi',
          version: 1 
        };
        setPublishedRPS(prev => [...prev, updatedDoc]);
      }
      
      setRps(updatedDoc);
      setConfirmModal(null);
      setSuccessNotice("RPS Berhasil Divalidasi oleh Kaprodi! Tanda centang Kaprodi terbit dan dikirim ke Ketua SPMI.");
      setActiveSection('preview');
    } else if (confirmModal.type === 'spmi') {
      const docToProcess = confirmModal.targetDoc || rps;
      const existingIdx = publishedRPS.findIndex(r => r.courseInfo.name === docToProcess.courseInfo.name || r.id === docToProcess.id);
      const newStatus = 'Disetujui SPMI (Final)';
      
      let updatedDoc: RPSData;
      if (existingIdx >= 0) {
        updatedDoc = {
          ...docToProcess,
          id: publishedRPS[existingIdx].id,
          status: newStatus,
          creator: publishedRPS[existingIdx].creator,
          version: publishedRPS[existingIdx].version || 1
        };
        const updatedList = [...publishedRPS];
        updatedList[existingIdx] = updatedDoc;
        setPublishedRPS(updatedList);
      } else {
        updatedDoc = { 
          ...docToProcess, 
          id: docToProcess.id || Date.now().toString(), 
          status: newStatus, 
          creator: loggedInUser?.name || 'Ketua SPMI',
          version: 1 
        };
        setPublishedRPS(prev => [...prev, updatedDoc]);
      }
      
      setRps(updatedDoc);
      setConfirmModal(null);
      setSuccessNotice("RPS Berhasil Divalidasi Final oleh Ketua SPMI! Seluruh tanda centang pengesahan resmi aktif.");
      setActiveSection('preview');
    }
  };

  const runPdfSimulation = () => {
    setIsSimulatingPdf(true);
    setSimulatedProgress(0);
    setSimulatedStep("Inisialisasi engine ekspor OBE Master Pro...");
    
    const steps = [
      { prg: 10, msg: "Mempersiapkan layout template kop resmi Politeknik Sawunggalih Aji..." },
      { prg: 25, msg: "Mengonversi deskripsi mata kuliah dan matriks CPL prodi..." },
      { prg: 45, msg: "Menghitung pemetaan CPMK & Sub-CPMK ke sasis tabel pembelajaran..." },
      { prg: 65, msg: "Menyusun peta materi mingguan 1 hingga 16 dengan bobot penilaian..." },
      { prg: 80, msg: includeSignature ? "Menyematkan legalisasi & tanda tangan digital Kaprodi..." : "Menyusun lembar otorisasi pengesahan..." },
      { prg: 92, msg: includeOfficialStamp ? "Melakukan enkripsi & membubuhkan tanda validasi resmi..." : "Melakukan finalisasi berkas..." },
      { prg: 100, msg: "Konversi selesai! Berkas PDF siap diunduh secara instan." }
    ];
    
    steps.forEach((step, index) => {
      setTimeout(() => {
        setSimulatedProgress(step.prg);
        setSimulatedStep(step.msg);
        
        if (step.prg === 100) {
          setTimeout(() => {
            const templateElement = document.getElementById('rps-print-template');
            if (templateElement) {
              const htmlContent = templateElement.outerHTML;
              const fullHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RPS_${(rps.courseInfo.name || 'OBE_RPS').replace(/\s+/g, '_')}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,600;0,700;0,900;1,300&display=swap');
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { 
      background-color: #ffffff; 
      padding: 0; 
      margin: 0; 
      font-family: 'Inter', sans-serif;
    }
    @media print {
      html, body { 
        background-color: #ffffff !important;
        padding: 0 !important; 
        margin: 0 !important; 
        width: 100% !important;
        height: auto !important;
        overflow: visible !important;
      }
      .page-break { page-break-before: always !important; break-before: page !important; }
      .no-print { display: none !important; }
      #rps-print-template {
        width: 100% !important;
        max-width: 210mm !important;
        margin: 0 auto !important;
        padding: 0 !important;
        border: none !important;
        box-shadow: none !important;
      }
      table { page-break-inside: auto !important; width: 100% !important; }
      tr { page-break-inside: avoid !important; break-inside: avoid !important; }
      thead { display: table-header-group !important; }
    }
  </style>
</head>
<body class="bg-white p-0 m-0">
  <div class="w-full max-w-[210mm] mx-auto bg-white p-0 m-0">
    ${htmlContent}
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
              `;
              const blob = new Blob([fullHtml], { type: "text/html" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `RPS_OBE_\${(rps.courseInfo.name || 'MATA_KULIAH').replace(/\\s+/g, '_')}.html`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
            
            setIsSimulatingPdf(false);
            setShowPdfWizard(false);
          }, 600);
        }
      }, (index + 1) * 600);
    });
  };

  if (!userRole) {
    return (
      <LandingPage 
        lecturers={lecturers}
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        handleLogin={handleLogin}
        loginError={loginError}
        setLoginError={setLoginError}
        onQuickLogin={(nidn, pass) => {
          setLoginError(null);
          setUsername(nidn);
          setPassword(pass);
          const user = lecturers.find(l => (l.nidn === nidn || l.email === nidn) && l.password === pass);
          if (user) {
            setUserRole(user.role);
            setLoggedInUser(user);
            setPassword("");
            if (user.role === 'admin') setActiveSection('admin-dashboard');
            else if (user.role === 'kaprodi') setActiveSection('admin-rps');
            else setActiveSection('dosen-status');
          }
        }}
      />
    );
  }

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();

    if (!['.pdf', '.docx', '.doc', '.txt', '.md'].includes(ext)) {
      alert("Format file tidak didukung. Harap unggah file PDF (.pdf), Word (.docx, .doc), atau Teks (.txt, .md).");
      return;
    }

    try {
      let extractedText = "";
      let base64PdfObj: { mimeType: string; data: string } | undefined = undefined;
      let fileTypeLabel = "";

      if (ext === '.docx' || ext === '.doc') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value.trim();
        if (!extractedText) {
          alert("Tidak ada teks yang dapat dibaca dari dokumen Word tersebut.");
          return;
        }
        fileTypeLabel = "Word (.docx)";
      } else if (ext === '.pdf') {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (evt) => resolve(evt.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const base64Data = dataUrl.split(',')[1];
        base64PdfObj = {
          mimeType: "application/pdf",
          data: base64Data
        };
        extractedText = `[Dokumen Referensi PDF: ${file.name}]`;
        fileTypeLabel = "PDF Document";
      } else {
        extractedText = await file.text();
        fileTypeLabel = "Teks (.txt/.md)";
      }

      setOldRpsContent(extractedText);
      const fileObj = {
        name: file.name,
        size: file.size,
        type: fileTypeLabel,
        base64Pdf: base64PdfObj
      };
      setUploadedFileObj(fileObj);

      // Auto generate full RPS (CPL, CPMK, Sub-CPMK, Weekly Plans, Assessment)
      setIsGenerating(true);
      try {
        const courseName = rps.courseInfo.name || file.name.replace(/\.[^/.]+$/, "");
        const courseDesc = rps.courseInfo.description || "Silabus / RPS hasil analisis dokumen diunggah";
        
        const generated = await generateRPSContent(
          courseName,
          courseDesc,
          extractedText,
          base64PdfObj
        );

        setRps((prev) => ({
          ...prev,
          courseInfo: {
            ...prev.courseInfo,
            name: prev.courseInfo.name || courseName,
            description: prev.courseInfo.description || courseDesc
          },
          cpls: generated.cpls && generated.cpls.length > 0 ? generated.cpls : prev.cpls,
          cpmks: generated.cpmks && generated.cpmks.length > 0 ? generated.cpmks : prev.cpmks,
          subCpmks: generated.subCpmks && generated.subCpmks.length > 0 ? generated.subCpmks : prev.subCpmks,
          weeklyPlans: generated.weeklyPlans && generated.weeklyPlans.length > 0 ? (generated.weeklyPlans as WeeklyPlan[]) : prev.weeklyPlans,
          assessmentComponents: generated.assessmentComponents && generated.assessmentComponents.length > 0 ? generated.assessmentComponents : prev.assessmentComponents,
        }));

        alert(`File "${file.name}" berhasil diunggah & dibaca oleh AI!\n\nAI telah secara otomatis mengisi:\n- Pemetaan OBE (CPL, CPMK, Sub-CPMK)\n- Komponen Penilaian\n- Materi Mingguan (16 Pertemuan)`);
      } catch (genErr) {
        console.error("Auto generate on upload error:", genErr);
        alert(`File "${file.name}" berhasil diunggah. Anda dapat mengklik "Full AI Draft" atau tombol AI di masing-masing menu untuk mengisi otomatis.`);
      } finally {
        setIsGenerating(false);
      }

    } catch (err) {
      console.error("Gagal membaca file:", err);
      alert("Terjadi kesalahan saat membaca berkas. Silakan pastikan berkas tidak terproteksi atau coba format lain.");
    }
  };

  const handleGenerateCPLsAI = async () => {
    if (!rps.courseInfo.name) {
      alert("Harap isi Nama Mata Kuliah terlebih dahulu pada Informasi Umum.");
      return;
    }
    setIsGeneratingCPL(true);
    try {
      const cpls = await generateCPLsOnly(
        rps.courseInfo.name,
        rps.courseInfo.description,
        oldRpsContent,
        uploadedFileObj?.base64Pdf
      );
      if (cpls && cpls.length > 0) {
        setRps(prev => ({ ...prev, cpls }));
        alert("CPL Program Studi berhasil di-generate secara otomatis oleh AI!");
      }
    } catch (error) {
      console.error("Gagal generate CPL:", error);
      alert("Gagal meng-generate CPL. Silakan coba lagi.");
    } finally {
      setIsGeneratingCPL(false);
    }
  };

  const handleGenerateCPMKsAI = async () => {
    if (!rps.courseInfo.name) {
      alert("Harap isi Nama Mata Kuliah terlebih dahulu pada Informasi Umum.");
      return;
    }
    setIsGeneratingCPMK(true);
    try {
      const cpmks = await generateCPMKsOnly(
        rps.courseInfo.name,
        rps.courseInfo.description,
        rps.cpls,
        oldRpsContent,
        uploadedFileObj?.base64Pdf
      );
      if (cpmks && cpmks.length > 0) {
        setRps(prev => ({ ...prev, cpmks }));
        alert("CPMK Mata Kuliah berhasil di-generate secara otomatis oleh AI!");
      }
    } catch (error) {
      console.error("Gagal generate CPMK:", error);
      alert("Gagal meng-generate CPMK. Silakan coba lagi.");
    } finally {
      setIsGeneratingCPMK(false);
    }
  };

  const handleGenerateSubCPMKsAI = async () => {
    if (!rps.courseInfo.name) {
      alert("Harap isi Nama Mata Kuliah terlebih dahulu pada Informasi Umum.");
      return;
    }
    setIsGeneratingSubCPMK(true);
    try {
      const subCpmks = await generateSubCPMKsOnly(
        rps.courseInfo.name,
        rps.courseInfo.description,
        rps.cpmks,
        oldRpsContent,
        uploadedFileObj?.base64Pdf
      );
      if (subCpmks && subCpmks.length > 0) {
        setRps(prev => ({ ...prev, subCpmks }));
        alert("Sub-CPMK Mingguan berhasil di-generate secara otomatis oleh AI!");
      }
    } catch (error) {
      console.error("Gagal generate Sub-CPMK:", error);
      alert("Gagal meng-generate Sub-CPMK. Silakan coba lagi.");
    } finally {
      setIsGeneratingSubCPMK(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!validateFields()) {
      alert("Harap perbaiki kesalahan input sebelum melanjutkan.");
      return;
    }
    setIsGenerating(true);
    try {
      const generated = await generateRPSContent(
        rps.courseInfo.name, 
        rps.courseInfo.description, 
        oldRpsContent,
        uploadedFileObj?.base64Pdf
      );
      setRps((prev) => ({
        ...prev,
        cpls: generated.cpls && generated.cpls.length > 0 ? generated.cpls : prev.cpls,
        cpmks: generated.cpmks && generated.cpmks.length > 0 ? generated.cpmks : prev.cpmks,
        subCpmks: generated.subCpmks && generated.subCpmks.length > 0 ? generated.subCpmks : prev.subCpmks,
        weeklyPlans: (generated.weeklyPlans as WeeklyPlan[]) || prev.weeklyPlans,
        assessmentComponents: generated.assessmentComponents && generated.assessmentComponents.length > 0 ? generated.assessmentComponents : prev.assessmentComponents,
      }));
      setActiveSection("mapping");
    } catch (error) {
      console.error(error);
      alert("Gagal membuat RPS otomatis. Silakan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateWeeklyAI = async () => {
    if (!rps.courseInfo.name) {
      alert("Harap isi Nama Mata Kuliah terlebih dahulu pada Informasi Umum.");
      return;
    }
    setIsGeneratingWeekly(true);
    try {
      const plans = await generateWeeklyPlansOnly(
        rps.courseInfo.name,
        rps.courseInfo.description,
        rps.subCpmks,
        oldRpsContent,
        uploadedFileObj?.base64Pdf
      );
      if (plans && plans.length > 0) {
        setRps(prev => ({
          ...prev,
          weeklyPlans: plans as WeeklyPlan[]
        }));
        alert("Materi Mingguan (16 Pertemuan) berhasil ter-generate secara otomatis oleh AI!");
      }
    } catch (error) {
      console.error("Gagal generate materi mingguan:", error);
      alert("Gagal meng-generate materi mingguan. Silakan coba lagi.");
    } finally {
      setIsGeneratingWeekly(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!rps.courseInfo.name) {
      alert("Harap isi Nama Matakuliah terlebih dahulu.");
      return;
    }
    setIsGeneratingDescription(true);
    try {
      const description = await generateCourseDescription(rps.courseInfo.name, rps.courseInfo.program);
      updateCourseInfo({ description });
    } catch (error) {
      console.error(error);
      alert("Gagal generate deskripsi.");
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const updateCourseInfo = (updates: Partial<CourseInfo>) => {
    setRps((prev) => ({
      ...prev,
      courseInfo: { ...prev.courseInfo, ...updates },
    }));
  };

  const renderSection = () => {
    // Shared and specific sections logic
    switch (activeSection) {
      case "admin-dashboard":
        if (userRole !== 'admin') return null;
        return (
          <div className="space-y-10">
            <header className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-indigo-500 rounded-full" />
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard Administrator</h2>
              </div>
              <p className="text-slate-500 font-medium ml-4">Monitor keseluruhan sistem dan progress kurikulum secara real-time.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Total Dosen", value: lecturers.length, icon: Users, color: "indigo" },
                { label: "Program Studi", value: programStudis.length, icon: Layout, color: "sky" },
                { label: "RPS Terbit", value: publishedRPS.length, icon: Check, color: "emerald" },
                { label: "Pending Review", value: publishedRPS.filter(r => r.status === 'Menunggu Validasi').length, icon: Loader2, color: "amber" },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_50px_rgba(0,0,0,0.05)] transition-all group overflow-hidden relative">
                  <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${stat.color}-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className={`p-3.5 bg-${stat.color}-50 w-fit rounded-2xl mb-5 group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{stat.value}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-[3rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/30 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
               <div className="flex items-center justify-between mb-10 relative z-10">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-indigo-500" />
                  Progress Pembuatan RPS
                </h3>
                <div className="px-4 py-2 bg-white rounded-2xl border border-slate-200 text-xs font-bold text-slate-500 shadow-sm uppercase tracking-wider">
                  Tahun Akademik {systemConfig.academicYear} ({systemConfig.activeSemester})
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
                {lecturers.filter(l => l.role === 'dosen').map(l => (
                   <div key={l.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between hover:border-indigo-200 transition-all shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center font-black text-slate-500 shadow-inner">
                        {l.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-800">{l.name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{l.nidn}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1.5">
                          {publishedRPS.filter(r => r.creator === l.name && r.status === 'Disetujui').length > 0 ? 'Selesai' : 'Sedang Dikerjakan'}
                        </p>
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: publishedRPS.filter(r => r.creator === l.name && r.status === 'Disetujui').length > 0 ? '100%' : '40%' }}
                            className={`h-full bg-gradient-to-r ${publishedRPS.filter(r => r.creator === l.name && r.status === 'Disetujui').length > 0 ? 'from-emerald-400 to-emerald-500' : 'from-indigo-400 to-indigo-500'}`} 
                          />
                        </div>
                      </div>
                      <span className={`px-4 py-1.5 text-[10px] font-black rounded-xl border uppercase tracking-widest shadow-sm ${
                        publishedRPS.filter(r => r.creator === l.name).length > 0
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {publishedRPS.filter(r => r.creator === l.name).length > 0 ? 'Submitted' : 'Drafting'}
                      </span>
                    </div>
                   </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "admin-users":
        if (userRole !== 'admin') return null;
        return (
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <header className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-sky-500 rounded-full" />
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Manajemen Pengguna</h2>
                </div>
                <p className="text-slate-500 font-medium ml-4">Kelola hak akses dan akun civitas akademika.</p>
              </header>
              <button
                onClick={() => {
                  setNewUserForm({ name: "", nidn: "", email: "", role: "dosen", password: "" });
                  setShowAddUserModal(true);
                }}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-sky-600 text-white rounded-[1.5rem] hover:shadow-xl hover:shadow-indigo-100 transition-all font-black shadow-lg shadow-indigo-50 active:scale-95 cursor-pointer"
              >
                <UserPlus className="w-5 h-5" />
                Tambah Pengguna Baru
              </button>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-8 py-6 text-left">Profil Pengguna</th>
                      <th className="px-8 py-6 text-center">Hak Akses</th>
                      <th className="px-8 py-6 text-center">Kontak</th>
                      <th className="px-8 py-6 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {lecturers.map(l => (
                      <tr key={l.id} className="hover:bg-indigo-50/10 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                              <User className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-800">{l.name}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{l.nidn}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                            l.role === 'admin' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            l.role === 'kaprodi' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                            l.role === 'spmi' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-sky-50 text-sky-600 border-sky-100'
                          }`}>
                            {l.role}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <p className="text-xs font-semibold text-slate-500">{l.email}</p>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex items-center justify-center gap-3">
                             <button 
                              onClick={() => {
                                setEditingUser(l);
                                setEditPasswordValue(l.password || "");
                              }}
                              className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm bg-white cursor-pointer"
                              title="Ubah Password"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm(`Hapus pengguna ${l.name}?`)) {
                                  setLecturers(lecturers.filter(u => u.id !== l.id));
                                  setSuccessNotice(`Pengguna "${l.name}" berhasil dihapus.`);
                                }
                              }}
                              className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all shadow-sm bg-white cursor-pointer"
                              title="Hapus Pengguna"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "admin-rps":
        if (userRole !== 'admin' && userRole !== 'kaprodi' && userRole !== 'spmi') return null;
        return (
          <div className="space-y-10">
            <header className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-indigo-500 rounded-full" />
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                  {userRole === 'spmi' ? 'Validasi Penjaminan Mutu (SPMI)' : userRole === 'kaprodi' ? 'Validasi RPS Program Studi (Kaprodi)' : 'Validasi RPS Berjenjang (OBE)'}
                </h2>
              </div>
              <p className="text-slate-500 font-medium ml-4">
                {userRole === 'spmi' 
                  ? 'Pemeriksaan dan persetujuan akhir penjaminan mutu internal (SPMI) untuk RPS yang telah disetujui Kaprodi.' 
                  : userRole === 'kaprodi' 
                  ? 'Review dan verifikasi awal oleh Kepala Program Studi sebelum diteruskan ke Ketua SPMI.' 
                  : 'Kelola alur validasi dokumen RPS berjenjang: Dosen ➔ Kaprodi ➔ Ketua SPMI.'}
              </p>
            </header>

            {/* Workflow Progress Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-[2.5rem] text-white shadow-xl space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Alur Validasi Dokumen RPS Resmi:</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold">
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shrink-0">1</div>
                  <div>
                    <p className="text-amber-300 font-black">Pengajuan Dosen</p>
                    <p className="text-[10px] text-slate-300">Dosen menyusun & mengajukan RPS</p>
                  </div>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center font-black shrink-0">2</div>
                  <div>
                    <p className="text-sky-300 font-black">Pemeriksaan Kaprodi</p>
                    <p className="text-[10px] text-slate-300">Kaprodi memvalidasi & teruskan ke SPMI</p>
                  </div>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shrink-0">3</div>
                  <div>
                    <p className="text-emerald-300 font-black">Validasi Ketua SPMI</p>
                    <p className="text-[10px] text-slate-300">SPMI menerbitkan status Disetujui Resmi</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
               <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-8 py-6">Mata Kuliah</th>
                      <th className="px-8 py-6 text-center">Dosen Pengampu</th>
                      <th className="px-8 py-6 text-center">Tahap Validasi</th>
                      <th className="px-8 py-6 text-center">Versi</th>
                      <th className="px-8 py-6 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {publishedRPS.map(doc => {
                      const isKaprodiPending = !doc.status || doc.status === 'Menunggu Validasi' || doc.status === 'Menunggu Validasi Kaprodi';
                      const isSpmiPending = doc.status === 'Validasi Kaprodi (Menunggu SPMI)';
                      const isApproved = doc.status === 'Disetujui SPMI (Final)' || doc.status === 'Disetujui';
                      const isRevision = doc.status === 'Revisi Kaprodi' || doc.status === 'Revisi SPMI' || doc.status === 'Revisi';

                      return (
                        <tr key={doc.id} className="hover:bg-indigo-50/10 transition-colors group">
                          <td className="px-8 py-6">
                            <p className="font-extrabold text-slate-800">{doc.courseInfo.name}</p>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{doc.courseInfo.code}</p>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <p className="text-xs font-bold text-slate-600">{doc.creator}</p>
                          </td>
                          <td className="px-8 py-6 text-center">
                             {isApproved ? (
                              <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                                Disetujui SPMI (Resmi)
                              </span>
                             ) : isSpmiPending ? (
                              <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-sky-50 text-sky-700 border border-sky-200 shadow-sm">
                                Menunggu Validasi SPMI
                              </span>
                             ) : isRevision ? (
                              <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
                                {doc.status}
                              </span>
                             ) : (
                              <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                                Menunggu Kaprodi
                              </span>
                             )}
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">V{doc.version}</span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="flex gap-2 justify-center items-center">
                              <button 
                                onClick={() => {
                                  setRps(doc);
                                  setActiveSection('preview');
                                }}
                                className="px-3.5 py-2 bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
                              >
                                Detail
                              </button>

                              {/* Action for Kaprodi / Admin */}
                              {(userRole === 'kaprodi' || userRole === 'admin') && isKaprodiPending && (
                                <>
                                  <button 
                                    onClick={() => setConfirmModal({
                                      isOpen: true,
                                      type: 'kaprodi',
                                      title: 'Validasi Kaprodi',
                                      message: `Setujui RPS "${doc.courseInfo.name}" dan teruskan ke Ketua SPMI untuk validasi penjaminan mutu akhir?`,
                                      targetDoc: doc
                                    })}
                                    className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-md flex items-center gap-1"
                                    title="Setujui & Teruskan ke SPMI"
                                  >
                                    <CheckCircle2 className="w-4 h-4" /> Validasi Kaprodi
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const note = prompt("Alasan penolakan / Catatan revisi untuk Dosen:");
                                      if(note !== null) {
                                        const newStatus = 'Revisi Kaprodi';
                                        setPublishedRPS(prev => prev.map(r => r.id === doc.id ? {...r, status: newStatus} : r));
                                        if (rps.id === doc.id) setRps({...rps, status: newStatus});
                                      }
                                    }}
                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-rose-100"
                                    title="Tolak / Minta Revisi"
                                  >
                                    <RefreshCcw className="w-4 h-4" />
                                  </button>
                                </>
                              )}

                              {/* Action for Ketua SPMI / Admin */}
                              {(userRole === 'spmi' || userRole === 'admin') && isSpmiPending && (
                                <>
                                  <button 
                                    onClick={() => setConfirmModal({
                                      isOpen: true,
                                      type: 'spmi',
                                      title: 'Validasi Final SPMI',
                                      message: `Terbitkan persetujuan penjaminan mutu resmi (SPMI) untuk RPS "${doc.courseInfo.name}"?`,
                                      targetDoc: doc
                                    })}
                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-md flex items-center gap-1"
                                    title="Validasi Final SPMI"
                                  >
                                    <CheckCircle2 className="w-4 h-4" /> Validasi SPMI
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const note = prompt("Catatan revisi dari Ketua SPMI:");
                                      if(note !== null) {
                                        const newStatus = 'Revisi SPMI';
                                        setPublishedRPS(prev => prev.map(r => r.id === doc.id ? {...r, status: newStatus} : r));
                                        if (rps.id === doc.id) setRps({...rps, status: newStatus});
                                      }
                                    }}
                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-rose-100"
                                    title="Tolak / Minta Revisi"
                                  >
                                    <RefreshCcw className="w-4 h-4" />
                                  </button>
                                </>
                              )}

                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {publishedRPS.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-16 text-center text-slate-400 italic font-medium">
                          <div className="flex flex-col items-center gap-3">
                            <BookOpen className="w-12 h-12 text-slate-100" />
                            Belum ada dokumen RPS yang diajukan untuk validasi.
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "dosen-status":
        const myRPS = publishedRPS.filter(r => r.creator === loggedInUser?.name);
        return (
          <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-sky-500 rounded-full" />
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Status Validasi RPS Saya</h2>
                </div>
                <p className="text-slate-500 font-medium ml-4">Pantau alur validasi dokumen dari Kaprodi hingga Ketua SPMI secara real-time.</p>
              </div>
              <button 
                onClick={() => {
                  setRps(initialRPS);
                  setActiveSection('info');
                }}
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Buat RPS Baru
              </button>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                { label: "Menunggu Kaprodi", count: myRPS.filter(r => !r.status || r.status === 'Menunggu Validasi' || r.status === 'Menunggu Validasi Kaprodi').length, color: 'amber', icon: Clock },
                { label: "Menunggu SPMI", count: myRPS.filter(r => r.status === 'Validasi Kaprodi (Menunggu SPMI)').length, color: 'sky', icon: Clock },
                { label: "Disetujui (Resmi)", count: myRPS.filter(r => r.status === 'Disetujui SPMI (Final)' || r.status === 'Disetujui').length, color: 'emerald', icon: CheckCircle2 },
                { label: "Harus Revisi", count: myRPS.filter(r => r.status === 'Revisi Kaprodi' || r.status === 'Revisi SPMI' || r.status === 'Revisi').length, color: 'rose', icon: RefreshCcw },
              ].map((s, i) => (
                <div key={i} className={`p-6 rounded-[2.5rem] border bg-white border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] group hover:shadow-[0_15px_50px_rgba(0,0,0,0.05)] transition-all`}>
                  <div className={`p-3 bg-${s.color}-50 w-fit rounded-2xl mb-4 group-hover:scale-110 transition-transform`}>
                    <s.icon className={`w-5 h-5 text-${s.color}-600`} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</p>
                  <p className={`text-3xl font-black text-slate-800 mt-1`}>{s.count}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
               <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-8 py-6">Nama Mata Kuliah</th>
                      <th className="px-8 py-6 text-center">Versi</th>
                      <th className="px-8 py-6 text-center">Tahap Validasi</th>
                      <th className="px-8 py-6 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {myRPS.map(doc => {
                      const isApproved = doc.status === 'Disetujui SPMI (Final)' || doc.status === 'Disetujui';
                      const isSpmiPending = doc.status === 'Validasi Kaprodi (Menunggu SPMI)';
                      const isRevision = doc.status === 'Revisi Kaprodi' || doc.status === 'Revisi SPMI' || doc.status === 'Revisi';

                      return (
                        <tr key={doc.id} className="hover:bg-indigo-50/10 transition-colors group">
                          <td className="px-8 py-6">
                            <p className="font-extrabold text-slate-800">{doc.courseInfo.name}</p>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{doc.courseInfo.code}</p>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">V{doc.version}</span>
                          </td>
                          <td className="px-8 py-6 text-center">
                             {isApproved ? (
                              <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                                Disetujui SPMI (Resmi)
                              </span>
                             ) : isSpmiPending ? (
                              <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-sky-50 text-sky-700 border border-sky-200 shadow-sm">
                                Disetujui Kaprodi ➔ Menunggu SPMI
                              </span>
                             ) : isRevision ? (
                              <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
                                {doc.status}
                              </span>
                             ) : (
                              <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                                Menunggu Validasi Kaprodi
                              </span>
                             )}
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="flex gap-2 justify-center">
                              <button 
                                onClick={() => {
                                  if(window.confirm("Muat dokumen ini ke editor untuk dikerjakan?")) {
                                    setRps(doc);
                                    setActiveSection('info');
                                  }
                                }}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm ${
                                  isRevision 
                                    ? 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700' 
                                    : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50'
                                }`}
                              >
                                {isRevision ? 'Lakukan Revisi' : 'Muat di Editor'}
                              </button>
                              <button 
                                onClick={() => {
                                  setRps(doc);
                                  setActiveSection('preview');
                                }}
                                className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all shadow-sm text-[10px] font-black uppercase tracking-widest border border-indigo-100"
                              >
                                Preview & Cetak
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {myRPS.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-8 py-16 text-center text-slate-400 italic font-medium">
                          <div className="flex flex-col items-center gap-3">
                            <RefreshCcw className="w-12 h-12 text-slate-100" />
                            Anda belum mengajukan dokumen RPS untuk validasi.
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "admin-core":
        if (userRole !== 'admin') return null;
        return (
          <div className="space-y-10">
             <header className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Manajemen Data Inti (OBE)</h2>
              </div>
              <p className="text-slate-500 font-medium ml-4">Kelola standar CPL, kurikulum prodi, dan bank mata kuliah.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Course Management */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] space-y-8 md:col-span-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3" />
                <div className="flex justify-between items-center relative z-10">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-indigo-500 shadow-sm" />
                    Manajemen Mata Kuliah Inti
                  </h3>
                  <button 
                    onClick={() => {
                      const name = prompt("Nama Mata Kuliah:");
                      const code = prompt("Kode MK:");
                      const sks = prompt("SKS:");
                      const desc = prompt("Deskripsi:");
                      if(name && code) setGlobalCourses([...globalCourses, {id: Date.now().toString(), name, code, sks: parseInt(sks || "0"), desc: desc || ""}]);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all font-black text-xs shadow-sm shadow-indigo-100/50"
                  >
                    <Plus className="w-4 h-4" /> Tambah MK
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
                  {globalCourses.map(c => (
                    <div key={c.id} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 group relative hover:border-indigo-200 hover:bg-white transition-all shadow-sm overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2" />
                      <div className="flex justify-between items-start mb-3 relative z-10">
                        <span className="px-2.5 py-1 bg-white text-indigo-600 rounded-lg text-[10px] font-black tracking-widest border border-indigo-50 shadow-sm">{c.code}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase">{c.sks} SKS</span>
                      </div>
                      <p className="font-extrabold text-slate-800 text-sm mb-1 leading-snug relative z-10">{c.name}</p>
                      <button 
                        onClick={() => setGlobalCourses(globalCourses.filter(x => x.id !== c.id))}
                        className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all z-20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Program Studi Management */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-sky-50/50 blur-[60px] rounded-full translate-x-1/4 -translate-y-1/4" />
                <div className="flex justify-between items-center relative z-10">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <Layout className="w-6 h-6 text-sky-500 shadow-sm" />
                    Program Studi
                  </h3>
                  <button 
                    onClick={() => {
                      const name = prompt("Nama Program Studi:");
                      const code = prompt("Kode Prodi:");
                      if(name && code) setProgramStudis([...programStudis, {id: Date.now().toString(), name, code}]);
                    }}
                    className="p-3 bg-sky-50 text-sky-600 rounded-2xl hover:bg-sky-100 transition-all font-black text-xs shadow-sm shadow-sky-100/50"
                  >
                    Tambah
                  </button>
                </div>
                <div className="space-y-4 relative z-10">
                  {programStudis.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-sky-200 hover:bg-white transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-sky-500 shadow-sm border border-sky-50">
                          {p.code.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 text-sm">{p.name}</p>
                          <p className="text-[10px] font-black text-slate-400 tracking-[0.1em] uppercase">{p.code}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setProgramStudis(programStudis.filter(x => x.id !== p.id))}
                        className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

               {/* CPL Management */}
               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50/50 blur-[60px] rounded-full translate-x-1/4 -translate-y-1/4" />
                <div className="flex justify-between items-center relative z-10">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <MapIcon className="w-6 h-6 text-emerald-500 shadow-sm" />
                    Standar CPL
                  </h3>
                  <button 
                    onClick={() => {
                      const code = prompt("Kode CPL (S1, P1, KU1, etc):");
                      const desc = prompt("Deskripsi CPL:");
                      if(code && desc) setGlobalCPLs([...globalCPLs, {id: Date.now().toString(), code, description: desc}]);
                    }}
                    className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all font-black text-xs shadow-sm shadow-emerald-100/50"
                  >
                    Tambah
                  </button>
                </div>
                <div className="space-y-4 max-h-[30rem] overflow-y-auto pr-3 relative z-10 custom-scrollbar">
                  {globalCPLs.map(cpl => (
                    <div key={cpl.id} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group relative hover:border-emerald-200 hover:bg-white transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-1 bg-white text-emerald-600 rounded-lg text-[10px] font-black border border-emerald-50 shadow-sm uppercase">{cpl.code}</span>
                        <button 
                          onClick={() => setGlobalCPLs(globalCPLs.filter(x => x.id !== cpl.id))}
                          className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs font-semibold text-slate-600 leading-relaxed">{cpl.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "admin-settings":
        if (userRole !== 'admin') return null;
        return (
          <div className="space-y-8">
            <header>
              <h2 className="text-2xl font-bold text-slate-800">Pengaturan Sistem</h2>
              <p className="text-sm text-slate-500">Konfigurasi operasional global, identitas perguruan tinggi, dan logo dokumen.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Logo & Institution Identity Config */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 md:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                      Unggah Logo & Identitas Perguruan Tinggi (Kop RPS)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Logo dan nama institusi ini digunakan pada kop surat cetak, tampilan preview, serta ekspor PDF resmi.
                    </p>
                  </div>
                  {systemConfig.institutionLogo && systemConfig.institutionLogo !== 'input_file_0.png' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Kembalikan logo ke logo bawaan sistem?")) {
                          setSystemConfig({ ...systemConfig, institutionLogo: 'input_file_0.png' });
                        }
                      }}
                      className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-200 transition-all self-start sm:self-auto cursor-pointer"
                    >
                      Reset Logo Bawaan
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-slate-50/80 p-6 rounded-3xl border border-slate-100">
                  {/* Logo Preview */}
                  <div className="flex flex-col items-center justify-center space-y-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preview Logo Kop</span>
                    <div className="w-28 h-28 flex items-center justify-center p-2 bg-slate-50 rounded-xl border border-dashed border-slate-300 overflow-hidden">
                      <img
                        src={systemConfig.institutionLogo || 'input_file_0.png'}
                        alt="Logo Perguruan Tinggi"
                        className="max-w-full max-h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                      Aktif di Preview & Cetak
                    </span>
                  </div>

                  {/* File Upload Box */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Unggah Berkas Logo Baru</label>
                    <div className="relative">
                      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50/70 rounded-2xl cursor-pointer transition-all text-center group">
                        <Upload className="w-8 h-8 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-indigo-900">Klik / Seret Gambar Logo</span>
                        <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP, atau SVG (Maks. 5MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                alert("Ukuran berkas logo terlalu besar (Maksimal 5MB).");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (re) => {
                                const base64 = re.target?.result as string;
                                setSystemConfig({ ...systemConfig, institutionLogo: base64 });
                                alert("Logo Perguruan Tinggi berhasil diunggah! Logo terbaru langsung diterapkan pada kop preview & cetak.");
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Identity text fields */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nama Perguruan Tinggi</label>
                      <input
                        type="text"
                        value={systemConfig.universityName || 'POLITEKNIK SAWUNGGALIH AJI'}
                        onChange={(e) => setSystemConfig({ ...systemConfig, universityName: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800 text-xs"
                        placeholder="Nama Resmi Perguruan Tinggi"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Singkatan / Alias Logo</label>
                      <input
                        type="text"
                        value={systemConfig.universityAlias || 'POLSA KUTOARJO'}
                        onChange={(e) => setSystemConfig({ ...systemConfig, universityAlias: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800 text-xs"
                        placeholder="Misal: POLSA KUTOARJO"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Academic Config */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Konfigurasi Tahun Ajaran & Semester
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tahun Ajaran Aktif</label>
                    <input 
                      type="text"
                      value={systemConfig.academicYear}
                      onChange={(e) => setSystemConfig({...systemConfig, academicYear: e.target.value})}
                      placeholder="E.G. 2023/2024"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semester Aktif</label>
                    <div className="flex gap-2">
                      {['Ganjil', 'Genap'].map(sem => (
                        <button
                          key={sem}
                          onClick={() => setSystemConfig({...systemConfig, activeSemester: sem})}
                          className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
                            systemConfig.activeSemester === sem 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {sem}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* RPS Format Config */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-500" />
                  Format Dokumen & Standar RPS
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Template Standar Aktif</label>
                    <select 
                      value={systemConfig.rpsFormat}
                      onChange={(e) => setSystemConfig({...systemConfig, rpsFormat: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option>V1-2024 (OBE Standard)</option>
                      <option>V2-2024 (International Standard)</option>
                      <option>Legacy-2023</option>
                    </select>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                    <p className="text-[10px] text-purple-600 leading-relaxed font-medium">
                      * Mengubah template akan mempengaruhi format PDF export untuk semua dokumen baru yang dibuat setelah perubahan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Data & Integrasi */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 md:col-span-2">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-500" />
                  Integrasi & Pemeliharaan Data
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* SIAKAD Sync */}
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                        <Globe className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-800">SIAKAD Sync</h4>
                    </div>
                    <p className="text-xs text-slate-500">Sinkronisasi otomatis data Mata Kuliah dan Dosen dari portal akademik.</p>
                    <button className="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all">
                      Sync Sekarang
                    </button>
                  </div>

                  {/* Google Apps Script & Sheets Integration Card */}
                  <div className="p-6 bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl border border-emerald-800 space-y-4 shadow-xl col-span-1 md:col-span-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-2xl border border-emerald-500/30">
                          <Code2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-black text-white text-base">Google Apps Script & Sheets Sync</h4>
                          <p className="text-xs text-emerald-200/80">Hubungkan sistem RPS ke Google Sheets via Apps Script Web App Webhook.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowGasModal(true)}
                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 shrink-0 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4" /> Kelola Integrasi GAS
                      </button>
                    </div>

                    <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                      <div className="bg-slate-950/60 p-4 rounded-2xl border border-emerald-900/50 space-y-2">
                        <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">URL Web App Google Apps Script</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={systemConfig.gasWebhookUrl || ''}
                            onChange={(e) => setSystemConfig({ ...systemConfig, gasWebhookUrl: e.target.value })}
                            placeholder="https://script.google.com/macros/s/.../exec"
                            className="w-full bg-slate-900 text-xs font-mono text-emerald-200 px-3.5 py-2 rounded-xl border border-slate-700 outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="bg-slate-950/60 p-4 rounded-2xl border border-emerald-900/50 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">Status Webhook</p>
                          <p className="text-[10px] text-slate-400">
                            {systemConfig.gasWebhookUrl ? "Webhook URL Terkonfigurasi" : "Belum terpasang URL Web App"}
                          </p>
                        </div>
                        <button
                          onClick={() => setShowGasModal(true)}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-xl text-xs font-bold transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                        >
                          Uji / Tutorial <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Backup */}
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                        <Database className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-800">Backup Data</h4>
                    </div>
                    <p className="text-xs text-slate-500">Ekspor seluruh basis data sistem (JSON format) untuk cadangan.</p>
                    <button 
                      onClick={() => {
                        const dataBlob = new Blob([JSON.stringify(localStorage, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(dataBlob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `rps_backup_${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                        setSystemConfig({...systemConfig, lastBackup: new Date().toLocaleString()});
                      }}
                      className="w-full py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all"
                    >
                      Ekspor Data
                    </button>
                    <p className="text-[10px] text-slate-400 text-center">Terakhir: {systemConfig.lastBackup}</p>
                  </div>

                  {/* Restore */}
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                        <RefreshCcw className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-slate-800">Restore Sistem</h4>
                    </div>
                    <p className="text-xs text-slate-500">Pulihkan sistem dari file backup sebelumnya. Perhatian: Akan menimpa data lama.</p>
                    <label className="block w-full py-2 bg-amber-600 text-white rounded-xl font-bold text-xs text-center cursor-pointer hover:bg-amber-700 transition-all">
                      Unggah Backup
                      <input type="file" className="hidden" accept=".json" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if(file) {
                          const reader = new FileReader();
                          reader.onload = (re) => {
                            try {
                              const data = JSON.parse(re.target?.result as string);
                              Object.keys(data).forEach(key => localStorage.setItem(key, data[key]));
                              alert("Data berhasil dipulihkan. Halaman akan direfresh.");
                              window.location.reload();
                            } catch(err) {
                              alert("Gagal membaca file backup.");
                            }
                          };
                          reader.readAsText(file);
                        }
                      }} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "info":
        return (
          <div className="space-y-12 max-w-5xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-sky-500 rounded-full" />
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Identitas Mata Kuliah</h2>
                </div>
                <p className="text-slate-500 font-medium ml-4">Lengkapi data dasar untuk memulai perancangan kurikulum OBE.</p>
              </div>
              <div className="px-6 py-2.5 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100/50 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Langkah 1: Profil Dasar</span>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-10">
              {/* Quick Select Card */}
              <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-sky-600 p-10 rounded-[3.5rem] shadow-2xl shadow-indigo-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-1000" />
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight">Cari di Bank Mata Kuliah</h3>
                      <p className="text-white/70 text-sm font-medium">Pilih dari database untuk pengisian data otomatis.</p>
                    </div>
                  </div>
                  <div className="relative">
                    <select 
                      onChange={(e) => {
                        const c = globalCourses.find(x => x.id === e.target.value);
                        if(c) {
                          updateCourseInfo({ name: c.name, code: c.code, sksTeori: c.sks, description: c.desc });
                        }
                      }}
                      className="w-full px-6 py-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] focus:ring-4 focus:ring-white/20 outline-none transition-all text-white font-bold appearance-none cursor-pointer pr-12"
                    >
                      <option value="" className="text-slate-800">-- Klik untuk mencari mata kuliah --</option>
                      {globalCourses.map(c => (
                        <option key={c.id} value={c.id} className="text-slate-800">{c.name} ({c.code})</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Main Form Fields */}
              <div className="space-y-12 bg-white px-8 py-12 md:p-16 rounded-[4rem] border border-slate-100 shadow-[0_30px_70px_rgba(0,0,0,0.03)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50/50 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 relative z-10">

                  {/* Basic Identification */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nama Mata Kuliah</label>
                      {validationErrors.name && <span className="text-[10px] font-black text-rose-500 uppercase tracking-tight">{validationErrors.name}</span>}
                    </div>
                    <input
                      type="text"
                      value={rps.courseInfo.name}
                      onChange={(e) => updateCourseInfo({ name: e.target.value })}
                      className={`w-full px-7 py-5 bg-slate-50/50 border ${validationErrors.name ? 'border-rose-200 bg-rose-50/5' : 'border-slate-100'} rounded-[2rem] focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:border-sky-500 outline-none transition-all font-bold text-slate-700 shadow-sm`}
                      placeholder="Masukkan nama mata kuliah"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Kode MK</label>
                    <input
                      type="text"
                      value={rps.courseInfo.code}
                      onChange={(e) => updateCourseInfo({ code: e.target.value })}
                      className="w-full px-7 py-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:border-sky-500 outline-none transition-all font-bold text-slate-700 shadow-sm"
                      placeholder="Contoh: MK001"
                    />
                  </div>
                  {/* Weights & Sems */}
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">SKS Teori</label>
                      <div className="relative">
                        <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                          type="number"
                          min="0"
                          value={rps.courseInfo.sksTeori}
                          onChange={(e) => updateCourseInfo({ sksTeori: parseInt(e.target.value) || 0 })}
                          className="w-full pl-14 pr-7 py-5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:bg-white outline-none transition-all font-bold text-slate-700 shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">SKS Praktik</label>
                      <div className="relative">
                        <Cpu className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                          type="number"
                          min="0"
                          value={rps.courseInfo.sksPraktek}
                          onChange={(e) => updateCourseInfo({ sksPraktek: parseInt(e.target.value) || 0 })}
                          className="w-full pl-14 pr-7 py-5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:bg-white outline-none transition-all font-bold text-slate-700 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Semester</label>
                    <div className="relative">
                      <Layers className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input
                        type="number"
                        min="1"
                        value={rps.courseInfo.semester}
                        onChange={(e) => updateCourseInfo({ semester: parseInt(e.target.value) || 0 })}
                        className="w-full pl-14 pr-7 py-5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:bg-white outline-none transition-all font-bold text-slate-700 shadow-sm"
                      />
                    </div>
                  </div>
                  {/* Team */}
                  <div className="md:col-span-2 py-4 flex items-center gap-6">
                    <div className="h-px bg-slate-100 grow" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] whitespace-nowrap">TIM PENYUSUN RPS</span>
                    <div className="h-px bg-slate-100 grow" />
                  </div>

                  {/* Dosen Pengembang RPS */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Dosen Pengembang RPS</label>
                    <div className="space-y-3">
                      <select
                        value={
                          lecturers.find(l => l.name === rps.courseInfo.pengembangRPS)
                            ? rps.courseInfo.pengembangRPS
                            : rps.courseInfo.pengembangRPS
                            ? "custom"
                            : ""
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "__ADD_CUSTOM__") {
                            setShowCustomDosenModal(true);
                          } else if (val !== "custom") {
                            const lect = lecturers.find(l => l.name === val);
                            updateCourseInfo({
                              pengembangRPS: val,
                              pengembangNidn: lect ? lect.nidn : (rps.courseInfo.pengembangNidn || "")
                            });
                          }
                        }}
                        className="w-full px-7 py-5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 shadow-sm"
                      >
                        <option value="">Pilih Dosen Pengembang...</option>
                        {lecturers.map(l => (
                          <option key={l.id} value={l.name}>{l.name}</option>
                        ))}
                        <option value="custom">Input Manual</option>
                        <option value="__ADD_CUSTOM__" className="font-extrabold text-indigo-600">+ Tambah Dosen Baru...</option>
                      </select>
                      {(rps.courseInfo.pengembangRPS === "" || !lecturers.find(l => l.name === rps.courseInfo.pengembangRPS)) && rps.courseInfo.pengembangRPS !== "" && (
                        <input
                          type="text"
                          value={rps.courseInfo.pengembangRPS}
                          onChange={(e) => updateCourseInfo({ pengembangRPS: e.target.value })}
                          className="w-full px-7 py-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl font-bold text-indigo-700 outline-none"
                          placeholder="Nama Dosen Pengembang & Gelar"
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">NIDN/NUPTK Dosen Pengembang RPS</label>
                    <input
                      type="text"
                      value={rps.courseInfo.pengembangNidn || ""}
                      onChange={(e) => updateCourseInfo({ pengembangNidn: e.target.value })}
                      className="w-full px-7 py-5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:bg-white outline-none transition-all font-bold text-slate-700 shadow-sm"
                      placeholder="Nomor Induk Dosen / NUPTK"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Dosen Pengampu / Koordinator</label>
                    <div className="space-y-3">
                      <select
                        value={lecturers.find(l => l.name === rps.courseInfo.lecturer) ? rps.courseInfo.lecturer : rps.courseInfo.lecturer ? "custom" : ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "__ADD_CUSTOM__") {
                            setShowCustomDosenModal(true);
                          } else if (val !== "custom") {
                            const lect = lecturers.find(l => l.name === val);
                            updateCourseInfo({ lecturer: val, lecturerNidn: lect ? lect.nidn : "" });
                          }
                        }}
                        className="w-full px-7 py-5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 shadow-sm"
                      >
                        <option value="">Pilih dari Database...</option>
                        {lecturers.map(l => (
                          <option key={l.id} value={l.name}>{l.name}</option>
                        ))}
                        <option value="custom">Input Manual</option>
                        <option value="__ADD_CUSTOM__" className="font-extrabold text-indigo-600">+ Tambah Dosen Baru...</option>
                      </select>
                      {(rps.courseInfo.lecturer === "" || !lecturers.find(l => l.name === rps.courseInfo.lecturer)) && rps.courseInfo.lecturer !== "" && (
                        <input
                          type="text"
                          value={rps.courseInfo.lecturer}
                          onChange={(e) => updateCourseInfo({ lecturer: e.target.value })}
                          className="w-full px-7 py-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl font-bold text-indigo-700 outline-none"
                          placeholder="Nama Koordinator & Gelar"
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">NIDN/NUPTK Koordinator</label>
                    <input
                      type="text"
                      value={rps.courseInfo.lecturerNidn || ""}
                      onChange={(e) => updateCourseInfo({ lecturerNidn: e.target.value })}
                      className="w-full px-7 py-5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:bg-white outline-none transition-all font-bold text-slate-700 shadow-sm"
                      placeholder="Nomor Induk Dosen / NUPTK"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Validator (Koordinator Prodi)</label>
                    <div className="space-y-3">
                      <select
                        value={lecturers.find(l => l.name === rps.courseInfo.koordinatorProdi) ? rps.courseInfo.koordinatorProdi : rps.courseInfo.koordinatorProdi ? "custom" : ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "__ADD_CUSTOM__") {
                            setShowCustomDosenModal(true);
                          } else if (val !== "custom") {
                            const lect = lecturers.find(l => l.name === val);
                            updateCourseInfo({ koordinatorProdi: val, koordinatorProdiNidn: lect ? lect.nidn : "" });
                          }
                        }}
                        className="w-full px-7 py-5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 shadow-sm"
                      >
                        <option value="">Pilih Kaprodi...</option>
                        {lecturers.map(l => (
                          <option key={l.id} value={l.name}>{l.name}</option>
                        ))}
                        <option value="custom">Input Manual</option>
                        <option value="__ADD_CUSTOM__" className="font-extrabold text-indigo-600">+ Tambah Dosen Baru...</option>
                      </select>
                      {(rps.courseInfo.koordinatorProdi === "" || !lecturers.find(l => l.name === rps.courseInfo.koordinatorProdi)) && rps.courseInfo.koordinatorProdi !== "" && (
                        <input
                          type="text"
                          value={rps.courseInfo.koordinatorProdi}
                          onChange={(e) => updateCourseInfo({ koordinatorProdi: e.target.value })}
                          className="w-full px-7 py-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl font-bold text-indigo-700 outline-none"
                          placeholder="Nama Kaprodi & Gelar"
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">NIDN/NUPTK Kaprodi</label>
                    <input
                      type="text"
                      value={rps.courseInfo.koordinatorProdiNidn || ""}
                      onChange={(e) => updateCourseInfo({ koordinatorProdiNidn: e.target.value })}
                      className="w-full px-7 py-5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:bg-white outline-none transition-all font-bold text-slate-700 shadow-sm"
                      placeholder="NIDN / NUPTK Kaprodi"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Verifikator (Ketua SPMI)</label>
                    <div className="space-y-3">
                      <select
                        value={lecturers.find(l => l.name === rps.courseInfo.ketuaSpmi) ? rps.courseInfo.ketuaSpmi : rps.courseInfo.ketuaSpmi ? "custom" : ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "__ADD_CUSTOM__") {
                            setShowCustomDosenModal(true);
                          } else if (val !== "custom") {
                            const lect = lecturers.find(l => l.name === val);
                            updateCourseInfo({ ketuaSpmi: val, spmiNidn: lect ? lect.nidn : "" });
                          }
                        }}
                        className="w-full px-7 py-5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 shadow-sm"
                      >
                        <option value="">Pilih Ketua SPMI...</option>
                        {lecturers.map(l => (
                          <option key={l.id} value={l.name}>{l.name}</option>
                        ))}
                        <option value="custom">Input Manual</option>
                        <option value="__ADD_CUSTOM__" className="font-extrabold text-indigo-600">+ Tambah Dosen Baru...</option>
                      </select>
                      {(rps.courseInfo.ketuaSpmi === "" || !lecturers.find(l => l.name === rps.courseInfo.ketuaSpmi)) && rps.courseInfo.ketuaSpmi !== "" && (
                        <input
                          type="text"
                          value={rps.courseInfo.ketuaSpmi || ""}
                          onChange={(e) => updateCourseInfo({ ketuaSpmi: e.target.value })}
                          className="w-full px-7 py-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl font-bold text-indigo-700 outline-none"
                          placeholder="Nama & Gelar Ketua SPMI"
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">NIDN/NUPTK Verifikator (Ketua SPMI)</label>
                    <input
                      type="text"
                      value={rps.courseInfo.spmiNidn || ""}
                      onChange={(e) => updateCourseInfo({ spmiNidn: e.target.value })}
                      className="w-full px-7 py-5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:bg-white outline-none transition-all font-bold text-slate-700 shadow-sm"
                      placeholder="NIDN / NUPTK Ketua SPMI"
                    />
                  </div>
                  {/* Institutional Info & Logo Upload Card */}
                  <div className="md:col-span-2 space-y-4 p-6 bg-slate-50/80 rounded-[2rem] border border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800">Logo & Identitas Perguruan Tinggi</h4>
                          <p className="text-[10px] text-slate-500 font-medium">Logo dan nama perguruan tinggi ini ditampilkan di Kop Dokumen RPS pada Tampilan Preview & Hasil Cetak</p>
                        </div>
                      </div>
                      <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md flex items-center justify-center gap-2 self-start sm:self-auto">
                        <Upload className="w-3.5 h-3.5" />
                        Unggah Logo Kop
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                alert("Ukuran berkas logo terlalu besar (Maksimal 5MB).");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (re) => {
                                const base64 = re.target?.result as string;
                                setSystemConfig({ ...systemConfig, institutionLogo: base64 });
                                alert("Logo Perguruan Tinggi berhasil diunggah! Logo terbaru langsung diterapkan pada Kop Preview & Cetak.");
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                      <div className="sm:col-span-2 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 p-2 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center shrink-0">
                          <img
                            src={systemConfig.institutionLogo || 'input_file_0.png'}
                            alt="Logo Perguruan Tinggi"
                            className="max-w-full max-h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-10 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nama Perguruan Tinggi (Ditulis Manual)</label>
                        <input
                          type="text"
                          value={rps.courseInfo.university}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCourseInfo({ university: val });
                            setSystemConfig({ ...systemConfig, universityName: val });
                          }}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                          placeholder="Tulis Nama Perguruan Tinggi secara manual..."
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Program Studi</label>
                      <button
                        type="button"
                        onClick={() => setShowCustomProdiModal(true)}
                        className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg border border-indigo-100/80 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> + Custom Prodi
                      </button>
                    </div>
                    <select
                      value={rps.courseInfo.program}
                      onChange={(e) => {
                        if (e.target.value === '__ADD_CUSTOM__') {
                          setShowCustomProdiModal(true);
                        } else {
                          updateCourseInfo({ program: e.target.value });
                        }
                      }}
                      className="w-full px-7 py-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-sky-500/10 focus:bg-white outline-none transition-all font-bold text-slate-700 shadow-sm"
                    >
                      <option value="">Pilih Program Studi</option>
                      {programStudis.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                      {rps.courseInfo.program && !programStudis.some(p => p.name === rps.courseInfo.program) && (
                        <option value={rps.courseInfo.program}>{rps.courseInfo.program} (Custom)</option>
                      )}
                      <option value="__ADD_CUSTOM__" className="font-extrabold text-indigo-600">+ Tambah Custom Program Studi...</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Rumpun Mata Kuliah</label>
                    <select
                      value={rps.courseInfo.rumpunMK}
                      onChange={(e) => updateCourseInfo({ rumpunMK: e.target.value })}
                      className="w-full px-7 py-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-sky-500/10 focus:bg-white outline-none transition-all font-bold text-slate-700 shadow-sm"
                    >
                      <option value="">Pilih Rumpun...</option>
                      <option value="Mata kuliah wajib program studi">Wajib Program Studi</option>
                      <option value="Mata kuliah wajib Perguruan Tinggi">Wajib Perguruan Tinggi</option>
                      <option value="Mata kuliah pilihan">Mata Kuliah Pilihan</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Model Pembelajaran</label>
                    <input
                      type="text"
                      value={rps.courseInfo.modelPembelajaran}
                      onChange={(e) => updateCourseInfo({ modelPembelajaran: e.target.value })}
                      className="w-full px-7 py-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-sky-500/10 focus:bg-white outline-none transition-all font-bold text-slate-700 shadow-sm"
                      placeholder="Contoh: Project-Based Learning"
                    />
                  </div>
                  {/* Reference Section */}
                  <div className="md:col-span-2 space-y-6 bg-slate-50/50 p-10 rounded-[3rem] border border-slate-100 mt-6 group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-slate-700 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-500" />
                          Referensi RPS / Silabus (PDF, Word, Teks)
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium tracking-tight leading-normal italic">
                          Unggah file PDF (.pdf), Word (.docx, .doc), atau Teks (.txt, .md) untuk dianalisis oleh AI dalam menyusun RPS & Materi Mingguan.
                        </p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-indigo-600 border border-indigo-200 rounded-2xl hover:bg-indigo-50 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm shrink-0 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" /> Unggah Berkas
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        accept=".pdf,.docx,.doc,.txt,.md"
                      />
                    </div>

                    {uploadedFileObj && (
                      <div className="flex items-center justify-between p-4 bg-indigo-50/80 border border-indigo-100 rounded-2xl text-xs font-bold text-indigo-900 shadow-sm">
                        <div className="flex items-center gap-3 truncate">
                          <div className="p-2 bg-indigo-600 text-white rounded-xl">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="font-extrabold truncate">{uploadedFileObj.name}</p>
                            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">{uploadedFileObj.type} • {(uploadedFileObj.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedFileObj(null);
                            setOldRpsContent("");
                          }}
                          className="p-1.5 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 transition-all shrink-0 ml-2 cursor-pointer"
                          title="Hapus berkas"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    
                    <div className="relative">
                      <textarea
                        value={oldRpsContent}
                        onChange={(e) => setOldRpsContent(e.target.value)}
                        rows={4}
                        className="w-full px-8 py-6 bg-white border border-slate-200 rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 outline-none transition-all text-slate-600 font-medium text-sm leading-relaxed shadow-sm"
                        placeholder="Atau tempelkan teks kurikulum / silabus / referensi di sini..."
                      />
                      {oldRpsContent && !uploadedFileObj && (
                        <button 
                          type="button"
                          onClick={() => setOldRpsContent("")}
                          className="absolute top-4 right-4 p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-16 mt-8 border-t border-slate-50 group">
                   <div className="flex items-center gap-6">
                      <div className="p-4 bg-indigo-50 text-indigo-500 rounded-3xl shadow-sm shadow-indigo-100/50 group-hover:scale-110 transition-transform">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Tanggal Penyusunan</label>
                        <input
                          type="date"
                          value={rps.courseInfo.datePrepared}
                          onChange={(e) => updateCourseInfo({ datePrepared: e.target.value })}
                          className="bg-transparent border-none focus:ring-0 outline-none font-black text-slate-700 p-0 text-lg cursor-pointer"
                        />
                      </div>
                   </div>
                   <div className="flex gap-4 w-full md:w-auto">
                      <button
                        onClick={handleGenerateAI}
                        disabled={isGenerating}
                        className="flex-1 md:flex-none flex items-center justify-center gap-4 px-10 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-1 transition-all disabled:opacity-50"
                      >
                         {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                         Full AI Draft
                      </button>
                      <button 
                        onClick={() => setActiveSection('mapping')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-4 px-10 py-5 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1 transition-all"
                      >
                        Lanjut Pemetaan
                        <ArrowRight className="w-4 h-4" />
                      </button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "mapping":
        return (
          <div className="space-y-12">
            <header className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-sky-500 rounded-full" />
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Pemetaan OBE</h2>
              </div>
              <p className="text-slate-500 font-medium ml-4 tracking-tight">Definisikan dan petakan Capaian Pembelajaran (CPL, CPMK, Sub-CPMK).</p>
            </header>
            
            {/* CPL Section */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] space-y-8 group">
              <div className="flex justify-between items-center px-2">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-2xl">
                      <Layout className="w-5 h-5" />
                    </div>
                    CPL Program Studi
                  </h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest pl-11">CAPAIAN PEMBELAJARAN LULUSAN</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button 
                    type="button"
                    onClick={handleGenerateCPLsAI}
                    disabled={isGeneratingCPL}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:opacity-90 transition-all font-black text-[10px] uppercase tracking-widest shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingCPL ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Bantu Isi CPL (AI)
                  </button>
                  <button 
                    onClick={() => setRps(prev => ({ ...prev, cpls: [...prev.cpls, { id: Date.now().toString(), code: `CPL-${prev.cpls.length + 1}`, description: "" }] }))}
                    className="flex items-center gap-2 px-5 py-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Tambah CPL
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {rps.cpls.map((cpl, idx) => (
                  <div key={cpl.id} className="flex gap-4 p-6 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all group/item">
                    <input 
                      className="w-28 px-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] font-black text-slate-700 text-center focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all shadow-sm" 
                      value={cpl.code} 
                      onChange={(e) => {
                        const newCpls = [...rps.cpls];
                        newCpls[idx].code = e.target.value;
                        setRps({ ...rps, cpls: newCpls });
                      }}
                    />
                    <input 
                      className="flex-1 px-8 py-4 bg-white border border-slate-200 rounded-[1.5rem] font-medium text-slate-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all shadow-sm" 
                      value={cpl.description} 
                      onChange={(e) => {
                        const newCpls = [...rps.cpls];
                        newCpls[idx].description = e.target.value;
                        setRps({ ...rps, cpls: newCpls });
                      }}
                      placeholder="Deskripsi Capaian Pembelajaran Lulusan..."
                    />
                    <button 
                      onClick={() => setRps({ ...rps, cpls: rps.cpls.filter(c => c.id !== cpl.id) })}
                      className="p-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-[1.5rem] transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* CPMK Section */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] space-y-8 group">
              <div className="flex justify-between items-center px-2">
                 <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <div className="p-2.5 bg-sky-50 text-sky-500 rounded-2xl">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    CPMK Mata Kuliah
                  </h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest pl-11">CAPAIAN PEMBELAJARAN MATA KULIAH</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button 
                    type="button"
                    onClick={handleGenerateCPMKsAI}
                    disabled={isGeneratingCPMK}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-2xl hover:opacity-90 transition-all font-black text-[10px] uppercase tracking-widest shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingCPMK ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Bantu Isi CPMK (AI)
                  </button>
                  <button 
                    onClick={() => setRps(prev => ({ ...prev, cpmks: [...prev.cpmks, { id: Date.now().toString(), code: `CPMK-${prev.cpmks.length + 1}`, description: "", mappedCPLIds: [] }] }))}
                    className="flex items-center gap-2 px-5 py-3 bg-sky-50 text-sky-600 rounded-2xl hover:bg-sky-100 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Tambah CPMK
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {rps.cpmks.map((cpmk, idx) => (
                  <div key={cpmk.id} className="p-8 bg-slate-50/50 border border-slate-100 rounded-[3rem] space-y-6 hover:bg-white hover:border-sky-100 transition-all group/item shadow-sm hover:shadow-xl hover:shadow-sky-50/50">
                    <div className="flex gap-4">
                      <input 
                        className="w-28 px-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] font-black text-slate-700 text-center focus:ring-4 focus:ring-sky-500/10 focus:border-sky-400 outline-none transition-all shadow-sm" 
                        value={cpmk.code} 
                        onChange={(e) => {
                          const newCpmks = [...rps.cpmks];
                          newCpmks[idx].code = e.target.value;
                          setRps({ ...rps, cpmks: newCpmks });
                        }}
                      />
                      <input 
                        className="flex-1 px-8 py-4 bg-white border border-slate-200 rounded-[1.5rem] font-medium text-slate-600 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-400 outline-none transition-all shadow-sm" 
                        value={cpmk.description} 
                        onChange={(e) => {
                          const newCpmks = [...rps.cpmks];
                          newCpmks[idx].description = e.target.value;
                          setRps({ ...rps, cpmks: newCpmks });
                        }}
                        placeholder="Deskripsi capaian mata kuliah..."
                      />
                      <button 
                        onClick={() => setRps({ ...rps, cpmks: rps.cpmks.filter(c => c.id !== cpmk.id) })}
                        className="p-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-[1.5rem] transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 items-center pl-4 border-l-4 border-indigo-100 pt-2 ml-2">
                      <div className="flex justify-between items-center w-full mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Relasi ke CPL:</span>
                        <button 
                          onClick={async () => {
                            if (!cpmk.description) return alert("Isi deskripsi CPMK terlebih dahulu");
                            const suggested = await suggestMapping(cpmk.description, rps.cpls);
                            const newCpmks = [...rps.cpmks];
                            newCpmks[idx].mappedCPLIds = suggested;
                            setRps({ ...rps, cpmks: newCpmks });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100"
                        >
                          <Sparkles className="w-3 h-3" /> Auto-Map CPL
                        </button>
                      </div>
                      {rps.cpls.map(cpl => (
                        <button
                          key={cpl.id}
                          onClick={() => {
                            const newCpmks = [...rps.cpmks];
                            const isMapped = newCpmks[idx].mappedCPLIds.includes(cpl.id);
                            if (isMapped) {
                              newCpmks[idx].mappedCPLIds = newCpmks[idx].mappedCPLIds.filter(id => id !== cpl.id);
                            } else {
                              newCpmks[idx].mappedCPLIds.push(cpl.id);
                            }
                            setRps({ ...rps, cpmks: newCpmks });
                          }}
                          className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
                            cpmk.mappedCPLIds.includes(cpl.id) 
                              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                              : "bg-white text-slate-400 border border-slate-100 hover:border-indigo-200 hover:text-indigo-500"
                          }`}
                        >
                          {cpl.code}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Matrix Section */}
            {rps.cpmks.length > 0 && rps.cpls.length > 0 && (
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-12 rounded-[4rem] text-white space-y-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
                <div className="flex items-center gap-6 relative z-10">
                   <div className="p-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10">
                    <Layout className="w-8 h-8 text-indigo-300" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tight">Matrik Pemetaan CPL - CPMK</h3>
                    <p className="text-indigo-200/60 text-xs font-medium uppercase tracking-widest leading-none">Visualisasi Hubungan Kompetensi Lulusan dan Mata Kuliah</p>
                  </div>
                </div>
                
                <div className="overflow-x-auto rounded-[2.5rem] border border-white/5 bg-white/5 backdrop-blur-sm relative z-10 shrink-0">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-white/10">
                        <th className="p-8 text-left text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] sticky left-0 bg-[#1e293b] border-r border-white/10">KOMPETENSI</th>
                        {rps.cpls.map(cpl => (
                          <th key={cpl.id} className="p-8 text-center text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] border-r border-white/10 last:border-0" title={cpl.description}>
                            {cpl.code}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rps.cpmks.map((cpmk, cpmkIdx) => (
                        <tr key={cpmk.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-all">
                          <td className="p-8 font-black text-white text-sm sticky left-0 bg-[#1e293b]/90 backdrop-blur-md border-r border-white/10">
                            {cpmk.code}
                          </td>
                          {rps.cpls.map(cpl => {
                            const isMapped = cpmk.mappedCPLIds.includes(cpl.id);
                            return (
                              <td key={cpl.id} className="p-8 text-center border-r border-white/5 last:border-0">
                                <button
                                  onClick={() => {
                                    const newCpmks = [...rps.cpmks];
                                    if (isMapped) {
                                      newCpmks[cpmkIdx].mappedCPLIds = newCpmks[cpmkIdx].mappedCPLIds.filter(id => id !== cpl.id);
                                    } else {
                                      newCpmks[cpmkIdx].mappedCPLIds.push(cpl.id);
                                    }
                                    setRps({ ...rps, cpmks: newCpmks });
                                  }}
                                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto transition-all ${
                                    isMapped 
                                      ? "bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-xl shadow-indigo-500/20 scale-110" 
                                      : "bg-white/5 text-transparent hover:bg-white/10 hover:text-white/20"
                                  }`}
                                >
                                  <Check className={`w-6 h-6 ${isMapped ? "scale-100 opacity-100" : "scale-0 opacity-0"} transition-all`} />
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sub-CPMK Section */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] space-y-8 group">
              <div className="flex justify-between items-center px-2">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-2xl">
                      <MapIcon className="w-5 h-5" />
                    </div>
                    Sub-CPMK Mingguan
                  </h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest pl-11">CAPAIAN PEMBELAJARAN KHUSUS</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button 
                    type="button"
                    onClick={handleGenerateSubCPMKsAI}
                    disabled={isGeneratingSubCPMK}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:opacity-90 transition-all font-black text-[10px] uppercase tracking-widest shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingSubCPMK ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Bantu Isi Sub-CPMK (AI)
                  </button>
                  <button 
                    onClick={() => setRps(prev => ({ ...prev, subCpmks: [...prev.subCpmks, { id: Date.now().toString(), code: `Sub-CPMK-${prev.subCpmks.length + 1}`, description: "", mappedCPMKIds: [] }] }))}
                    className="flex items-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Tambah Sub-CPMK
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {rps.subCpmks.map((sub, idx) => (
                  <div key={sub.id} className="p-8 bg-slate-50/50 border border-slate-100 rounded-[3rem] space-y-6 hover:bg-white hover:border-emerald-100 transition-all group/item shadow-sm hover:shadow-xl hover:shadow-emerald-50/50">
                    <div className="flex gap-4">
                      <input 
                        className="w-32 px-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] font-black text-slate-700 text-center focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 outline-none transition-all shadow-sm" 
                        value={sub.code} 
                        onChange={(e) => {
                          const newSubs = [...rps.subCpmks];
                          newSubs[idx].code = e.target.value;
                          setRps({ ...rps, subCpmks: newSubs });
                        }}
                      />
                      <input 
                        className="flex-1 px-8 py-4 bg-white border border-slate-200 rounded-[1.5rem] font-medium text-slate-600 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 outline-none transition-all shadow-sm" 
                        value={sub.description} 
                        onChange={(e) => {
                          const newSubs = [...rps.subCpmks];
                          newSubs[idx].description = e.target.value;
                          setRps({ ...rps, subCpmks: newSubs });
                        }}
                        placeholder="Deskripsi capaian khusus mingguan..."
                      />
                      <button 
                        onClick={() => setRps({ ...rps, subCpmks: rps.subCpmks.filter(s => s.id !== sub.id) })}
                        className="p-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-[1.5rem] transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 items-center pl-4 border-l-4 border-sky-100 pt-2 ml-2">
                      <div className="flex justify-between items-center w-full mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Relasi ke CPMK:</span>
                        <button 
                          onClick={async () => {
                            if (!sub.description) return alert("Isi deskripsi Sub-CPMK terlebih dahulu");
                            const suggested = await suggestMapping(sub.description, rps.cpmks);
                            const newSubs = [...rps.subCpmks];
                            newSubs[idx].mappedCPMKIds = suggested;
                            setRps({ ...rps, subCpmks: newSubs });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-sky-100 transition-all border border-sky-100"
                        >
                          <Sparkles className="w-3 h-3" /> Auto-Map CPMK
                        </button>
                      </div>
                      {rps.cpmks.map(cpmk => (
                        <button
                          key={cpmk.id}
                          onClick={() => {
                            const newSubs = [...rps.subCpmks];
                            const isMapped = newSubs[idx].mappedCPMKIds.includes(cpmk.id);
                            if (isMapped) {
                              newSubs[idx].mappedCPMKIds = newSubs[idx].mappedCPMKIds.filter(id => id !== cpmk.id);
                            } else {
                              newSubs[idx].mappedCPMKIds.push(cpmk.id);
                            }
                            setRps({ ...rps, subCpmks: newSubs });
                          }}
                          className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
                            sub.mappedCPMKIds.includes(cpmk.id) 
                              ? "bg-sky-600 text-white shadow-lg shadow-sky-100" 
                              : "bg-white text-slate-400 border border-slate-100 hover:border-sky-200 hover:text-sky-500"
                          }`}
                        >
                          {cpmk.code}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-8 rounded-[3rem] border border-slate-100">
               <button 
                onClick={() => setActiveSection('info')}
                className="flex items-center gap-4 px-10 py-5 bg-white text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-[2rem] border border-slate-200 hover:bg-slate-100 transition-all shadow-sm"
              >
                Kembali
              </button>
              <button 
                onClick={() => setActiveSection('penilaian')}
                className="flex items-center gap-4 px-10 py-5 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1 transition-all"
              >
                Lanjut Penilaian
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case "penilaian":
        const components = rps.assessmentComponents || [];
        const totalBobot = components.reduce((sum, c) => sum + c.totalWeight, 0);
        const COLORS = ['#a855f7', '#f97316', '#14b8a6', '#f43f5e', '#3b82f6', '#ec4899'];
        
        const chartData = components.map(c => ({
          name: c.name,
          value: c.totalWeight
        }));

        const addComponent = (name: string, description: string, type: string) => {
          const newComponent = {
            id: Date.now().toString(),
            name,
            description,
            type,
            c1: 0,
            c2: 0,
            c3: 0,
            c4: 0,
            c5: 0,
            totalWeight: 0
          };
          setRps(prev => ({
            ...prev,
            assessmentComponents: [...(prev.assessmentComponents || []), newComponent]
          }));
        };

        const handleCustomAdd = () => {
          setShowCustomForm(true);
        };

        const submitCustomAdd = () => {
          if (newCompName.trim()) {
            addComponent(newCompName.toUpperCase(), newCompDesc, "Custom");
            if (!customTemplates.find(t => t.name === newCompName.toUpperCase())) {
              setCustomTemplates(prev => [...prev, { name: newCompName.toUpperCase(), desc: newCompDesc, type: "Custom" }]);
            }
            setNewCompName("");
            setNewCompDesc("");
            setShowCustomForm(false);
          }
        };

        const updateComponent = (id: string, updates: any) => {
          setRps(prev => {
            const comps = (prev.assessmentComponents || []).map(c => {
              if (c.id === id) {
                return { ...c, ...updates };
              }
              return c;
            });
            return { ...prev, assessmentComponents: comps };
          });
        };

        return (
          <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-purple-500 rounded-full" />
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Komponen Penilaian</h2>
                </div>
                <p className="text-slate-500 font-medium ml-4 tracking-tight">Tentukan bobot penilaian untuk setiap kriteria evaluasi.</p>
              </div>
              <button 
                onClick={() => {
                  const utsWeight = rps.weeklyPlans[7].weight;
                  const uasWeight = rps.weeklyPlans[15].weight;
                  
                  setRps(prev => {
                    const newComps = (prev.assessmentComponents || []).map(c => {
                      if (c.type === 'UTS') return { ...c, totalWeight: utsWeight };
                      if (c.type === 'UAS') return { ...c, totalWeight: uasWeight };
                      return c;
                    });
                    return { ...prev, assessmentComponents: newComps };
                  });
                  alert(`Bobot disinkronkan: UTS (${utsWeight}%) & UAS (${uasWeight}%) dari Materi Mingguan.`);
                }}
                className="px-6 py-3 bg-purple-50 text-purple-600 rounded-2xl border border-purple-100 hover:bg-purple-100 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm flex items-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" /> Sync Bobot dari Materi
              </button>
            </header>

            <div className="flex flex-wrap gap-4 p-8 bg-slate-50/50 rounded-[3rem] border border-slate-100 items-center">
              <div className="p-3 bg-white rounded-2xl shadow-sm mr-2">
                <Plus className="w-5 h-5 text-purple-600" />
              </div>
              <button 
                onClick={() => addComponent('PROYEK KELOMPOK', 'Hasil Proyek Kelompok', 'Proyek')} 
                className="px-6 py-3 bg-white border border-slate-200 rounded-[1.5rem] text-[10px] font-black text-slate-600 hover:bg-white hover:border-purple-300 hover:shadow-lg hover:shadow-purple-50 transition-all uppercase tracking-widest shadow-sm"
              >
                Proyek Kelompok
              </button>
              <button onClick={() => addComponent('PRAKTIKUM', 'Praktik Lapangan/Lab', 'Praktikum')} className="px-6 py-3 bg-white border border-slate-200 rounded-[1.5rem] text-[10px] font-black text-slate-600 hover:bg-white hover:border-purple-300 hover:shadow-lg hover:shadow-purple-50 transition-all uppercase tracking-widest shadow-sm">
                Praktikum
              </button>
              <button onClick={() => addComponent('STUDI KASUS', 'Analisis Studi Kasus', 'Studi Kasus')} className="px-6 py-3 bg-white border border-slate-200 rounded-[1.5rem] text-[10px] font-black text-slate-600 hover:bg-white hover:border-purple-300 hover:shadow-lg hover:shadow-purple-50 transition-all uppercase tracking-widest shadow-sm">
                Studi Kasus
              </button>
              <button onClick={() => addComponent('PORTOFOLIO', 'Kumpulan Karya', 'Portofolio')} className="px-6 py-3 bg-white border border-slate-200 rounded-[1.5rem] text-[10px] font-black text-slate-600 hover:bg-white hover:border-purple-300 hover:shadow-lg hover:shadow-purple-50 transition-all uppercase tracking-widest shadow-sm">
                Portofolio
              </button>
              <button onClick={() => addComponent('KUIS/TUGAS', 'Evaluasi Formatif', 'Tugas')} className="px-6 py-3 bg-white border border-slate-200 rounded-[1.5rem] text-[10px] font-black text-slate-600 hover:bg-white hover:border-purple-300 hover:shadow-lg hover:shadow-purple-50 transition-all uppercase tracking-widest shadow-sm">
                Kuis/Tugas
              </button>
              <button onClick={() => addComponent('UTS', 'Ujian Tengah Semester', 'UTS')} className="px-6 py-3 bg-white border border-slate-200 rounded-[1.5rem] text-[10px] font-black text-slate-600 hover:bg-white hover:border-purple-300 hover:shadow-lg hover:shadow-purple-50 transition-all uppercase tracking-widest shadow-sm">
                UTS
              </button>
              <button onClick={() => addComponent('UAS', 'Ujian Akhir Semester', 'UAS')} className="px-6 py-3 bg-white border border-slate-200 rounded-[1.5rem] text-[10px] font-black text-slate-600 hover:bg-white hover:border-purple-300 hover:shadow-lg hover:shadow-purple-50 transition-all uppercase tracking-widest shadow-sm">
                UAS
              </button>
              
              {customTemplates.map((template, idx) => (
                <button 
                  key={idx} 
                  onClick={() => addComponent(template.name, template.desc, template.type)} 
                  className="px-6 py-3 bg-purple-50 border border-purple-100 rounded-[1.5rem] text-[10px] font-black text-purple-600 hover:bg-white hover:border-purple-400 hover:shadow-lg hover:shadow-purple-50 transition-all uppercase tracking-widest shadow-sm"
                >
                   {template.name}
                </button>
              ))}

              <button 
                onClick={handleCustomAdd} 
                className="px-6 py-3 bg-slate-900 border border-slate-900 rounded-[1.5rem] text-[10px] font-black text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest"
              >
                + Custom
              </button>
            </div>

            {showCustomForm && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row gap-4 p-6 bg-purple-50 rounded-[2rem] border border-purple-100 items-end"
              >
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-2">Nama Komponen</label>
                  <input 
                    className="w-full px-4 py-3 bg-white border border-purple-100 rounded-xl focus:ring-4 focus:ring-purple-500/10 outline-none text-sm font-bold uppercase"
                    value={newCompName}
                    onChange={(e) => setNewCompName(e.target.value)}
                    placeholder="E.G. PRESENTASI"
                  />
                </div>
                <div className="flex-[2] space-y-2">
                  <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-2">Deskripsi</label>
                  <input 
                    className="w-full px-4 py-3 bg-white border border-purple-100 rounded-xl focus:ring-4 focus:ring-purple-500/10 outline-none text-sm font-bold"
                    value={newCompDesc}
                    onChange={(e) => setNewCompDesc(e.target.value)}
                    placeholder="Deskripsi singkat..."
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={submitCustomAdd}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all"
                  >
                    Simpan
                  </button>
                  <button 
                    onClick={() => setShowCustomForm(false)}
                    className="px-6 py-3 bg-white text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    Batal
                  </button>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
              <div className="lg:col-span-2 space-y-6">
                {components.map((comp) => (
                  <div key={comp.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] space-y-6 group relative transition-all hover:border-purple-100 hover:shadow-xl hover:shadow-indigo-50/50">
                    <button 
                      onClick={() => setRps(prev => ({ ...prev, assessmentComponents: (prev.assessmentComponents || []).filter(c => c.id !== comp.id) }))}
                      className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nama / Deskripsi Komponen</label>
                          <input 
                            className="w-full bg-transparent border-none focus:ring-0 outline-none font-black text-slate-800 p-0 text-xl placeholder:text-slate-200 uppercase" 
                            value={comp.name} 
                            onChange={(e) => updateComponent(comp.id, { name: e.target.value.toUpperCase() })}
                            placeholder="NAMA KOMPONEN"
                          />
                          <input 
                            className="w-full bg-transparent border-none focus:ring-0 outline-none font-bold text-slate-400 p-0 text-xs italic" 
                            value={comp.description} 
                            onChange={(e) => updateComponent(comp.id, { description: e.target.value })}
                            placeholder="Tambahkan deskripsi singkat di sini..."
                          />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-6 border-t border-slate-100">
                          {rps.cpls.length > 0 ? rps.cpls.map((cpl, i) => (
                            <div key={cpl.id} className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block" title={cpl.description}>{cpl.code}</label>
                              <input 
                                type="number" 
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-center font-black text-slate-700 focus:ring-4 focus:ring-purple-500/10 focus:bg-white outline-none transition-all shadow-sm text-sm"
                                value={comp[`c${i+1}` as keyof typeof comp] || 0}
                                onChange={(e) => {
                                  if (i >= 5) return; // Limit to 5 columns for now as per type
                                  const val = parseInt(e.target.value) || 0;
                                  const key = `c${i+1}` as keyof typeof comp;
                                  const updates = { [key]: val };
                                  // Caluculate total from inputs
                                  const others = [1,2,3,4,5].map(n => `c${n}`).filter(k => k !== key).reduce((s, k) => s + (comp[k as keyof any] || 0), 0);
                                  updateComponent(comp.id, { ...updates, totalWeight: val + others });
                                }}
                              />
                            </div>
                          )) : (
                            <div className="col-span-full py-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Belum ada CPL yang didefinisikan</div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col justify-center items-center p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-50 min-w-[120px]">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Bobot</label>
                        <div className="flex items-baseline gap-0.5">
                          <input 
                            type="number"
                            className={`bg-transparent border-none focus:ring-0 outline-none text-3xl font-black text-indigo-600 w-16 p-0 text-center ${comp.type === 'UTS' || comp.type === 'UAS' ? 'opacity-70 cursor-not-allowed' : ''}`}
                            value={comp.totalWeight}
                            onChange={(e) => updateComponent(comp.id, { totalWeight: parseInt(e.target.value) || 0 })}
                            readOnly={comp.type === 'UTS' || comp.type === 'UAS'}
                          />
                          <span className="text-sm font-black text-indigo-300">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6 sticky top-24">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] space-y-8 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50/50 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                   
                   <div className="space-y-1 relative z-10">
                     <h3 className="text-xl font-black text-slate-800">Ringkasan Bobot</h3>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DISTRIBUSI NILAI AKHIR</p>
                   </div>

                   <div className="h-[250px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.length > 0 ? chartData : [{ name: 'Empty', value: 100 }]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                          {chartData.length === 0 && <Cell fill="#f1f5f9" />}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                      <p className="text-3xl font-black text-slate-800 leading-none">{totalBobot}%</p>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">TOTAL</p>
                    </div>
                  </div>

                  <div className="space-y-3 relative z-10">
                    {components.map((c, i) => (
                      <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-[11px] font-extrabold text-slate-600 truncate max-w-[120px]">{c.name}</span>
                        </div>
                        <span className="text-xs font-black text-slate-800">{c.totalWeight}%</span>
                      </div>
                    ))}
                    {totalBobot !== 100 && (
                      <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 text-center animate-pulse mt-4">
                        <p className="text-[10px] font-black uppercase tracking-widest">Peringatan: Total harus 100%</p>
                        <p className="font-bold text-xs mt-1">Sisa: {100 - totalBobot}%</p>
                      </div>
                    )}
                    {totalBobot === 100 && (
                      <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 text-center mt-4">
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Valid: Total 100%</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-8 rounded-[3rem] border border-slate-100">
               <button 
                onClick={() => setActiveSection('mapping')}
                className="flex items-center gap-4 px-10 py-5 bg-white text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-[2rem] border border-slate-200 hover:bg-slate-100 transition-all shadow-sm"
              >
                Kembali
              </button>
              <button 
                onClick={() => setActiveSection('weekly')}
                className="flex items-center gap-4 px-10 py-5 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1 transition-all"
              >
                Lanjut Plan Mingguan
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case "weekly":
        return (
          <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Rencana Mingguan</h2>
                </div>
                <p className="text-slate-500 font-medium ml-4 tracking-tight">Rincian aktivitas pembelajaran per pertemuan (16 Minggu).</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  type="button"
                  onClick={handleGenerateWeeklyAI}
                  disabled={isGeneratingWeekly}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-200/80 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingWeekly ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                  )}
                  {isGeneratingWeekly ? "Meng-generate..." : "Generate Materi Mingguan (AI)"}
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    const newPlans = [...rps.weeklyPlans];
                    const utsComp = (rps.assessmentComponents || []).find(c => c.type === 'UTS');
                    const uasComp = (rps.assessmentComponents || []).find(c => c.type === 'UAS');
                    
                    if (utsComp) newPlans[7].weight = utsComp.totalWeight;
                    if (uasComp) newPlans[15].weight = uasComp.totalWeight;
                    
                    setRps({...rps, weeklyPlans: newPlans});
                    alert("Bobot UTS/UAS disinkronkan dari Komponen Penilaian.");
                  }}
                  className="px-6 py-3 bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm flex items-center gap-2 cursor-pointer rounded-2xl"
                >
                  <RefreshCcw className="w-4 h-4" /> Sync Bobot UTS/UAS
                </button>
              </div>
            </header>

            <div className="space-y-6">
              {rps.weeklyPlans.map((plan, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] transition-all hover:bg-slate-50/30 group">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Week Indicator */}
                    <div className="lg:col-span-1 flex flex-col items-center justify-center">
                       <div className={`w-16 h-16 rounded-[1.5rem] flex flex-col items-center justify-center border-2 transition-all ${
                        plan.week === 8 ? "bg-amber-50 border-amber-200" : 
                        plan.week === 16 ? "bg-rose-50 border-rose-200" : 
                        "bg-slate-50 border-slate-200 group-hover:bg-white group-hover:border-indigo-200"
                      }`}>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${
                          plan.week === 8 ? "text-amber-500" : 
                          plan.week === 16 ? "text-rose-500" : 
                          "text-slate-400"
                        }`}>
                          {plan.week === 8 ? "UTS" : plan.week === 16 ? "UAS" : "WEEK"}
                        </span>
                        <span className={`text-2xl font-black ${
                          plan.week === 8 ? "text-amber-700" : 
                          plan.week === 16 ? "text-rose-700" : 
                          "text-slate-800"
                        }`}>{plan.week}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-7 space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 ml-2">
                           <div className="w-1.5 h-4 bg-indigo-200 rounded-full" />
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Materi & Sub-CPMK</label>
                        </div>
                        <textarea
                          value={plan.materials}
                          onChange={(e) => {
                            const newPlans = [...rps.weeklyPlans];
                            newPlans[idx].materials = e.target.value;
                            setRps({ ...rps, weeklyPlans: newPlans });
                          }}
                          className="w-full text-base font-bold text-slate-700 bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-400 outline-none transition-all min-h-[140px] resize-none shadow-sm"
                          placeholder="Masukkan materi pembelajaran minggu ini..."
                        />
                        <div className="flex flex-wrap gap-3 pl-2">
                          {rps.subCpmks.map(sub => (
                            <button
                              key={sub.id}
                              onClick={() => {
                                const newPlans = [...rps.weeklyPlans];
                                const isSelected = newPlans[idx].subCPMKIds.includes(sub.id);
                                if (isSelected) {
                                  newPlans[idx].subCPMKIds = newPlans[idx].subCPMKIds.filter(id => id !== sub.id);
                                } else {
                                  newPlans[idx].subCPMKIds.push(sub.id);
                                }
                                setRps({ ...rps, weeklyPlans: newPlans });
                              }}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border uppercase tracking-widest ${
                                plan.subCPMKIds.includes(sub.id)
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100"
                                  : "bg-white text-slate-400 border-slate-100 hover:border-indigo-300 hover:text-indigo-600"
                              }`}
                            >
                              {sub.code}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                         <div className="flex items-center gap-3 ml-2">
                           <div className="w-1.5 h-4 bg-emerald-200 rounded-full" />
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pengalaman Belajar</label>
                        </div>
                        <input
                          value={plan.experience}
                          onChange={(e) => {
                            const newPlans = [...rps.weeklyPlans];
                            newPlans[idx].experience = e.target.value;
                            setRps({ ...rps, weeklyPlans: newPlans });
                          }}
                          className="w-full px-8 py-4 bg-emerald-50/30 border border-emerald-50 rounded-[1.5rem] text-sm text-emerald-800 font-medium italic focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-200 outline-none transition-all shadow-sm"
                          placeholder="Contoh: Mahasiswa melakukan simulasi..."
                        />
                      </div>
                    </div>

                    {/* Method & Weight */}
                    <div className="lg:col-span-4 grid grid-cols-1 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 ml-2">
                           <div className="w-1.5 h-4 bg-sky-200 rounded-full" />
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Metode | Media | Penilaian</label>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 focus-within:border-sky-300 focus-within:bg-white transition-all">
                             <div className="p-2 bg-white rounded-xl shadow-sm text-sky-500">
                                <MapIcon className="w-4 h-4" />
                             </div>
                             <input
                                value={plan.method}
                                onChange={(e) => {
                                  const newPlans = [...rps.weeklyPlans];
                                  newPlans[idx].method = e.target.value;
                                  setRps({ ...rps, weeklyPlans: newPlans });
                                }}
                                className="bg-transparent border-none focus:ring-0 outline-none text-xs font-bold text-slate-700 w-full"
                                placeholder="Metode (e.g. Ceramah, DL)"
                              />
                          </div>
                          
                          <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 focus-within:border-sky-300 focus-within:bg-white transition-all">
                             <div className="p-2 bg-white rounded-xl shadow-sm text-sky-500">
                                <Database className="w-4 h-4" />
                             </div>
                             <input
                                value={plan.media || ""}
                                onChange={(e) => {
                                  const newPlans = [...rps.weeklyPlans];
                                  newPlans[idx].media = e.target.value;
                                  setRps({ ...rps, weeklyPlans: newPlans });
                                }}
                                className="bg-transparent border-none focus:ring-0 outline-none text-xs font-bold text-slate-700 w-full"
                                placeholder="Media (e.g. Zoom, PPT)"
                              />
                          </div>

                          <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 focus-within:border-rose-300 focus-within:bg-white transition-all">
                             <div className="p-2 bg-white rounded-xl shadow-sm text-rose-500">
                                <Target className="w-4 h-4" />
                             </div>
                             <input
                                value={plan.assessmentIndicator}
                                onChange={(e) => {
                                  const newPlans = [...rps.weeklyPlans];
                                  newPlans[idx].assessmentIndicator = e.target.value;
                                  setRps({ ...rps, weeklyPlans: newPlans });
                                }}
                                className="bg-transparent border-none focus:ring-0 outline-none text-xs font-bold text-slate-700 w-full"
                                placeholder="Indikator Penilaian"
                              />
                          </div>
                          
                          <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 focus-within:border-amber-300 focus-within:bg-white transition-all">
                             <div className="p-2 bg-white rounded-xl shadow-sm text-amber-500">
                                <CheckCircle2 className="w-4 h-4" />
                             </div>
                             <input
                                value={plan.assessmentCriteria}
                                onChange={(e) => {
                                  const newPlans = [...rps.weeklyPlans];
                                  newPlans[idx].assessmentCriteria = e.target.value;
                                  setRps({ ...rps, weeklyPlans: newPlans });
                                }}
                                className="bg-transparent border-none focus:ring-0 outline-none text-xs font-bold text-slate-700 w-full"
                                placeholder="Kriteria Penilaian"
                              />
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-900 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 blur-2xl rounded-full" />
                        <label className="text-[9px] font-black text-sky-300 uppercase tracking-[0.3em] mb-4">Bobot Nilai</label>
                        <div className="flex items-center gap-2">
                           <input
                            type="number"
                            value={plan.weight}
                            onChange={(e) => {
                              const newPlans = [...rps.weeklyPlans];
                              newPlans[idx].weight = parseInt(e.target.value) || 0;
                              setRps({ ...rps, weeklyPlans: newPlans });
                            }}
                            className="bg-transparent border-none focus:ring-0 outline-none text-4xl font-black text-white w-20 text-center"
                          />
                          <span className="text-xl font-black text-sky-400">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 md:p-10 rounded-[3rem] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl shadow-slate-100">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="space-y-2 relative z-10 max-w-md">
                <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-full text-[9px] font-black uppercase tracking-widest leading-none">
                  Langkah Terakhir Selesai
                </span>
                <h3 className="text-xl font-black tracking-tight text-white">RPS Anda Selesai Diisi!</h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">Lengkapi pengisian dengan mencetak RPS ke format PDF resmi, menyimpan sebagai draf, atau langsung ajukan validasi ke Kaprodi.</p>
              </div>

              <div className="flex flex-wrap gap-3 items-center relative z-10">
                <button 
                  onClick={() => setActiveSection('penilaian')}
                  className="flex items-center gap-2 px-6 py-4 bg-slate-800 text-slate-400 font-black text-[10px] uppercase tracking-wider rounded-2xl border border-slate-700 hover:text-white hover:bg-slate-700 transition-all shadow-sm"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Kembali
                </button>
                <button 
                  onClick={handleSaveDraftAndPrint}
                  className="flex items-center gap-2 px-6 py-4 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-950/20 hover:bg-emerald-500 hover:-translate-y-0.5 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" /> Simpan & Cetak RPS
                </button>
                <button 
                  onClick={handleSaveAndSubmit}
                  className="flex items-center gap-2 px-6 py-4 bg-amber-600 text-white font-black text-[10px] uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-950/20 hover:bg-amber-500 hover:-translate-y-0.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Ajukan Validasi
                </button>
                <button 
                  onClick={() => setActiveSection('catatan')}
                  className="flex items-center gap-2 px-6 py-4 bg-amber-600 text-white font-black text-[10px] uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-950/20 hover:bg-amber-500 hover:-translate-y-0.5 transition-all"
                >
                  Edit Catatan <FileText className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setActiveSection('preview')}
                  className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-wider rounded-2xl shadow-xl shadow-indigo-950/20 hover:bg-indigo-500 hover:-translate-y-0.5 transition-all"
                >
                  Lihat Preview <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );

      case "catatan": {
        const defaultNotesList = [
          `Metode Pembelajaran: ${rps.courseInfo.modelPembelajaran || "Project Based Learning"}.`,
          "Materi Pembelajaran adalah rincian atau uraian dari bahan kajian yg dapat disajikan dalam bentuk beberapa pokok dan sub-pokok bahasan serta dilengkapi dengan daftar Pustaka yang didalamnya diperkaya dengan hasil penelitian/PkM dosen.",
          "Bobot penilaian adalah prosentase penilaian terhadap setiap pencapaian sub-CPMK yang besarnya proposional dengan tingkat kesulitan pencapaian sub-CPMK tersebut dan totalnya 100%.",
          "TM=Tatap Muka, PT=Penugasan terstruktur, BM=Belajar mandiri."
        ];
        const currentCatatan = (rps.catatan && rps.catatan.length > 0) ? rps.catatan : defaultNotesList;

        const updateCatatanList = (newList: string[]) => {
          setRps({ ...rps, catatan: newList });
        };

        return (
          <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-amber-500 rounded-full" />
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Catatan Dokumen RPS</h2>
                </div>
                <p className="text-slate-500 font-medium ml-4 tracking-tight">
                  Kelola dan sesuaikan daftar catatan resmi yang akan dicetak pada bagian bawah RPS.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Kembalikan catatan ke templat standar awal?")) {
                      updateCatatanList(defaultNotesList);
                    }
                  }}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCcw className="w-4 h-4" /> Reset Catatan Standar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateCatatanList([...currentCatatan, "Catatan tambahan baru..."]);
                  }}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-600/20 flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Tambah Catatan
                </button>
              </div>
            </header>

            <div className="space-y-4">
              {currentCatatan.map((note, index) => (
                <div key={index} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start gap-4 group">
                  <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center font-black text-amber-600 text-sm border border-amber-100 shrink-0 mt-1">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 w-full space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Butir Catatan #{index + 1}
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => {
                        const updated = [...currentCatatan];
                        updated[index] = e.target.value;
                        updateCatatanList(updated);
                      }}
                      className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-amber-500/10 focus:bg-white focus:border-amber-400 outline-none transition-all resize-none min-h-[80px]"
                      placeholder="Tuliskan isi catatan..."
                    />
                  </div>

                  <div className="flex md:flex-col items-center gap-2 shrink-0 self-end md:self-center">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...currentCatatan];
                          const temp = updated[index - 1];
                          updated[index - 1] = updated[index];
                          updated[index] = temp;
                          updateCatatanList(updated);
                        }}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors text-xs font-bold cursor-pointer"
                        title="Geser ke atas"
                      >
                        ↑
                      </button>
                    )}
                    {index < currentCatatan.length - 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...currentCatatan];
                          const temp = updated[index + 1];
                          updated[index + 1] = updated[index];
                          updated[index] = temp;
                          updateCatatanList(updated);
                        }}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors text-xs font-bold cursor-pointer"
                        title="Geser ke bawah"
                      >
                        ↓
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (currentCatatan.length <= 1) {
                          alert("Minimal harus ada 1 catatan.");
                          return;
                        }
                        const updated = currentCatatan.filter((_, i) => i !== index);
                        updateCatatanList(updated);
                      }}
                      className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
                      title="Hapus catatan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Preview Box */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] text-white space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Pratinjau Hasil Cetak Catatan</span>
                <button
                  onClick={() => setActiveSection('preview')}
                  className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  Buka Preview & Cetak <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="bg-white text-slate-900 p-6 rounded-2xl text-xs space-y-2 border border-slate-200 font-sans shadow-inner">
                <p className="font-bold text-slate-800">Catatan :</p>
                <ol className="list-decimal list-inside space-y-1 ml-2 text-slate-700 leading-relaxed">
                  {currentCatatan.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Bottom Nav */}
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => setActiveSection('weekly')}
                className="flex items-center gap-3 px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-[10px] uppercase tracking-[0.2em] rounded-[1.5rem] transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Kembali ke Materi Mingguan
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('preview')}
                className="flex items-center gap-3 px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-[10px] uppercase tracking-[0.2em] rounded-[1.5rem] shadow-xl shadow-amber-600/25 transition-all cursor-pointer"
              >
                Lanjut Preview & Cetak <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      }

      case "preview":
        return (
          <div className="space-y-12">
            <header className="flex flex-col gap-2 print:hidden no-print">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-indigo-500 rounded-full" />
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Preview & Cetak</h2>
              </div>
              <p className="text-slate-500 font-medium ml-4 tracking-tight">Tinjau draft akhir RPS sebelum diterbitkan atau dicetak.</p>
            </header>

            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[3rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] print:hidden no-print gap-6">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-indigo-50 text-indigo-500 rounded-[2rem] shadow-sm">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                   <h3 className="text-xl font-black text-slate-800">{rps.courseInfo.name || "Mata Kuliah Belum Diisi"}</h3>
                   <div className="flex items-center gap-3 mt-1">
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest">{rps.courseInfo.code || "KODE"}</span>
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        rps.status === 'Disetujui' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        rps.status === 'Menunggu Validasi' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-slate-50 text-slate-400 border-slate-100'
                      }`}>
                        {rps.status || "Draft"}
                      </span>
                   </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                {(userRole === 'dosen' || userRole === 'kaprodi' || userRole === 'admin') && (!rps.status || rps.status === 'Draft' || rps.status === 'Revisi' || rps.status === 'Revisi Kaprodi' || rps.status === 'Revisi SPMI') && (
                  <button 
                    onClick={() => handleSaveAndSubmit()}
                    className="flex items-center gap-3 px-8 py-4 bg-amber-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-[1.5rem] shadow-xl shadow-amber-100 hover:shadow-amber-200 hover:-translate-y-1 transition-all"
                  >
                    <Sparkles className="w-4 h-4" /> Ajukan ke Kaprodi
                  </button>
                )}
                
                {(userRole === 'admin' || userRole === 'kaprodi') && (!rps.status || rps.status === 'Menunggu Validasi' || rps.status === 'Menunggu Validasi Kaprodi') && (
                  <button 
                    onClick={() => setConfirmModal({
                      isOpen: true,
                      type: 'kaprodi',
                      title: 'Validasi Kaprodi',
                      message: 'Setujui RPS ini dan kirimkan ke Ketua SPMI untuk validasi penjaminan mutu akhir?'
                    })}
                    className="flex items-center gap-3 px-8 py-4 bg-sky-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-[1.5rem] shadow-xl shadow-sky-100 hover:shadow-sky-200 hover:-translate-y-1 transition-all"
                  >
                    <Check className="w-4 h-4" /> Validasi Kaprodi ➔ Teruskan SPMI
                  </button>
                )}

                {(userRole === 'admin' || userRole === 'spmi') && (rps.status === 'Validasi Kaprodi (Menunggu SPMI)' || rps.status === 'Menunggu Validasi') && (
                  <button 
                    onClick={() => setConfirmModal({
                      isOpen: true,
                      type: 'spmi',
                      title: 'Validasi Final SPMI',
                      message: 'Terbitkan persetujuan penjaminan mutu resmi (SPMI) untuk dokumen RPS ini?'
                    })}
                    className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-[1.5rem] shadow-xl shadow-emerald-100 hover:shadow-emerald-200 hover:-translate-y-1 transition-all"
                  >
                    <Check className="w-4 h-4" /> Validasi Final SPMI
                  </button>
                )}

                <label className="flex items-center gap-2.5 px-6 py-4 bg-white text-slate-700 border border-slate-200 font-black text-[10px] uppercase tracking-[0.15em] rounded-[1.5rem] shadow-sm hover:bg-slate-50 hover:-translate-y-0.5 transition-all cursor-pointer">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>Ganti Logo Kop</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          alert("Ukuran berkas logo terlalu besar (Maksimal 5MB).");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (re) => {
                          const base64 = re.target?.result as string;
                          setSystemConfig({ ...systemConfig, institutionLogo: base64 });
                          alert("Logo Kop RPS berhasil diperbarui!");
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>

                <button 
                  onClick={() => setShowPdfWizard(true)}
                  className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-[1.5rem] shadow-xl shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-1 transition-all"
                >
                  <Printer className="w-4 h-4" /> Cetak & Ekspor PDF
                </button>
              </div>
            </div>
            
            <div className="print:m-0 print:p-0">
               <RPSPreview 
                 data={rps} 
                 institutionLogo={systemConfig.institutionLogo}
                 universityName={systemConfig.universityName}
                 universityAlias={systemConfig.universityAlias}
               />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen print:h-auto print:block print:overflow-visible bg-slate-50 text-slate-900 font-sans overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-sky-200/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-indigo-200/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 flex flex-col pt-8 print:hidden z-10 text-slate-900">
        <div className="px-8 pb-8 flex items-center gap-3">
          <img src={systemConfig.institutionLogo || "input_file_0.png"} alt="Logo" className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
          <div>
            <h1 className="text-lg font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-sky-600">OBE Master Pro</h1>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {[
            { id: "admin-dashboard", label: "Dashboard Admin", icon: Shield, adminOnly: true },
            { id: "admin-users", label: "Manajemen Pengguna", icon: Users, adminOnly: true },
            { id: "admin-core", label: "Data Inti (OBE)", icon: Settings, adminOnly: true },
            { id: "admin-rps", label: userRole === 'spmi' ? "Validasi SPMI" : userRole === 'kaprodi' ? "Validasi Kaprodi" : "Validasi RPS", icon: BookOpen, validationRole: true },
            { id: "admin-settings", label: "Pengaturan Sistem", icon: Sliders, adminOnly: true },
            { id: "dosen-status", label: "Status RPS Saya", icon: BarChart3, lecturerRole: true },
            { id: "info", label: "Informasi Umum", icon: Layout, lecturerRole: true },
            { id: "mapping", label: "Pemetaan OBE", icon: MapIcon, lecturerRole: true },
            { id: "weekly", label: "Materi Mingguan", icon: Calendar, lecturerRole: true },
            { id: "penilaian", label: "Penilaian", icon: BarChart3, lecturerRole: true },
            { id: "catatan", label: "Catatan RPS", icon: FileText, lecturerRole: true },
            { id: "preview", label: "Preview & Cetak", icon: FileText },
          ].filter(item => {
            if (userRole === 'admin') return true;
            if (item.adminOnly && userRole !== 'admin') return false;
            if (item.validationRole && userRole !== 'admin' && userRole !== 'kaprodi' && userRole !== 'spmi') return false;
            if (item.lecturerRole && userRole !== 'dosen' && userRole !== 'kaprodi' && userRole !== 'admin') return false;
            return true;
          }).map((item) => {
            const pendingCount = publishedRPS.filter(r => 
              userRole === 'spmi'
                ? r.status === 'Validasi Kaprodi (Menunggu SPMI)'
                : r.status === 'Menunggu Validasi' || r.status === 'Menunggu Validasi Kaprodi'
            ).length;
            const showBadge = item.id === "admin-rps" && pendingCount > 0;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                  activeSection === item.id
                    ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {activeSection === item.id && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"
                  />
                )}
                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeSection === item.id ? "text-indigo-600" : "text-slate-400"}`} />
                <span className="text-sm font-bold flex-1 text-left">{item.label}</span>
                {showBadge && (
                  <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded-lg text-[9px] font-black animate-pulse border border-amber-200">
                    {pendingCount}
                  </span>
                )}
                {activeSection === item.id && !showBadge && (
                  <ChevronRight className="w-4 h-4 ml-auto text-indigo-300" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-4 pb-2 mt-4 space-y-1.5">
          <button
            onClick={() => setShowGasModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-extrabold text-xs border border-emerald-100/80 shadow-sm group"
          >
            <Code2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span>Google Apps Script</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-slate-500 hover:bg-rose-50 hover:text-rose-600 font-bold group text-xs"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
            <span>Keluar Dashboard</span>
          </button>
        </div>

        <div className="p-6">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2rem] p-6 text-white space-y-3 relative overflow-hidden group shadow-2xl">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <Sparkles className="w-12 h-12 absolute -top-2 -right-2 text-white/10 group-hover:rotate-12 transition-transform" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">Smart Assist</p>
            <p className="text-sm font-semibold leading-relaxed relative z-10">Optimasi kurikulum dengan AI cerdas.</p>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-2">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "70%" }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-sky-400 to-indigo-400"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth print:p-0 print:overflow-visible print:block print:h-auto z-10">
        <div className={`mx-auto space-y-8 ${activeSection === 'preview' ? 'max-w-none print:w-full print:m-0' : 'max-w-5xl'}`}>
          {successNotice && (
            <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 rounded-3xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-300 no-print">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-md">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-extrabold text-xs uppercase tracking-wider text-emerald-900">Validasi Berhasil</p>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">{successNotice}</p>
                </div>
              </div>
              <button 
                onClick={() => setSuccessNotice(null)}
                className="p-2 hover:bg-emerald-200/50 rounded-xl text-emerald-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`bg-white/70 backdrop-blur-md p-8 md:p-10 rounded-[2.5rem] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden ${activeSection === 'preview' ? 'print:p-0 print:border-0 print:shadow-none print:rounded-none print:bg-white' : ''}`}
            >
              {/* Internal decorative blob */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 blur-3xl -z-10 rounded-full translate-x-1/2 -translate-y-1/2" />
              
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Custom Confirmation Modal for Validation Alur */}
      <AnimatePresence>
        {confirmModal?.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm no-print">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 text-center relative z-50"
            >
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600 shadow-sm border border-amber-100">
                <Sparkles className="w-8 h-8" />
              </div>
              
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">{confirmModal.title}</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">{confirmModal.message}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Dampak Pengesahan:</p>
                <p className="text-xs font-bold text-slate-700">
                  {confirmModal.type === 'dosen' && "✔ Tanda centang Koordinator Mata Kuliah akan terbit pada halaman Preview & Cetak."}
                  {confirmModal.type === 'kaprodi' && "✔ Tanda centang Kaprodi akan terbit & diteruskan ke Ketua SPMI."}
                  {confirmModal.type === 'spmi' && "✔ Tanda centang Ketua SPMI terbit & RPS berstatus Disetujui (Final Resmi)."}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={executeValidation}
                  className="flex-1 py-4 bg-amber-600 hover:bg-amber-500 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-600/25 hover:shadow-amber-600/40 hover:-translate-y-0.5 cursor-pointer"
                >
                  Lanjutkan Validasi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Tambah Custom Program Studi */}
      <AnimatePresence>
        {showCustomProdiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm no-print">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 text-slate-800 relative z-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Tambah Custom Program Studi</h3>
                    <p className="text-xs text-slate-500 font-medium">Tambahkan program studi baru ke pilihan menu.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomProdiModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nama Program Studi</label>
                  <input
                    type="text"
                    value={customProdiName}
                    onChange={(e) => setCustomProdiName(e.target.value)}
                    placeholder="Contoh: S1 Teknologi Informasi"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Kode / Singkatan Prodi (Opsional)</label>
                  <input
                    type="text"
                    value={customProdiCode}
                    onChange={(e) => setCustomProdiCode(e.target.value)}
                    placeholder="Contoh: TI"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomProdiModal(false)}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!customProdiName.trim()) {
                      alert("Masukkan nama Program Studi terlebih dahulu.");
                      return;
                    }
                    const nameTrimmed = customProdiName.trim();
                    const codeTrimmed = customProdiCode.trim() || nameTrimmed.substring(0, 4).toUpperCase();
                    
                    const exists = programStudis.find(p => p.name.toLowerCase() === nameTrimmed.toLowerCase());
                    if (!exists) {
                      const newProdi = { id: Date.now().toString(), name: nameTrimmed, code: codeTrimmed };
                      setProgramStudis(prev => [...prev, newProdi]);
                    }
                    
                    updateCourseInfo({ program: nameTrimmed });
                    setCustomProdiName("");
                    setCustomProdiCode("");
                    setShowCustomProdiModal(false);
                  }}
                  className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
                >
                  Simpan & Pilih
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Tambah Pengguna Baru */}
      <AnimatePresence>
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm no-print">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-6 text-slate-800 relative z-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Tambah Pengguna Baru</h3>
                    <p className="text-xs text-slate-500 font-medium">Buat akun civitas akademika baru di sistem.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nama Lengkap & Gelar *</label>
                  <input
                    type="text"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    placeholder="Contoh: Dr. Budi Santoso, S.T., M.Kom."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">NIDN / Username *</label>
                    <input
                      type="text"
                      value={newUserForm.nidn}
                      onChange={(e) => setNewUserForm({ ...newUserForm, nidn: e.target.value })}
                      placeholder="Contoh: 0612048501"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Hak Akses / Role *</label>
                    <select
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all cursor-pointer"
                    >
                      <option value="dosen">Dosen Pengampu</option>
                      <option value="kaprodi">Kaprodi (Ketua Prodi)</option>
                      <option value="spmi">Ketua SPMI</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Alamat Email *</label>
                  <input
                    type="email"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    placeholder="Contoh: budi@polsa.ac.id"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Kata Sandi / Password *</label>
                  <input
                    type="text"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!newUserForm.name.trim()) {
                      alert("Nama lengkap pengguna wajib diisi.");
                      return;
                    }
                    if (!newUserForm.nidn.trim()) {
                      alert("NIDN / Username pengguna wajib diisi.");
                      return;
                    }
                    if (!newUserForm.email.trim()) {
                      alert("Alamat email pengguna wajib diisi.");
                      return;
                    }
                    if (!newUserForm.password.trim()) {
                      alert("Password wajib diisi.");
                      return;
                    }

                    const exists = lecturers.find(
                      l => l.nidn.toLowerCase() === newUserForm.nidn.trim().toLowerCase() ||
                           l.email.toLowerCase() === newUserForm.email.trim().toLowerCase()
                    );
                    if (exists) {
                      alert("NIDN / Username atau Email sudah terdaftar. Gunakan NIDN/email lain.");
                      return;
                    }

                    const createdUser: Lecturer = {
                      id: Date.now().toString(),
                      name: newUserForm.name.trim(),
                      nidn: newUserForm.nidn.trim(),
                      email: newUserForm.email.trim(),
                      role: newUserForm.role,
                      password: newUserForm.password.trim()
                    };

                    setLecturers(prev => [...prev, createdUser]);
                    setShowAddUserModal(false);
                    setNewUserForm({ name: "", nidn: "", email: "", role: "dosen", password: "" });
                    setSuccessNotice(`User "${createdUser.name}" (${createdUser.role}) berhasil ditambahkan!`);
                  }}
                  className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
                >
                  Simpan Pengguna
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Edit / Reset Password User */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm no-print">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 text-slate-800 relative z-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Ubah Password Pengguna</h3>
                    <p className="text-xs text-slate-500 font-medium">{editingUser.name} ({editingUser.nidn})</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Password Baru</label>
                  <input
                    type="text"
                    value={editPasswordValue}
                    onChange={(e) => setEditPasswordValue(e.target.value)}
                    placeholder="Masukkan password baru..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!editPasswordValue.trim()) {
                      alert("Masukkan password baru.");
                      return;
                    }
                    const pass = editPasswordValue.trim();
                    setLecturers(prev => prev.map(u => u.id === editingUser.id ? { ...u, password: pass } : u));
                    setSuccessNotice(`Password pengguna ${editingUser.name} berhasil diperbarui.`);
                    setEditingUser(null);
                    setEditPasswordValue("");
                  }}
                  className="flex-1 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-600/25 cursor-pointer"
                >
                  Simpan Password
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Tambah Custom Dosen Pengembang RPS */}
      <AnimatePresence>
        {showCustomDosenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm no-print">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 text-slate-800 relative z-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Tambah Dosen Pengembang Baru</h3>
                    <p className="text-xs text-slate-500 font-medium">Tambahkan nama dosen pengembang ke daftar pilihan sistem.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomDosenModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nama Dosen & Gelar</label>
                  <input
                    type="text"
                    value={customDosenName}
                    onChange={(e) => setCustomDosenName(e.target.value)}
                    placeholder="Contoh: Dr. Budi Santoso, S.Kom., M.Kom."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">NIDN / NUPTK (Opsional)</label>
                  <input
                    type="text"
                    value={customDosenNidn}
                    onChange={(e) => setCustomDosenNidn(e.target.value)}
                    placeholder="Contoh: 0612048501"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomDosenModal(false)}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!customDosenName.trim()) {
                      alert("Masukkan nama dosen terlebih dahulu.");
                      return;
                    }
                    const nameTrimmed = customDosenName.trim();
                    const nidnTrimmed = customDosenNidn.trim();

                    const exists = lecturers.find(l => l.name.toLowerCase() === nameTrimmed.toLowerCase());
                    if (!exists) {
                      const newDosen: Lecturer = {
                        id: Date.now().toString(),
                        name: nameTrimmed,
                        nidn: nidnTrimmed || '-',
                        email: `${nameTrimmed.toLowerCase().replace(/[^a-z]/g, '')}@polsa.ac.id`,
                        password: 'dosen123',
                        role: 'dosen'
                      };
                      setLecturers(prev => [...prev, newDosen]);
                    }

                    updateCourseInfo({
                      pengembangRPS: nameTrimmed,
                      ...(nidnTrimmed ? { lecturerNidn: nidnTrimmed } : {})
                    });

                    setCustomDosenName("");
                    setCustomDosenNidn("");
                    setShowCustomDosenModal(false);
                  }}
                  className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
                >
                  Simpan & Pilih
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PDF Export Wizard Modal */}
      <AnimatePresence>
        {showPdfWizard && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 overflow-y-auto no-print">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if(!isSimulatingPdf) setShowPdfWizard(false); }}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-md"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 p-8 md:p-10 text-slate-800"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-block px-2.5 py-0.5 bg-gradient-to-r from-indigo-500 to-sky-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest leading-none">
                      Ekspor Vektor
                    </span>
                    <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-widest leading-none">
                      PDF Otoritatif
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2">
                    <Printer className="w-6 h-6 text-indigo-600" /> Ekspor RPS ke PDF Resmi
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Konfigurasi tata letak dan opsi pembubuhan tanda pengesahan Dokumen.</p>
                </div>
                {!isSimulatingPdf && (
                  <button 
                    onClick={() => setShowPdfWizard(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {isSimulatingPdf ? (
                /* Simulation loading progress screen */
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    {/* Ring loader */}
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
                    <Printer className="w-8 h-8 text-indigo-600 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-black text-slate-950 text-base">Sedang Memproses PDF...</h4>
                    <p className="text-xs text-indigo-600 font-black tracking-widest uppercase">{simulatedProgress}% SELESAI</p>
                    <p className="text-xs text-slate-500 font-semibold px-4 max-w-md mx-auto h-12 flex items-center justify-center transition-all">
                      {simulatedStep}
                    </p>
                  </div>
                  <div className="w-full max-w-xs h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-indigo-600 to-sky-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${simulatedProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              ) : (
                /* Wizard Configuration Page */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Struktur Tata Letak</label>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Ukuran Kertas Dokumen</label>
                          <select 
                            value={paperSize} 
                            onChange={(e) => setPaperSize(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all shadow-sm"
                          >
                            <option value="A4">A4 (Portrait, 210 x 297 mm)</option>
                            <option value="Letter">Letter / F4 (Portrait, 216 x 330 mm)</option>
                          </select>
                        </div>
                        <div className="p-3.5 bg-white rounded-xl border border-slate-200/60 shadow-sm">
                          <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Info Kop Surat</h5>
                          <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                            Secara otomatis melampirkan logo Polsa Kutoarjo beserta alamat institusi pada halaman pertama.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Legalisasi & Otorisasi</label>
                      <div className="space-y-3.5">
                        <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200/60 shadow-sm cursor-pointer hover:border-indigo-200 transition-all">
                          <input 
                            type="checkbox"
                            checked={includeSignature}
                            onChange={(e) => setIncludeSignature(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Tanda Tangan Kaprodi</span>
                            <span className="text-[10px] font-medium text-slate-400">{rps.courseInfo.koordinatorProdi || "Kaprodi"}</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200/60 shadow-sm cursor-pointer hover:border-indigo-200 transition-all">
                          <input 
                            type="checkbox"
                            checked={includeOfficialStamp}
                            onChange={(e) => setIncludeOfficialStamp(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Membubuhkan Cap Valid</span>
                            <span className="text-[10px] font-medium text-slate-400">Tanda Validasi Merah Resmi UPM</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Method 1: System Print */}
                    <button
                      onClick={() => {
                        setShowPdfWizard(false);
                        setTimeout(() => {
                          window.print();
                        }, 400);
                      }}
                      className="p-5 bg-slate-900 text-white rounded-3xl hover:bg-slate-850 border border-slate-850 text-left transition-all hover:-translate-y-1 group relative overflow-hidden flex flex-col justify-between h-40"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-xl rounded-full" />
                      <div className="flex justify-between items-center relative z-10 w-full">
                        <div className="p-2 bg-slate-800 rounded-xl text-indigo-400">
                          <Printer className="w-5 h-5" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div className="relative z-10 mt-auto">
                        <span className="text-xs font-black text-white block">Metode 1: Menu Cetak Browser</span>
                        <span className="text-[10px] text-slate-300 font-medium leading-relaxed mt-1 block">
                          Gunakan jendela pencetakan resmi browser untuk menyimpan PDF dengan kualitas vektor 100%.
                        </span>
                      </div>
                    </button>

                    {/* Method 2: Live Download Simulation */}
                    <button
                      onClick={runPdfSimulation}
                      className="p-5 bg-gradient-to-br from-indigo-700 to-indigo-900 text-white rounded-3xl hover:from-indigo-600 hover:to-indigo-800 text-left transition-all hover:-translate-y-1 group relative overflow-hidden flex flex-col justify-between h-40 shadow-xl shadow-indigo-100"
                    >
                      <div className="absolute bottom-0 right-0 w-24 h-24 bg-sky-400/20 blur-xl rounded-full" />
                      <div className="flex justify-between items-center relative z-10 w-full">
                        <div className="p-2 bg-indigo-800/80 rounded-xl text-sky-300">
                          <Download className="w-5 h-5" />
                        </div>
                        <Sparkles className="w-4 h-4 text-sky-300 animate-pulse" />
                      </div>
                      <div className="relative z-10 mt-auto">
                        <span className="text-xs font-black text-white block">Metode 2: Unduh PDF Instan (Demo)</span>
                        <span className="text-[10px] text-indigo-200 font-medium leading-relaxed mt-1 block">
                          Hasil instan! Proses konversi cepat langsung di peramban, siap diunduh dan dipresentasikan.
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Google Apps Script Modal */}
        {showGasModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden my-8"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-8 relative overflow-hidden flex items-start justify-between">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full" />
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest">
                    <Code2 className="w-3.5 h-3.5" /> Panduan & Integrasi Webhook
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-white">Menghubungkan Ke Google Apps Script</h3>
                  <p className="text-xs text-slate-300 max-w-xl font-medium leading-relaxed">
                    Kirim dan simpan otomatis data Dokumen RPS, Mata Kuliah, dan Hasil Validasi ke Google Sheets secara realtime.
                  </p>
                </div>
                <button
                  onClick={() => setShowGasModal(false)}
                  className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-colors cursor-pointer relative z-10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {/* Step-by-Step Instructions */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Langkah-Langkah Hubungkan Google Sheets
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-700">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3 items-start">
                      <span className="w-6 h-6 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">1</span>
                      <div>
                        <p className="font-bold text-slate-800">Buat Spreadsheet Baru</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Buka Google Sheets, buat lembar kerja baru (misal: "Database RPS POLSA").</p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3 items-start">
                      <span className="w-6 h-6 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">2</span>
                      <div>
                        <p className="font-bold text-slate-800">Buka Apps Script</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Di toolbar atas Google Sheets, klik menu <span className="font-bold text-slate-700">Ekstensi</span> &gt; <span className="font-bold text-slate-700">Apps Script</span>.</p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3 items-start">
                      <span className="w-6 h-6 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">3</span>
                      <div>
                        <p className="font-bold text-slate-800">Tempel Kode & Simpan</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Hapus isi file <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">Code.gs</code>, lalu salin kode di bawah dan simpan (<kbd className="bg-slate-200 px-1 rounded">Ctrl+S</kbd>).</p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3 items-start">
                      <span className="w-6 h-6 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">4</span>
                      <div>
                        <p className="font-bold text-slate-800">Deploy Sebagai Web App</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Klik <span className="font-bold text-slate-700">Terapkan (Deploy)</span> &gt; <span className="font-bold text-slate-700">Deployment Baru</span>. Setel akses ke <span className="font-bold text-emerald-600">Siapa saja (Anyone)</span>.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Script Code Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-indigo-500" /> Kode Google Apps Script (Code.gs)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const scriptText = `// KODE GOOGLE APPS SCRIPT (Code.gs) - DATABASE RPS POLSA
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Jika sheet masih kosong, buatkan header otomatis
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Waktu Kirim", 
        "Kode MK", 
        "Nama Mata Kuliah", 
        "SKS Teori", 
        "SKS Praktik", 
        "Semester", 
        "Dosen Pengampu", 
        "Jumlah CPMK", 
        "Jumlah Rencana Mingguan",
        "Status Dokumen"
      ]);
      sheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#dcfce7");
    }
    
    var course = data.courseInfo || {};
    var timestamp = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
    
    sheet.appendRow([
      timestamp,
      course.code || "-",
      course.name || "Mata Kuliah Baru",
      course.sksTeori || 0,
      course.sksPraktek || 0,
      course.semester || 1,
      course.lecturer || "-",
      (data.cpmks || []).length,
      (data.weeklyPlans || []).length,
      data.status || "Draft"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data RPS " + (course.name || "") + " berhasil masuk ke Google Sheets!",
      timestamp: timestamp
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Webhook Google Apps Script RPS POLSA Aktif!");
}`;
                        navigator.clipboard.writeText(scriptText);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2500);
                      }}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      {copiedCode ? "Tersalin Ke Clipboard!" : "Salin Kode Script"}
                    </button>
                  </div>

                  <div className="bg-slate-900 text-emerald-400 p-5 rounded-2xl font-mono text-xs overflow-x-auto max-h-56 leading-relaxed border border-slate-800 custom-scrollbar relative group">
                    <pre>{`// KODE GOOGLE APPS SCRIPT (Code.gs) - DATABASE RPS POLSA
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Waktu Kirim", "Kode MK", "Nama Mata Kuliah", "SKS Teori", 
        "SKS Praktik", "Semester", "Dosen Pengampu", "Jumlah CPMK", 
        "Jumlah Rencana Mingguan", "Status Dokumen"
      ]);
      sheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#dcfce7");
    }
    
    var course = data.courseInfo || {};
    var timestamp = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
    
    sheet.appendRow([
      timestamp, course.code || "-", course.name || "Mata Kuliah Baru",
      course.sksTeori || 0, course.sksPraktek || 0, course.semester || 1,
      course.lecturer || "-", (data.cpmks || []).length,
      (data.weeklyPlans || []).length, data.status || "Draft"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data RPS " + (course.name || "") + " berhasil disimpan ke Google Sheets!",
      timestamp: timestamp
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error", message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Webhook Google Apps Script RPS POLSA Aktif!");
}`}</pre>
                  </div>
                </div>

                {/* Webhook URL Input & Tester */}
                <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 space-y-4">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-emerald-800 block">
                    Tempelkan Web App Webhook URL Anda
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="url"
                      value={systemConfig.gasWebhookUrl || ''}
                      onChange={(e) => setSystemConfig({ ...systemConfig, gasWebhookUrl: e.target.value })}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="w-full bg-white text-xs font-mono text-slate-800 px-4 py-3 rounded-2xl border border-emerald-200 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!systemConfig.gasWebhookUrl || !systemConfig.gasWebhookUrl.startsWith("http")) {
                          setGasTestStatus({ type: 'error', message: "Masukkan Web App URL yang valid terlebih dahulu (diawali https://script.google.com/...)." });
                          return;
                        }
                        setGasTestStatus({ type: 'loading', message: "Mengirimkan data sampel RPS ke Google Sheets..." });
                        try {
                          await fetch(systemConfig.gasWebhookUrl, {
                            method: "POST",
                            mode: "no-cors",
                            headers: { "Content-Type": "text/plain;charset=utf-8" },
                            body: JSON.stringify({
                              courseInfo: rps.courseInfo,
                              cpmks: rps.cpmks,
                              weeklyPlans: rps.weeklyPlans,
                              status: rps.status || "Sampel Teruji",
                              timestamp: new Date().toISOString()
                            }),
                          });
                          setGasTestStatus({
                            type: 'success',
                            message: "Sinyal Webhook berhasil dikirim ke Google Apps Script! Periksa baris baru pada Google Sheets Anda."
                          });
                        } catch (err: any) {
                          setGasTestStatus({
                            type: 'error',
                            message: "Gagal terhubung ke Webhook: " + (err.message || "Periksa kembali URL dan hak akses Deployment.")
                          });
                        }
                      }}
                      className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl transition-all font-black text-xs uppercase tracking-wider shrink-0 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
                    >
                      <Send className="w-4 h-4" /> Uji Kirim Ke Sheets
                    </button>
                  </div>

                  {/* Feedback Banner */}
                  {gasTestStatus && (
                    <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border ${
                      gasTestStatus.type === 'loading'
                        ? 'bg-sky-50 text-sky-700 border-sky-200 animate-pulse'
                        : gasTestStatus.type === 'success'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {gasTestStatus.type === 'loading' && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                      {gasTestStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      {gasTestStatus.type === 'error' && <X className="w-4 h-4 text-rose-600 shrink-0" />}
                      <span>{gasTestStatus.message}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowGasModal(false)}
                  className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
                >
                  Tutup Panduan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

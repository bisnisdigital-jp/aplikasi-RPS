import { useState, FormEvent, MouseEvent } from "react";
import { 
  Shield, 
  User, 
  Sparkles, 
  Layers, 
  Calendar, 
  Printer, 
  ArrowRight,
  BookOpen, 
  CheckCircle2, 
  Building2, 
  Cpu, 
  Target,
  FileText,
  Lock,
  Mail,
  Zap,
  Check,
  Award,
  Users,
  Eye,
  EyeOff,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Lecturer } from "../types";

interface LandingPageProps {
  lecturers: Lecturer[];
  handleLogin: (e: FormEvent) => void;
  username: string;
  setUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  onQuickLogin: (nidn: string, pass: string) => void;
  loginError: string | null;
  setLoginError: (val: string | null) => void;
}

export default function LandingPage({
  lecturers,
  handleLogin,
  username,
  setUsername,
  password,
  setPassword,
  onQuickLogin,
  loginError,
  setLoginError
}: LandingPageProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"features" | "obe" | "matrix">("features");
  
  // Interactive Matrix demo states
  const [selectedCPL, setSelectedCPL] = useState<string>("CPL1");

  const toggleModal = () => {
    setLoginError(null);
    setShowLoginModal(!showLoginModal);
  };

  const matrixData = {
    CPL1: {
      title: "CPL-1 (Sikap & Etika)",
      desc: "Mampu menunjukkan sikap bertakwa kepada Tuhan Yang Maha Esa dan menjunjung tinggi nilai kemanusiaan, etika akademis, serta berintegritas tinggi.",
      cpmks: ["CPMK-1: Etika Bisnis Digital", "CPMK-4: Tanggung Jawab Sosial Korporat"]
    },
    CPL2: {
      title: "CPL-2 (Pengetahuan Umum)",
      desc: "Menguasai konsep teoritis bidang pengetahuan bisnis umum, dasar manajemen, ekonomi, pemasaran, serta teknologi informasi terkini.",
      cpmks: ["CPMK-1: Etika Bisnis Digital", "CPMK-2: Dasar Pemasaran Digital", "CPMK-3: Manajemen Operasional Retail"]
    },
    CPL3: {
      title: "CPL-3 (Keterampilan Khusus)",
      desc: "Mampu merancang rencana pemasaran digital, mengelola e-commerce, menganalisis data metrik bisnis, serta mengeksekusi kampanye pemasaran digital terpadu.",
      cpmks: ["CPMK-2: Dasar Pemasaran Digital", "CPMK-5: Analitik Web & SEO", "CPMK-6: Strategi Kewirausahaan Digital"]
    },
    CPL4: {
      title: "CPL-4 (Keterampilan Umum)",
      desc: "Mampu mengambil keputusan yang tepat berdasarkan analisis informasi/data, memimpin tim lintas fungsional, dan berkomunikasi secara efektif secara lisan/tertulis.",
      cpmks: ["CPMK-3: Manajemen Operasional Retail", "CPMK-4: Tanggung Jawab Sosial Korporat", "CPMK-6: Strategi Kewirausahaan Digital"]
    }
  };

  const features = [
    {
      icon: Sparkles,
      color: "bg-indigo-100 text-indigo-600",
      title: "AI-Assisted OBE Generator",
      desc: "Manfaatkan model kecerdasan buatan Gemini untuk menyusun deskripsi kuliah, rekomendasi CPMK, dan luaran pembelajaran secara instan berdasarkan topik utama."
    },
    {
      icon: Layers,
      color: "bg-sky-100 text-sky-600",
      title: "Penyelarasan Kompetensi (Matrix Mapping)",
      desc: "Ukur keselarasan kurikulum dengan menyambungkan CPL Program Studi ke CPMK Masif dan Sub-CPMK secara runut demi kurikulum yang komprehensif."
    },
    {
      icon: Calendar,
      color: "bg-rose-100 text-rose-600",
      title: "Rangkaian Pembelajaran Mingguan",
      desc: "Rancang silabus perkuliahan komprehensif minggu 1 hingga 16 lengkap dengan model pembelajaran, kriteria asesmen, dan rincian durasi tatap muka."
    },
    {
      icon: Shield,
      color: "bg-emerald-100 text-emerald-600",
      title: "Validasi & Otorisasi Berjenjang",
      desc: "Alur persetujuan kolaboratif. Dosen menyusun draf, Kaprodi meninjau secara mendalam, dan status dokumen berpindah otomatis saat divalidasi."
    },
    {
      icon: Printer,
      color: "bg-amber-100 text-amber-600",
      title: "Ekspor PDF Resmi & Legalitas",
      desc: "Hasilkan dokumen RPS formal yang siap cetak lengkap dengan desain kop institusi Polsa, susunan tabel SN-Dikti, cap verifikasi, dan tanda tangan digital."
    },
    {
      icon: Target,
      color: "bg-purple-100 text-purple-600",
      title: "Analisis Bobot Penilaian",
      desc: "Distribusi kumulatif dari Tugas, UTS, UAS, dan Partisipasi Kelas divalidasi hingga mencapai akumulasi 100% demi asesmen yang objektif."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased relative overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Background Ornaments */}
      <div className="absolute top-0 left-1/4 w-[40%] h-[400px] bg-gradient-to-br from-indigo-100/30 to-sky-100/30 blur-[130px] rounded-full -z-10" />
      <div className="absolute bottom-1/4 right-[5%] w-[35%] h-[500px] bg-gradient-to-br from-emerald-100/20 to-sky-100/20 blur-[120px] rounded-full -z-10" />

      {/* FLOATING HEADER NAVBAR */}
      <nav className="sticky top-4 z-40 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base text-slate-900 tracking-tight leading-none block">OBE Master <span className="text-indigo-600 font-bold text-xs uppercase bg-indigo-50 px-1.5 py-0.5 rounded ml-1">Pro</span></span>
              <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">Politeknik Sawunggalih Aji</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#fitur" className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">Fitur Unggulan</a>
            <a href="#metodologi" className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">Mengapa OBE?</a>
            <a href="#demo-matrix" className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">Simulasi Pemetaan</a>
            <a href="#institusi" className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">Institusi</a>
          </div>

          <div>
            <button 
              onClick={toggleModal}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold tracking-tight transition-all shadow-md active:scale-95 flex items-center gap-2 group cursor-pointer"
            >
              Login Sistem
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full py-1.5 px-3.5">
              <span className="animate-pulse w-2 h-2 rounded-full bg-indigo-600" />
              <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider leading-none">Aplikasi Standar Kurikulum</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.1]">
              Transformasi Kurikulum dengan{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500">
                OBE Master Pro
              </span>
            </h1>

            <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              Platform kolaboratif rancang bangun Rencana Pembelajaran Semester (RPS), penyelarasan CPL, CPMK, Sub-CPMK, hingga instrumen asesmen terpadu yang patuh SN-Dikti untuk seluruh civitas akademika Politeknik Sawunggalih Aji.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <button 
                onClick={toggleModal}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-sky-600 hover:shadow-xl hover:shadow-indigo-100 hover:-translate-y-0.5 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                <Zap className="w-4 h-4 fill-white" /> Mulai Rancang RPS
              </button>
              <a 
                href="#fitur"
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all text-center"
              >
                Pelajari Fitur
              </a>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200/60 max-w-md mx-auto lg:mx-0 text-center lg:text-left">
              <div>
                <p className="text-2xl font-black text-slate-900">100%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Metodologi OBE</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">Instan</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Ekspor Vektor PDF</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">Multiperan</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Dosen & Kaprodi</p>
              </div>
            </div>
          </div>

          {/* Interactive Visual Card Frame */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-xl">
              {/* Decorative accent frames */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-sky-500 rounded-[2.5rem] rotate-2 scale-98 opacity-5 blur-sm" />
              
              {/* Main Visual Board */}
              <div className="bg-white rounded-[2.5rem] border border-slate-200/80 shadow-2xl p-6 md:p-8 space-y-6 relative z-10">
                {/* Visual Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 flex items-center justify-center text-[8px] text-white">✓</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase">Dashboard OBE Preview</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Status: Terverifikasi Kaprodi</p>
                    </div>
                  </div>
                  <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-wider">
                    Published
                  </span>
                </div>

                {/* Simulated Program Learning Outcome Alignments */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Peta Penyelarasan Capaian Pembelajaran</span>
                  
                  <div className="space-y-2">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-extrabold text-blue-600 uppercase bg-blue-50 px-1.5 py-0.5 rounded block w-fit mb-1">CPL-03</span>
                        <p className="text-xs font-bold text-slate-800 line-clamp-1">Mampu merancang rencana pemasaran digital terpadu</p>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 bg-white border border-indigo-100 px-2 py-1 rounded-lg">95% Match</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-extrabold text-emerald-600 uppercase bg-emerald-50 px-1.5 py-0.5 rounded block w-fit mb-1">CPMK-02</span>
                        <p className="text-xs font-bold text-slate-800 line-clamp-1">Menguasai teknik analitik metrik e-commerce & SEO</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-white border border-emerald-100 px-2 py-1 rounded-lg">Aligned</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-4 opacity-75">
                      <div>
                        <span className="text-[10px] font-extrabold text-purple-600 uppercase bg-purple-50 px-1.5 py-0.5 rounded block w-fit mb-1">Sub-CPMK-04</span>
                        <p className="text-xs font-bold text-slate-800 line-clamp-1">Merancang arsitektur kampanye media sosial berkinerja tinggi</p>
                      </div>
                      <span className="text-[10px] font-bold text-purple-600 bg-white border border-purple-100 px-2 py-1 rounded-lg">10 SKS</span>
                    </div>
                  </div>
                </div>

                {/* Mini Stat row */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div className="p-3.5 bg-slate-50/50 rounded-2xl border border-slate-105">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Metode Asesmen</span>
                    <span className="text-xs font-black text-slate-800 block mt-1">Berbasis Studi Kasus</span>
                  </div>
                  <div className="p-3.5 bg-slate-50/50 rounded-2xl border border-slate-105">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Pustaka Utama</span>
                    <span className="text-xs font-black text-slate-800 block mt-1">Dave Chaffey, Kotler</span>
                  </div>
                </div>

                {/* Floating Micro Badge */}
                <div className="absolute -bottom-6 -left-6 bg-slate-900 border border-slate-850 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 max-w-xs animate-bounce" style={{ animationDuration: '4s' }}>
                  <div className="p-2 bg-indigo-600 text-white rounded-lg">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Validator Mutu</span>
                    <span className="text-xs font-bold text-white block">Sertifikat Digital Valid</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* COMPLIANCE INSTANCE STRIP */}
      <section id="institusi" className="bg-white border-y border-slate-200/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Afiliasi Institusi Utama</span>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Kepatuhan Standar Pendidikan Tinggi Polsa</h3>
              <p className="text-xs text-slate-500 font-medium">Bekerja sama dalam mengaplikasikan standar rancangan pembelajaran yang adaptif, fleksibel, & terstandar.</p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-700 block uppercase tracking-wider">Politeknik Swg</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Sawunggalih Aji</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-700 block uppercase tracking-wider">BAN-PT</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Standard Sesuai</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-700 block uppercase tracking-wider">Diktisaintek Berdampak</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Sinergi Nasional</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THREE LAYERS CORE OPTIONS (FEATURES / OBE METHODOLOGY / SIMULATION MATRIX) */}
      <section id="fitur" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 space-y-16">
        
        {/* Toggle-Tab Header */}
        <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Teknologi & Kerangka Kerja</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight leading-none">Manajemen Pembelajaran Berbasis Capaian</h2>
          <p className="text-sm text-slate-500 font-medium">Navigasikan kapabilitas, metodologi teoritis, hingga diagram interaktif dalam pemetaan terstruktur kurikulum modern.</p>
          
          <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner w-full max-w-md mt-6">
            <button 
              onClick={() => setActiveTab("features")}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'features' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Fitur Utama
            </button>
            <button 
              onClick={() => setActiveTab("obe")}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'obe' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Konsep OBE
            </button>
            <button 
              onClick={() => setActiveTab("matrix")}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'matrix' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Simulasi Peta
            </button>
          </div>
        </div>

        {/* Tab 1: Features Grid */}
        <AnimatePresence mode="wait">
          {activeTab === "features" && (
            <motion.div 
              key="tab-features"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {features.map((item, idx) => (
                <div 
                  key={idx} 
                  className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-[0_5px_15px_rgba(0,0,0,0.01)] hover:shadow-2xl hover:shadow-slate-100 hover:-translate-y-1 transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className={`p-4 rounded-2xl w-fit ${item.color} shadow-sm group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-black text-slate-950 tracking-tight">{item.title}</h3>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-50 mt-6 flex items-center text-xs font-bold text-indigo-600 gap-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                    Akses Fitur <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Tab 2: OBE Methodology */}
          {activeTab === "obe" && (
            <motion.div 
              key="tab-obe"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="bg-sky-950 text-white rounded-[2.5rem] border border-slate-800 p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="max-w-xl space-y-6">
                  <span className="inline-block px-3 py-1 bg-white/10 text-sky-300 rounded-full text-[9px] font-black uppercase tracking-widest">
                    Metodologi Akademik Resmi
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none">Apa itu Outcome-Based Education (OBE)?</h3>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-semibold">
                    Outcome-Based Education (OBE) adalah pendekatan pembelajaran yang berfokus pada apa yang mahasiswa dapat lakukan di akhir pengalaman kuliah mereka. Kurikulum tidak lagi hanya menguraikan daftar materi pelajaran, melainkan menitikberatkan pada perolehan luaran konkret dan kompetensi yang diakui secara global.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-sky-400 stroke-[3]" />
                        <span className="text-xs font-bold text-white">Student-Centered Learning</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Mahasiswa menjadi pusat perhatian, bimbingan, dan evaluasi proses pengajaran.</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                        <span className="text-xs font-bold text-white">Continuous Improvement</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Umpan balik penilaian asesmen CPL secara beruntun digunakan untuk penyelarasan bahan ajar.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200">
                  <span className="font-extrabold text-blue-600 block mb-2">1. Rumusan CPL</span>
                  <p className="text-xs text-slate-600 font-semibold leading-normal">Capaian Pembelajaran Lulusan yang ditargetkan oleh institusi di profil lulusan prodi.</p>
                </div>
                <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200">
                  <span className="font-extrabold text-emerald-600 block mb-2">2. CPMK Lurus</span>
                  <p className="text-xs text-slate-600 font-semibold leading-normal">Capaian Pembelajaran Mata Kuliah diturunkan beruntun dari akumulasi CPL prodi.</p>
                </div>
                <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200">
                  <span className="font-extrabold text-purple-600 block mb-2">3. Sub-CPMK Deskjektif</span>
                  <p className="text-xs text-slate-600 font-semibold leading-normal">Langkah taktis tatap muka mingguan untuk menguji komponen luaran evaluasi ril.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 3: Interactive Simulation Matrix */}
          {activeTab === "matrix" && (
            <motion.div 
              key="tab-matrix"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              id="demo-matrix"
              className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-[2.5rem] shadow-xl p-8 md:p-10 text-slate-800"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left side: interactive list of CPL */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="space-y-1 pb-4 border-b border-slate-100">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Simulator Pemetaan</span>
                    <h3 className="text-lg font-black text-slate-950">Hubungan CPL ke CPMK</h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">Klik salah satu kode CPL di bawah, peta koneksi di kanan akan menyala secara pintar sesuai relasi kurikulum.</p>
                  </div>
                  
                  <div className="space-y-2">
                    {Object.entries(matrixData).map(([id, info]) => (
                      <button
                        key={id}
                        onClick={() => setSelectedCPL(id)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-1.5 ${selectedCPL === id ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-slate-50 border-slate-150 text-slate-700 hover:bg-slate-100'}`}
                      >
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md w-fit leading-none ${selectedCPL === id ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700'}`}>
                          {id}
                        </span>
                        <span className="text-xs font-bold leading-tight">{info.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right side: Connection details & resulting alignment */}
                <div className="lg:col-span-7 bg-slate-50 rounded-[2rem] border border-slate-150 p-6 md:p-8 space-y-6">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">CPL yang Dipilih</span>
                    <h4 className="text-base font-black text-slate-900 mt-0.5">{matrixData[selectedCPL as keyof typeof matrixData].title}</h4>
                    <p className="text-xs text-slate-600 font-semibold mt-2 leading-relaxed">
                      {matrixData[selectedCPL as keyof typeof matrixData].desc}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">CPMK Terpenuhi (Terpetakan)</span>
                    
                    <div className="space-y-2">
                      {matrixData[selectedCPL as keyof typeof matrixData].cpmks.map((cpmk, i) => (
                        <div key={i} className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 leading-tight">{cpmk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <p className="text-[10.5px] text-indigo-950 font-semibold leading-relaxed">
                      <strong>Rekomendasi Mutu:</strong> Kurikulum saat ini memiliki korelasi kuat antara silabus mingguan dengan standar evaluasi capaian. Capaian kelulusan ini teruji objektif.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </section>

      {/* DETAILED STAT SECTION BAR */}
      <section className="bg-slate-900 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/40 to-slate-950/40 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
            <div className="md:col-span-1 space-y-4">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Statistik Sistem</span>
              <h3 className="text-2xl font-black text-white tracking-tight">Performa Akurasi OBE Master</h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">Platform andalan dalam penyusunan Rencana Pembelajaran berkualitas tinggi dengan pengawasan langsung.</p>
            </div>
            
            <div className="p-6 bg-slate-850 rounded-[2rem] border border-slate-800 flex flex-col justify-between">
              <span className="text-4xl font-extrabold text-indigo-400">100%</span>
              <div className="mt-4">
                <span className="text-xs font-bold text-white block">Standardisasi SN-Dikti</span>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1">Mengadopsi seluruh klausul penyusunan instrumen akademis terkini secara penuh.</p>
              </div>
            </div>

            <div className="p-6 bg-slate-850 rounded-[2rem] border border-slate-800 flex flex-col justify-between">
              <span className="text-4xl font-extrabold text-sky-400">&lt; 3 Detik</span>
              <div className="mt-4">
                <span className="text-xs font-bold text-white block">Waktu Cetak Berkas</span>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1">Hasilkan dokumen hasil format RPS lengkap seketika tanpa nunggu lama.</p>
              </div>
            </div>

            <div className="p-6 bg-slate-850 rounded-[2rem] border border-slate-800 flex flex-col justify-between">
              <span className="text-4xl font-extrabold text-emerald-400">Interaktif</span>
              <div className="mt-4">
                <span className="text-xs font-bold text-white block">Multi-Role Kolaboratif</span>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1">Akses eksklusif berlisensi untuk Admin Jurusan, Kepala Prodi, & Dosen Tetap.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL Call-To-Action (CTA) AND FOOTER */}
      <section className="bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center space-y-8">
          <div className="bg-indigo-50 border border-indigo-100 rounded-[3rem] p-8 md:p-16 max-w-4xl mx-auto space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 blur-xl rounded-full" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-sky-500/10 blur-xl rounded-full" />
            
            <div className="max-w-xl mx-auto space-y-4 relative z-10">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">Optimalkan Kinerja Akademik Anda</span>
              <h2 className="text-2xl md:text-3.5xl font-extrabold text-slate-950 tracking-tight leading-none">Siap Merancang Rencana Belajar Semester Terbaik?</h2>
              <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                Segera bergabung dan gunakan portal OBE Master Pro Politeknik Sawunggalih Aji untuk menghasilkan RPS bermutu tinggi berbasis data kompetensi unggulan.
              </p>
              <button 
                onClick={toggleModal}
                className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all mt-4 cursor-pointer shadow-lg hover:-translate-y-0.5"
              >
                Login Sistem
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Footer content */}
          <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400 font-semibold text-xs">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <span className="font-extrabold text-slate-800">OBE Master Pro Polsa</span>
            </div>
            <div>
              <p className="text-[11px]">&copy; {new Date().getFullYear()} Politeknik Sawunggalih Aji. All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </section>

      {/* LOGIN MODAL OVERLAY */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleModal}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-md"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden relative z-10"
            >
              <div className="p-8 md:p-10 space-y-6">
                
                {/* Modal Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl text-indigo-600">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 leading-none">Masuk ke Portal</h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">OBE Master Pro</span>
                    </div>
                  </div>
                  <button 
                    onClick={toggleModal}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <XButton />
                  </button>
                </div>

                {/* Login Form */}
                <form 
                  onSubmit={(e) => {
                    handleLogin(e);
                  }} 
                  className="space-y-4"
                >
                  {loginError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-700 leading-relaxed text-left"
                    >
                      {loginError}
                    </motion.div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Username / NIDN</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold text-xs"
                        placeholder="NIDN atau Username"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:bg-white outline-none transition-all font-semibold text-xs"
                        placeholder="Sandi Rahasia"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-sky-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-98 cursor-pointer mt-2"
                  >
                    Buka Dashboard
                  </button>
                </form>

                {/* Quick Demo Login Fillers */}
                <div className="bg-slate-50 p-4 border border-slate-200/60 rounded-2xl text-xs space-y-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Pengisian Akun Uji Coba:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    
                    <button
                      type="button"
                      onClick={() => onQuickLogin("admin", "admin123")}
                      className="p-2.5 bg-white border border-slate-200 hover:border-indigo-500 rounded-xl text-left transition-all hover:shadow-sm"
                    >
                      <span className="font-extrabold text-slate-800 block text-[11px]">Administrator</span>
                      <span className="text-[9px] text-slate-400 font-bold block mt-0.5">NIDN: admin</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onQuickLogin("bisnisdigital", "dosen123")}
                      className="p-2.5 bg-white border border-slate-200 hover:border-indigo-500 rounded-xl text-left transition-all hover:shadow-sm"
                    >
                      <span className="font-extrabold text-slate-800 block text-[11px]">Dosen Pengampu</span>
                      <span className="text-[9px] text-slate-400 font-bold block mt-0.5">NIDN: bisnisdigital</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onQuickLogin("kaprodi", "kaprodi123")}
                      className="p-2.5 bg-white border border-slate-200 hover:border-indigo-500 rounded-xl text-left transition-all hover:shadow-sm"
                    >
                      <span className="font-extrabold text-slate-800 block text-[11px]">Kepala Program Studi</span>
                      <span className="text-[9px] text-slate-400 font-bold block mt-0.5">NIDN: kaprodi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onQuickLogin("spmi", "spmi123")}
                      className="p-2.5 bg-white border border-slate-200 hover:border-emerald-500 rounded-xl text-left transition-all hover:shadow-sm"
                    >
                      <span className="font-extrabold text-emerald-800 block text-[11px]">Ketua SPMI</span>
                      <span className="text-[9px] text-slate-400 font-bold block mt-0.5">User: spmi / spmi123</span>
                    </button>

                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Micro close icon component
function XButton() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
  );
}

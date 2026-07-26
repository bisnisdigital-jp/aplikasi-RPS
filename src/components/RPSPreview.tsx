import { RPSData } from "../types";
import { Check, CircleCheck } from "lucide-react";

interface Props {
  data: RPSData;
  institutionLogo?: string;
  universityName?: string;
  universityAlias?: string;
}

export default function RPSPreview({ data, institutionLogo, universityName }: Props) {
  const { courseInfo, cpls, cpmks, subCpmks, weeklyPlans } = data;
  const logoSrc = institutionLogo || "input_file_0.png";
  const displayUniName = courseInfo.university || universityName || "POLITEKNIK SAWUNGGALIH AJI";

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Validation stage checkmark flags
  const isDosenValidated = !!data.status && data.status !== 'Draft';
  const isKaprodiValidated = data.status === 'Validasi Kaprodi (Menunggu SPMI)' || data.status === 'Disetujui SPMI (Final)' || data.status === 'Disetujui' || data.status === 'Revisi SPMI';
  const isSpmiValidated = data.status === 'Disetujui SPMI (Final)' || data.status === 'Disetujui';

  return (
    <div id="rps-print-template" className="bg-white p-0 md:p-8 text-black font-calibri text-[11pt] leading-tight max-w-[210mm] mx-auto print:m-0 print:p-0 print:shadow-none shadow-xl border border-gray-100">
      {/* Header Table */}
      <table className="w-full border-collapse border-2 border-black mb-0 table-fixed">
        <tbody>
          <tr>
            <td className="border-2 border-black p-2 w-1/5 text-center">
              <img src={logoSrc} alt="Logo Perguruan Tinggi" className="w-16 h-16 mx-auto object-contain max-h-16" referrerPolicy="no-referrer" />
            </td>
            <td className="border-2 border-black p-4 text-center w-3/5">
              <h1 className="text-lg font-bold uppercase">{displayUniName}</h1>
              <h3 className="text-lg font-bold uppercase">Program Studi {courseInfo.program}</h3>
            </td>
            <td className="border-2 border-black p-2 w-1/5 align-top text-[8pt]">
              <p className="font-bold">Kode Dokumen</p>
              <p className="mt-1 font-mono">{courseInfo.code}/RPS/{new Date().getFullYear()}</p>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Title Section */}
      <div className="bg-gray-100 border-x-2 border-b-2 border-black p-2 text-center">
        <h2 className="text-xl font-bold uppercase">RENCANA PEMBELAJARAN SEMESTER</h2>
      </div>

      {/* Metadata Table */}
      <table className="w-full border-collapse border-x-2 border-b-2 border-black text-[9pt] table-fixed">
        <tbody>
          <tr className="bg-gray-50 font-bold uppercase border-b border-black text-center align-middle h-8">
            <td className="border-r border-black p-1 w-1/4">MATA KULIAH (MK)</td>
            <td className="border-r border-black p-1 w-1/6">KODE</td>
            <td className="border-r border-black p-1 w-1/5">Rumpun MK</td>
            <td className="border-r border-black p-1 w-1/6 text-center">BOBOT (sks)</td>
            <td className="border-r border-black p-1 w-1/10 text-center">SEM</td>
            <td className="p-1 w-1/6">Tgl Penyusunan</td>
          </tr>
          <tr className="border-b-2 border-black h-12">
            <td className="border-r border-black p-2 font-bold text-center leading-tight">{courseInfo.name}</td>
            <td className="border-r border-black p-2 text-center">{courseInfo.code}</td>
            <td className="border-r border-black p-2 text-[8pt] text-center">{courseInfo.rumpunMK}</td>
            <td className="border-r border-black p-0">
              <div className="grid grid-cols-2 text-[7pt] h-full text-center divide-x divide-black">
                <div className="flex flex-col items-center justify-center p-1">
                  <span>T:{courseInfo.sksTeori}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-1">
                  <span>P:{courseInfo.sksPraktek}</span>
                </div>
              </div>
            </td>
            <td className="border-r border-black p-2 text-center">{courseInfo.semester}</td>
            <td className="p-2 text-center">{new Date(courseInfo.datePrepared).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
          </tr>
        </tbody>
      </table>

      {/* Auth Section */}
      <table className="w-full border-collapse border-x-2 border-b-2 border-black text-[9pt]">
        <tbody>
          <tr className="bg-white">
            <td className="border-r border-black p-1 font-bold w-1/4 align-top">OTORISASI</td>
            <td className="border-r border-black p-1 w-1/4 align-top">
              <p className="font-bold border-b border-black mb-8">Pengembang RPS</p>
              <div className="mt-auto pt-4 italic">
                <p className="font-bold uppercase underline">{courseInfo.pengembangRPS || courseInfo.lecturer}</p>
                <p className="text-[8pt] text-gray-600">NIDN/NUPTK: {courseInfo.pengembangNidn || courseInfo.lecturerNidn || '-'}</p>
              </div>
            </td>
            <td className="border-r border-black p-1 w-1/4 align-top">
              <p className="font-bold border-b border-black mb-8">Koordinator MK</p>
              <div className="mt-auto pt-4 italic">
                <p className="font-bold uppercase underline">{courseInfo.koordinatorRMK || courseInfo.lecturer}</p>
                <p className="text-[8pt] text-gray-600">NIDN/NUPTK: {courseInfo.lecturerNidn || '-'}</p>
              </div>
            </td>
            <td className="p-1 w-1/4 align-top">
                <p className="font-bold border-b border-black mb-8">Koordinator Program Studi</p>
                <div className="mt-auto pt-4 italic">
                  <p className="font-bold uppercase underline">{courseInfo.koordinatorProdi}</p>
                  <p className="text-[8pt] text-gray-600">NIDN/NUPTK: {courseInfo.koordinatorProdiNidn || '-'}</p>
                </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Model Section */}
      <table className="w-full border-collapse border-x-2 border-b-2 border-black text-[9pt]">
        <tbody>
          <tr>
            <td className="border-r border-black p-1 font-bold w-1/4">Model Pembelajaran</td>
            <td className="p-1">{courseInfo.modelPembelajaran}</td>
          </tr>
        </tbody>
      </table>

      {/* CPL & CPMK Section */}
      <div className="border-x-2 border-b-2 border-black text-[9pt]">
        <div className="bg-gray-50 border-b border-black p-1 font-bold">Capaian Pembelajaran (CP)</div>
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="p-1 font-bold align-top w-1/4">CPL-PRODI yang dibebankan pada MK</td>
              <td className="p-1">
                <ul className="list-none space-y-1">
                  {cpls.map(cpl => (
                    <li key={cpl.id} className="flex gap-2">
                       <span className="font-bold w-12 shrink-0">{cpl.code}</span>
                       <span>{cpl.description}</span>
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
            <tr className="border-t border-black">
              <td className="p-1 font-bold align-top w-1/4">Capaian Pembelajaran Mata Kuliah (CPMK)</td>
              <td className="p-1">
                <ul className="list-none space-y-1">
                  {cpmks.map(cpmk => (
                    <li key={cpmk.id} className="flex gap-2">
                       <span className="font-bold w-14 shrink-0">{cpmk.code}</span>
                       <span>{cpmk.description}</span>
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Matrix CPL-CPMK */}
      <div className="border-x-2 border-b-2 border-black p-4">
        <p className="font-bold text-[9pt] mb-2 underline">Matrik CPL - CPMK</p>
        <div className="flex justify-center">
            <table className="border-collapse border border-black text-[8pt]">
                <thead>
                    <tr>
                        <th className="border border-black p-1 bg-gray-50">CPMK</th>
                        {cpls.map(cpl => (
                            <th key={cpl.id} className="border border-black p-1 bg-gray-50 w-10">{cpl.code}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {cpmks.map(cpmk => (
                        <tr key={cpmk.id}>
                            <td className="border border-black p-1 font-bold bg-gray-50">{cpmk.code}</td>
                            {cpls.map(cpl => (
                                <td key={cpl.id} className="border border-black p-1 text-center">
                                    {cpmk.mappedCPLIds.includes(cpl.id) ? "✓" : ""}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Week Matrix */}
      <div className="border-x-2 border-b-2 border-black p-4">
         <p className="font-bold text-[9pt] mb-2 underline">Matrik CPMK pada Kemampuan akhir tiap tahapan belajar (Sub-CPMK)</p>
         <div className="flex justify-center overflow-x-auto">
            <table className="border-collapse border border-black text-[7pt]">
                <thead>
                    <tr>
                        <th rowSpan={2} className="border border-black p-1 bg-gray-50">CPMK</th>
                        <th colSpan={16} className="border border-black p-1 bg-gray-50">Minggu Ke</th>
                    </tr>
                    <tr>
                        {Array.from({ length: 16 }).map((_, i) => (
                            <th key={i} className="border border-black p-0.5 w-5 bg-gray-50">{i + 1}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {cpmks.map(cpmk => (
                        <tr key={cpmk.id}>
                            <td className="border border-black p-1 font-bold bg-gray-50">{cpmk.code}</td>
                            {weeklyPlans.map(plan => {
                                // Find if any sub-cpmk of this week is mapped to this cpmk
                                const isMapped = plan.subCPMKIds.some(subId => {
                                   const sub = subCpmks.find(s => s.id === subId);
                                   return sub?.mappedCPMKIds.includes(cpmk.id);
                                });
                                return (
                                    <td key={plan.week} className="border border-black p-0 text-center items-center justify-center">
                                        {isMapped ? "✓" : ""}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
      </div>

      <div className="page-break" />

      {/* Description Section */}
      <table className="w-full border-collapse border-x-2 border-black text-[9pt]">
        <tbody>
          <tr className="border-b border-black">
            <td className="border-r border-black p-1 font-bold w-1/4 align-top bg-gray-50">Deskripsi Singkat MK</td>
            <td className="p-2 text-justify italic">{courseInfo.description}</td>
          </tr>
          <tr className="border-b border-black">
            <td rowSpan={2} className="border-r border-black p-1 font-bold w-1/4 align-top bg-gray-50">Pustaka</td>
            <td className="p-1 border-b border-black">
                <p className="font-bold underline text-[8pt]">Utama :</p>
                <ol className="list-decimal list-inside space-y-0.5 mt-1 ml-2">
                    {courseInfo.pustakaUtama.map((p, i) => <li key={i}>{p}</li>)}
                </ol>
            </td>
          </tr>
          <tr className="border-b border-black">
             <td className="p-1">
                <p className="font-bold underline text-[8pt]">Pendukung :</p>
                <ol className="list-decimal list-inside space-y-0.5 mt-1 ml-2">
                    {courseInfo.pustakaPendukung.length > 0 ? courseInfo.pustakaPendukung.map((p, i) => <li key={i}>{p}</li>) : <li className="text-gray-400">-</li>}
                </ol>
             </td>
          </tr>
          <tr className="border-b border-black">
            <td className="border-r border-black p-1 font-bold w-1/4 align-top bg-gray-50">Dosen Pengampu</td>
            <td className="p-2">
                <ul className="list-none space-y-0.5">
                    {courseInfo.dosenPengampu.length > 0 ? courseInfo.dosenPengampu.map((d, i) => <li key={i}>{d}</li>) : <li>{courseInfo.lecturer}</li>}
                </ul>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="page-break" />

      {/* Main Weekly Detail Table */}
      <table className="w-full border-collapse border-2 border-black text-[7pt] mt-0">
        <thead className="bg-gray-100">
           <tr className="border-b-2 border-black">
             <th rowSpan={2} className="border-r border-black p-1 w-8">Mg Ke-</th>
             <th rowSpan={2} className="border-r border-black p-1 w-1/4">Kemampuan akhir tiap tahapan belajar (Sub-CPMK)</th>
             <th colSpan={2} className="border-r border-black p-1">Penilaian</th>
             <th colSpan={2} className="border-r border-black p-1">Bentuk Pembelajaran, Metode Pembelajaran, Penugasan Mahasiswa, [ Estimasi Waktu]</th>
             <th rowSpan={2} className="border-r border-black p-1 w-1/5">Materi Pembelajaran [ Pustaka ]</th>
             <th rowSpan={2} className="p-1 w-10">Bobot Penilaian (%)</th>
           </tr>
           <tr className="border-b-2 border-black">
             <th className="border-r border-black p-1">Indikator</th>
             <th className="border-r border-black p-1">Kriteria & Bentuk</th>
             <th className="border-r border-black p-1">Luring (offline)</th>
             <th className="border-r border-black p-1">Daring (online)</th>
           </tr>
           <tr className="border-b-2 border-black text-center font-bold">
              <td className="border-r border-black p-0.5">(1)</td>
              <td className="border-r border-black p-0.5">(2)</td>
              <td className="border-r border-black p-0.5">(3)</td>
              <td className="border-r border-black p-0.5">(4)</td>
              <td className="border-r border-black p-0.5">(5)</td>
              <td className="border-r border-black p-0.5">(6)</td>
              <td className="border-r border-black p-0.5">(7)</td>
              <td className="p-0.5">(8)</td>
           </tr>
        </thead>
        <tbody>
           {weeklyPlans.map((plan, idx) => (
             <tr key={idx} className={`border-b border-black align-top ${plan.week === 8 || plan.week === 16 ? "bg-gray-100 font-bold" : ""}`}>
                <td className="border-r border-black p-1 text-center font-bold">{plan.week}</td>
                <td className="border-r border-black p-1">
                   <ul className="list-disc list-inside space-y-1">
                        {plan.subCPMKIds.map(id => {
                            const sub = subCpmks.find(s => s.id === id);
                            return sub ? <li key={sub.id}>{sub.description}</li> : null;
                        })}
                   </ul>
                </td>
                <td className="border-r border-black p-1">{plan.assessmentIndicator}</td>
                <td className="border-r border-black p-1">{plan.assessmentCriteria}</td>
                <td className="border-r border-black p-1">
                    <p className="font-bold">{plan.method}</p>
                    <p>{plan.duration}</p>
                </td>
                <td className="border-r border-black p-1 text-center text-gray-400">-</td>
                <td className="border-r border-black p-1">
                   <p className="font-bold">Materi:</p>
                   <p>{plan.materials}</p>
                   {idx === 0 && courseInfo.pustakaUtama.length > 0 && (
                     <>
                        <p className="font-bold mt-2">Pustaka:</p>
                        <p className="italic text-[6pt]">{courseInfo.pustakaUtama[0]}</p>
                     </>
                   )}
                </td>
                <td className="p-1 text-center font-bold">{plan.weight}%</td>
             </tr>
           ))}
        </tbody>
      </table>

      {/* Assessment Section */}
      <div className="mt-5 border border-black text-[8pt] max-w-xs sm:max-w-sm">
        <div className="bg-gray-100 border-b border-black py-1 px-2 font-bold text-center uppercase tracking-wider text-[8pt]">Asesmen dan Penilaian</div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-black text-center font-bold">
              <th className="border-r border-black p-1 px-2 text-left">Komponen Penilaian</th>
              <th className="p-1 px-2 w-20 text-center">Bobot (%)</th>
            </tr>
          </thead>
          <tbody>
            {(data.assessmentComponents || []).map((comp) => (
              <tr key={comp.id} className="border-b border-black">
                <td className="border-r border-black p-1 px-2">
                  <p className="font-bold">{comp.name}</p>
                  <p className="text-[7pt] italic text-gray-600 leading-tight">{comp.description}</p>
                </td>
                <td className="p-1 px-2 text-center font-bold">{comp.totalWeight}%</td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-black">
               <td className="border-r border-black p-1 px-2 text-right uppercase tracking-wider">Total Bobot</td>
               <td className="p-1 px-2 text-center">{(data.assessmentComponents || []).reduce((sum, c) => sum + c.totalWeight, 0)}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Catatan & Verification Section */}
      <div className="mt-5 text-[8pt] space-y-1">
        <p className="font-bold">Catatan :</p>
        <ol className="list-decimal list-inside space-y-0.5 ml-1">
          {((data.catatan && data.catatan.length > 0) ? data.catatan : [
            `Metode Pembelajaran: ${courseInfo.modelPembelajaran || "Project Based Learning"}.`,
            "Materi Pembelajaran adalah rincian atau uraian dari bahan kajian yg dapat disajikan dalam bentuk beberapa pokok dan sub-pokok bahasan serta dilengkapi dengan daftar Pustaka yang didalamnya diperkaya dengan hasil penelitian/PkM dosen.",
            "Bobot penilaian adalah prosentase penilaian terhadap setiap pencapaian sub-CPMK yang besarnya proposional dengan tingkat kesulitan pencapaian sub-CPMK tersebut dan totalnya 100%.",
            "TM=Tatap Muka, PT=Penugasan terstruktur, BM=Belajar mandiri."
          ]).map((note, index) => (
            <li key={index} className="leading-tight">
              <span>{note}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Official Verification Table */}
      <table className="w-full border-2 border-black text-[8.5pt] mt-4 text-center border-collapse">
        <thead>
          <tr className="bg-[#fbbf24] font-extrabold border-b-2 border-black">
            <th className="border-r border-black p-1.5 w-1/3 text-black uppercase tracking-wider">Diverivikasi oleh</th>
            <th colSpan={2} className="p-1.5 w-2/3 text-black uppercase tracking-wider">Diperiksa Oleh</th>
          </tr>
          <tr className="border-b border-black font-bold text-[8pt] bg-gray-50">
            <td className="border-r border-black p-1.5 w-1/3">Ketua SPMI</td>
            <td className="border-r border-black p-1.5 w-1/3">Kaprodi {courseInfo.program || "Sarjana Terapan Bisnis Digital"}</td>
            <td className="p-1.5 w-1/3">Koodinator Mata Kuliah</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-r border-black p-3 align-bottom">
              <div className="flex flex-col items-center justify-center min-h-[90px]">
                {isSpmiValidated ? (
                  <svg className="w-12 h-12 text-[#22c55e] my-1" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.707 7.707a1 1 0 00-1.414-1.414L10 13.586 8.707 12.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l6-6z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="h-12 my-1" />
                )}
                <p className="font-bold text-[8.5pt] mt-1">{courseInfo.ketuaSpmi || "Ceicilia Rosma W, S.E., M.Si., Ak"}</p>
                <p className="text-[7.5pt] text-gray-700 font-medium">NIDN/NUPTK: {courseInfo.spmiNidn || '-'}</p>
              </div>
            </td>
            <td className="border-r border-black p-3 align-bottom">
              <div className="flex flex-col items-center justify-center min-h-[90px]">
                {isKaprodiValidated ? (
                  <svg className="w-12 h-12 text-[#22c55e] my-1" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.707 7.707a1 1 0 00-1.414-1.414L10 13.586 8.707 12.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l6-6z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="h-12 my-1" />
                )}
                <p className="font-bold text-[8.5pt] mt-1">{courseInfo.koordinatorProdi || "Ahmad Syarif M, S.E., M.B.A"}</p>
                <p className="text-[7.5pt] text-gray-700 font-medium">NIDN/NUPTK: {courseInfo.koordinatorProdiNidn || '-'}</p>
              </div>
            </td>
            <td className="p-3 align-bottom">
              <div className="flex flex-col items-center justify-center min-h-[90px]">
                {isDosenValidated ? (
                  <svg className="w-12 h-12 text-[#22c55e] my-1" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.707 7.707a1 1 0 00-1.414-1.414L10 13.586 8.707 12.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l6-6z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="h-12 my-1" />
                )}
                <p className="font-bold text-[8.5pt] mt-1">{courseInfo.koordinatorRMK || courseInfo.pengembangRPS || courseInfo.lecturer || "Ahmad Syarif M, S.E., M.B.A"}</p>
                <p className="text-[7.5pt] text-gray-700 font-medium">NIDN/NUPTK: {courseInfo.lecturerNidn || courseInfo.pengembangNidn || '-'}</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

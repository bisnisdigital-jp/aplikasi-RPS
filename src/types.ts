/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CourseInfo {
  name: string;
  code: string;
  sksTeori: number;
  sksPraktek: number;
  semester: number;
  description: string;
  lecturer: string;
  datePrepared: string;
  program: string;
  university: string;
  rumpunMK: string;
  pustakaUtama: string[];
  pustakaPendukung: string[];
  modelPembelajaran: string;
  dosenPengampu: string[];
  pengembangRPS: string;
  koordinatorRMK: string;
  koordinatorProdi: string;
  koordinatorProdiNidn?: string;
  lecturerNidn?: string;
  ketuaSpmi?: string;
}

export interface CPL {
  id: string;
  code: string;
  description: string;
}

export interface CPMK {
  id: string;
  code: string;
  description: string;
  mappedCPLIds: string[];
}

export interface SubCPMK {
  id: string;
  code: string;
  description: string;
  mappedCPMKIds: string[];
}

export interface WeeklyPlan {
  week: number;
  subCPMKIds: string[];
  materials: string;
  method: string;
  media: string;
  duration: string;
  experience: string;
  assessmentCriteria: string;
  assessmentIndicator: string;
  weight: number;
}

export type UserRole = 'admin' | 'dosen' | 'kaprodi' | 'spmi';

export interface Lecturer {
  id: string;
  name: string;
  nidn: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface AssessmentComponent {
  id: string;
  name: string;
  description: string;
  type: string; // e.g., 'Tugas Individu', 'UTS', 'UAS', 'Partisipasi'
  c1: number;
  c2: number;
  c3: number;
  c4: number;
  c5: number;
  totalWeight: number;
}

export interface RPSData {
  id?: string;
  courseInfo: CourseInfo;
  cpls: CPL[];
  cpmks: CPMK[];
  subCpmks: SubCPMK[];
  weeklyPlans: WeeklyPlan[];
  assessmentComponents?: AssessmentComponent[];
  catatan?: string[];
  status?: string;
  creator?: string;
  version?: number;
}

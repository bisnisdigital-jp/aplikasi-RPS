/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { RPSData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateCourseDescription(courseName: string, program: string): Promise<string> {
  const prompt = `Generate a brief, formal course description for the subject: "${courseName}" in the "${program}" program. 
  The description should be in Indonesian and summarize what students will learn. 
  Keep it around 2-3 sentences. 
  Just return the text, no extra formatting.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt
  });
  
  return response.text || "";
}

export async function suggestMapping(sourceText: string, targets: { id: string, code: string, description: string }[]): Promise<string[]> {
  const prompt = `Based on the following description, which competencies (provided as target list) are relevant?
  Description: "${sourceText}"
  Targets: ${JSON.stringify(targets)}
  
  Return ONLY a JSON array of the IDs that are most relevant. No extra text. If none are relevant, return an empty array [].`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  try {
    const text = response.text;
    return JSON.parse(text || "[]");
  } catch {
    return [];
  }
}
export async function generateRPSContent(courseName: string, courseDescription: string, oldRpsContext?: string): Promise<Partial<RPSData>> {
  const prompt = `Generate a high-quality OBE (Outcome-Based Education) Semester Learning Plan (RPS) in Indonesian for the following course:
Course Name: "${courseName}"
Description: "${courseDescription}"
${oldRpsContext ? `\nREFERENCE DATA (Prioritizes this content if valid):\n${oldRpsContext}` : ""}

STRICT REQUIREMENTS:
1. LINGUISTIC: Use formal academic Indonesian. Use Bloom's Taxonomy verbs (KKO - Kata Kerja Operasional) like "Menjelaskan", "Menganalisis", "Rancang Bangun".
2. HIERARCHY: 
   - Define CPL (Capaian Pembelajaran Lulusan).
   - Define CPMK (Capaian Pembelajaran Mata Kuliah) that map to CPLs.
   - Define Sub-CPMK (Sub-Capaian Pembelajaran Mata Kuliah) that map to CPMKs.
3. WEEKLY PLAN: 
   - 16 Weeks total.
   - Week 8: "Evaluasi UTS (Ujian Tengah Semester)".
   - Week 16: "Evaluasi UAS (Ujian Akhir Semester)".
   - Include: Materials, Methods, Media (LCD, Laptop, Apps used), Duration, Student Experience, Assessment Criteria & Indicators.
4. ASSESSMENT COMPONENTS: 
   - Generate standard components like "Tugas", "Ujian Tengah Semester", "Ujian Akhir Semester", "Partisipasi". 
   - Ensure the total weights sum to 100.
5. IDs: Use simple unique string IDs for mapping (e.g., "cpl1", "cpmk1").

Format the output as a valid JSON object matching the RPSData interface.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cpls: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                code: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["id", "code", "description"]
            }
          },
          cpmks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                code: { type: Type.STRING },
                description: { type: Type.STRING },
                mappedCPLIds: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["id", "code", "description", "mappedCPLIds"]
            }
          },
          subCpmks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                code: { type: Type.STRING },
                description: { type: Type.STRING },
                mappedCPMKIds: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["id", "code", "description", "mappedCPMKIds"]
            }
          },
          weeklyPlans: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                week: { type: Type.INTEGER },
                subCPMKIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                materials: { type: Type.STRING },
                method: { type: Type.STRING },
                media: { type: Type.STRING },
                duration: { type: Type.STRING },
                experience: { type: Type.STRING },
                assessmentCriteria: { type: Type.STRING },
                assessmentIndicator: { type: Type.STRING },
                weight: { type: Type.NUMBER }
              },
              required: ["week", "subCPMKIds", "materials", "method", "media", "duration", "experience", "assessmentCriteria", "assessmentIndicator", "weight"]
            }
          },
          assessmentComponents: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                type: { type: Type.STRING },
                totalWeight: { type: Type.NUMBER },
                c1: { type: Type.NUMBER },
                c2: { type: Type.NUMBER },
                c3: { type: Type.NUMBER },
                c4: { type: Type.NUMBER },
                c5: { type: Type.NUMBER }
              },
              required: ["id", "name", "description", "type", "totalWeight"]
            }
          }
        },
        required: ["cpls", "cpmks", "subCpmks", "weeklyPlans", "assessmentComponents"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  return JSON.parse(text);
}

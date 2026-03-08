import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { BillData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

/**
 * Cleans a string that might contain markdown JSON blocks or extra whitespace.
 */
const cleanJsonString = (str: string): string => {
  // Remove markdown code blocks if present
  let cleaned = str.replace(/```json\s?|```/g, "").trim();
  // Find the first '{' and last '}' to extract just the JSON object
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
};

export const extractBillData = async (base64Image: string, mimeType: string): Promise<BillData> => {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: base64Image.split(",")[1],
              mimeType,
            },
          },
          {
            text: `Extract data from this utility bill. 
            CRITICAL INSTRUCTIONS:
            1. Look for "Current Consumption", "Usage", or "Total Units" for the billing period.
            2. DO NOT extract "Meter Reading" (Current or Previous) as the consumption.
            3. DO NOT extract "Account Number", "Invoice Number", or "Reference Number" as consumption values.
            4. If the bill shows "kW" (Power/Demand) and "kWh" (Energy), prioritize "kWh" for electricity_kwh.
            5. Return ONLY a valid JSON object. Use null if a field is not found.
            6. SELF-CORRECTION: Before finalizing, verify that the extracted consumption is a 'period usage' and not a 'total meter reading' or 'account balance'.`,
          },
        ],
      },
    ],
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          electricity_kwh: { type: Type.NUMBER, description: "Total electricity consumption in kWh" },
          fuel_litres: { type: Type.NUMBER, description: "Total fuel consumption in litres" },
          water_m3: { type: Type.NUMBER, description: "Total water consumption in cubic meters" },
          waste_kg: { type: Type.NUMBER, description: "Total waste generated in kg" },
          recycled_pct: { type: Type.NUMBER, description: "Percentage of waste recycled" },
          num_employees: { type: Type.NUMBER, description: "Number of employees mentioned" },
          company_name: { type: Type.STRING, description: "Name of the company on the bill" },
          bill_month: { type: Type.STRING, description: "Billing month (e.g., January 2024)" },
          bill_type: { type: Type.STRING, description: "Type of bill (Electricity, Water, Fuel, etc.)" },
          amount_myr: { type: Type.NUMBER, description: "Total amount payable in MYR" },
        },
      },
    },
  });

  const rawText = response.text || "{}";
  try {
    const cleanedText = cleanJsonString(rawText);
    return JSON.parse(cleanedText);
  } catch (e) {
    console.error("Failed to parse Gemini response. Raw text length:", rawText.length);
    console.error("Raw text snippet:", rawText.substring(0, 500));
    throw new Error(`Failed to extract data from bill: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
};

export const generateESGReport = async (payload: any): Promise<string> => {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `Generate a sharp, executive-level ESG intelligence report based on this data: ${JSON.stringify(payload)}.
  Use ONLY these 5 section headers: EXECUTIVE SUMMARY, ENVIRONMENTAL ASSESSMENT, SOCIAL ASSESSMENT, GOVERNANCE ASSESSMENT, STRATEGIC OUTLOOK.
  Keep each section to 2-3 sentences maximum.
  Be highly specific with the provided numbers.
  Reference Bursa Malaysia guidelines and industry benchmarks.
  Tone: Authoritative, direct, and actionable.
  Output as plain text only.`;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
  });

  return response.text || "Report generation failed.";
};

import {
  FileData,
  GenerationConfig,
  GoogleGenerativeAI,
  SchemaType,
} from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config/env";
import { AIExpenseResponse } from "../types";
import { EXPENSE_EXTRACTION_PROMPT } from "../config/constants";
import { GoogleAIFileManager } from "@google/generative-ai/server";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

type ExtractExpensesInput =
  | {
      message: string;
      categories: string[];
      accounts: string[];
      fileData?: FileData;
    }
  | {
      fileData: FileData;
      categories: string[];
      accounts: string[];
      message?: string;
    };

export async function extractExpensesWithAI({
  message,
  categories,
  accounts,
  fileData,
}: ExtractExpensesInput): Promise<AIExpenseResponse> {
  try {
    const prompt = EXPENSE_EXTRACTION_PROMPT(categories, accounts) + message;

    const generationConfig: GenerationConfig = {
      temperature: 1,
      topP: 1,
      topK: 40,
      maxOutputTokens: 2000,
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          expenses: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                description: {
                  type: SchemaType.STRING,
                  description: "Deskripsi detail pengeluaran.",
                },
                amount: {
                  type: SchemaType.NUMBER,
                  description: "Jumlah pengeluaran dalam angka.",
                },
                date: {
                  type: SchemaType.STRING,
                  description: "Tanggal pengeluaran dalam format YYYY-MM-DD.",
                },
                subcategory: {
                  type: SchemaType.STRING,
                  description: "Subkategori pengeluaran.",
                },
                account: {
                  type: SchemaType.STRING,
                  nullable: true,
                  description: "Metode pembayaran (misalnya: Cash, GoPay).",
                },
              },
              required: ["description", "amount", "date", "subcategory"],
            },
            minItems: 0,
            description: "Array yang berisi daftar pengeluaran.",
          },
          message: {
            type: SchemaType.STRING,
            description: "Pesan dari AI terkait proses ekstraksi.",
            nullable: true,
          },
        },
        required: ["expenses"],
        description:
          "Skema untuk respons JSON yang berisi informasi pengeluaran.", // Deskripsi untuk objek root
      },
    };

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }, ...(fileData ? [{ fileData }] : [])],
        },
      ],
      generationConfig,
    });

    const textResult = result.response.text();

    try {
      const parsedResult = JSON.parse(textResult) as AIExpenseResponse;
      return parsedResult;
    } catch (error) {
      console.error("Failed to parse Gemini response as JSON", textResult);
      return { expenses: [] };
    }
  } catch (error) {
    console.error("Error extracting expense data with Gemini:", error);
    return { expenses: [] };
  }
}

export async function uploadToGemini(buffer: Buffer, mimeType: string) {
  const uploadResult = await fileManager.uploadFile(buffer, {
    mimeType,
    displayName: "User Uploaded File.jpg",
  });
  return uploadResult.file;
}

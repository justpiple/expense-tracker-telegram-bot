import {
  GenerationConfig,
  GoogleGenerativeAI,
  SchemaType,
} from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config/env";
import { ExpenseData, AIExpenseResponse } from "../types";
import { EXPENSE_EXTRACTION_PROMPT } from "../config/constants";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function extractExpensesWithAI(
  message: string,
  categories: string[],
  accounts: string[],
): Promise<ExpenseData[]> {
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
                description: { type: SchemaType.STRING },
                amount: { type: SchemaType.NUMBER },
                date: { type: SchemaType.STRING },
                subcategory: { type: SchemaType.STRING },
                account: { type: SchemaType.STRING, nullable: true },
              },
              required: ["description", "amount", "date", "subcategory"],
            },
          },
        },
        required: ["expenses"],
      },
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });

    const textResult = result.response.text();

    try {
      const parsedResult = JSON.parse(textResult) as AIExpenseResponse;
      return parsedResult.expenses || [];
    } catch (error) {
      console.error("Failed to parse Gemini response as JSON", textResult);
      return [];
    }
  } catch (error) {
    console.error("Error extracting expense data with Gemini:", error);
    return [];
  }
}

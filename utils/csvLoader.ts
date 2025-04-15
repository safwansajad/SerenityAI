import util from 'util';
import Papa from "papaparse";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import { cosineSimilarity } from "./similarity"; // You'll define this

type QA = {
  context: string;
  response: string;
};

let qaPairs: QA[] = [];

export async function loadCSV(): Promise<void> {
  const asset = Asset.fromModule(require("../assets/mental_health_qa.csv"));
  await asset.downloadAsync();
  const csvData = await FileSystem.readAsStringAsync(asset.localUri || "");

  const parsed = Papa.parse<QA>(csvData, {
    header: true,
    skipEmptyLines: true,
  });

  qaPairs = parsed.data;
}

// Fuzzy matching logic (basic cosine similarity or Fuse.js alternative)
export function getBestResponse(userInput: string): string {
  if (qaPairs.length === 0) return "I'm still learning. Please try again later.";

  let bestMatch = "";
  let bestScore = 0;

  for (const qa of qaPairs) {
    const score = cosineSimilarity(userInput, qa.context);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = qa.response;
    }
  }

  return bestScore > 0.2 ? bestMatch : "I'm sorry, I don't understand. Can you rephrase?";
}

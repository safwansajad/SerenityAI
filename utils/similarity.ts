import natural from "natural";

export function cosineSimilarity(text1: string, text2: string): number {
  const tfidf = new natural.TfIdf();
  tfidf.addDocument(text1);
  tfidf.addDocument(text2);
  return tfidf.tfidf(text1, 1);
}
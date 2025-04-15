import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';

export interface QA {
  context: string;
  response: string;
}

export async function loadCSVData(csvUri: string): Promise<QA[]> {
  try {
    const csvContent = await FileSystem.readAsStringAsync(csvUri);
    const results = Papa.parse<QA>(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    return results.data;
  } catch (error) {
    console.error('Error reading CSV:', error);
    return [];
  }
}

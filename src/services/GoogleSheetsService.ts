/**
 * Google Sheets Service
 * Handles fetching and parsing data from Google Sheets
 * 
 * Setup Instructions:
 * 1. Go to Google Cloud Console (console.cloud.google.com)
 * 2. Create a new project or select existing
 * 3. Enable Google Sheets API
 * 4. Create credentials (API Key)
 * 5. Make your sheet publicly viewable (or use OAuth for private sheets)
 * 6. Add VITE_GOOGLE_SHEETS_API_KEY and VITE_GOOGLE_SHEET_ID to your .env
 */

export interface SheetRow {
  [key: string]: string;
}

export interface SheetData {
  headers: string[];
  rows: SheetRow[];
  rawContent: string;
}

export class GoogleSheetsService {
  private apiKey: string;
  private sheetId: string;
  private range: string;
  private cache: SheetData | null = null;
  private cacheTimestamp: number = 0;
  private cacheDuration: number = 5 * 60 * 1000; // 5 minutes

  constructor(apiKey: string, sheetId: string, range: string = 'Sheet1') {
    this.apiKey = apiKey;
    this.sheetId = sheetId;
    this.range = range;
  }

  /**
   * Fetches data from Google Sheets
   * Uses caching to avoid excessive API calls
   */
  async fetchSheetData(): Promise<SheetData> {
    // Return cached data if still valid
    if (this.cache && Date.now() - this.cacheTimestamp < this.cacheDuration) {
      return this.cache;
    }

    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/${this.range}?key=${this.apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const values: string[][] = data.values || [];

      if (values.length === 0) {
        throw new Error('Sheet is empty');
      }

      // Parse the sheet data
      const headers = values[0].map(h => h.toString().trim());
      const rows: SheetRow[] = values.slice(1).map(row => {
        const rowData: SheetRow = {};
        headers.forEach((header, index) => {
          rowData[header] = row[index]?.toString().trim() || '';
        });
        return rowData;
      });

      // Create a searchable text representation
      const rawContent = this.createSearchableContent(headers, rows);

      const sheetData: SheetData = {
        headers,
        rows,
        rawContent,
      };

      // Update cache
      this.cache = sheetData;
      this.cacheTimestamp = Date.now();

      return sheetData;
    } catch (error) {
      console.error('Failed to fetch Google Sheets data:', error);
      throw error;
    }
  }

  /**
   * Creates a searchable text representation of the sheet data
   */
  private createSearchableContent(headers: string[], rows: SheetRow[]): string {
    let content = `Available information categories: ${headers.join(', ')}\n\n`;
    
    rows.forEach((row, index) => {
      content += `Entry ${index + 1}:\n`;
      headers.forEach(header => {
        if (row[header]) {
          content += `- ${header}: ${row[header]}\n`;
        }
      });
      content += '\n';
    });

    return content;
  }

  /**
   * Clears the cache (useful for forcing a refresh)
   */
  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Searches for relevant rows based on keywords
   */
  searchRows(query: string, sheetData: SheetData): SheetRow[] {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    
    return sheetData.rows.filter(row => {
      const rowText = Object.values(row).join(' ').toLowerCase();
      return searchTerms.some(term => rowText.includes(term));
    });
  }
}

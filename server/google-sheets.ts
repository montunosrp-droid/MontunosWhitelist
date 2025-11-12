import { google } from "googleapis";
import type { WhitelistEntry } from "@shared/schema";
import fs from "fs";

export class GoogleSheetsService {
  private sheets;
  private spreadsheetId: string;

 constructor() {
  // Ruta del archivo de credenciales (Render -> Secret Files)
  const keyFile =
    process.env.GOOGLE_APPLICATION_CREDENTIALS || "/etc/secrets/google-sa.json";

  console.log("GOOGLE_APPLICATION_CREDENTIALS =", process.env.GOOGLE_APPLICATION_CREDENTIALS);
  console.log("Existe el archivo de credenciales? ", fs.existsSync(keyFile));

  if (!fs.existsSync(keyFile)) {
    throw new Error(`Google Sheets credentials file not found at: ${keyFile}`);
  }

  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  this.sheets = google.sheets({ version: "v4", auth });

  // Usa tu variable real de Render
  this.spreadsheetId = process.env.SHEET_ID as string;
}


  async getWhitelistEntries(): Promise<WhitelistEntry[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: "A:Z",
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return [];
      }

      const headers = rows[0].map((h: string) => h.toLowerCase().trim());
      const dataRows = rows.slice(1);

      const discordUsernameIdx = headers.findIndex((h: string) => 
        h.includes('discord') && (h.includes('username') || h.includes('name'))
      );
      const discordIdIdx = headers.findIndex((h: string) => 
        h.includes('discord') && h.includes('id')
      );
      const emailIdx = headers.findIndex((h: string) => h.includes('email'));
      const statusIdx = headers.findIndex((h: string) => h.includes('status'));
      const timestampIdx = headers.findIndex((h: string) => 
        h.includes('timestamp') || h.includes('date') || h.includes('time')
      );

      return dataRows.map((row: string[]) => {
        const status = statusIdx >= 0 && row[statusIdx] 
          ? row[statusIdx].toLowerCase().trim() 
          : 'approved';
        
        return {
          discordUsername: discordUsernameIdx >= 0 ? row[discordUsernameIdx]?.trim() : '',
          discordId: discordIdIdx >= 0 ? row[discordIdIdx]?.trim() : undefined,
          email: emailIdx >= 0 ? row[emailIdx]?.trim() : undefined,
          status: ['approved', 'pending', 'rejected'].includes(status) 
            ? status as 'approved' | 'pending' | 'rejected'
            : 'approved',
          submittedAt: timestampIdx >= 0 ? row[timestampIdx] : undefined,
        };
      }).filter(entry => entry.discordUsername || entry.discordId || entry.email);
    } catch (error) {
      console.error("Error fetching whitelist from Google Sheets:", error);
      throw new Error("Failed to fetch whitelist data");
    }
  }

  async checkWhitelist(discordId: string, username: string, email?: string): Promise<{
    isWhitelisted: boolean;
    status?: 'approved' | 'pending' | 'rejected';
    matchedBy?: 'discordId' | 'username' | 'email';
    entry?: WhitelistEntry;
  }> {
    const entries = await this.getWhitelistEntries();

    let matchedEntry = entries.find(entry => 
      entry.discordId && entry.discordId === discordId
    );
    let matchedBy: 'discordId' | 'username' | 'email' | undefined = matchedEntry ? 'discordId' : undefined;

    if (!matchedEntry && username) {
      matchedEntry = entries.find(entry => {
        if (!entry.discordUsername) return false;
        const entryUsername = entry.discordUsername.toLowerCase().replace(/[^a-z0-9]/g, '');
        const searchUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
        return entryUsername === searchUsername;
      });
      matchedBy = matchedEntry ? 'username' : undefined;
    }

    if (!matchedEntry && email) {
      matchedEntry = entries.find(entry => 
        entry.email && entry.email.toLowerCase() === email.toLowerCase()
      );
      matchedBy = matchedEntry ? 'email' : undefined;
    }

    if (!matchedEntry) {
      return { isWhitelisted: false };
    }

    return {
      isWhitelisted: matchedEntry.status === 'approved',
      status: matchedEntry.status,
      matchedBy,
      entry: matchedEntry,
    };
  }
}

export const googleSheetsService = new GoogleSheetsService();

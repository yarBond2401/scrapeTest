import { google, sheets_v4 } from "googleapis";

export class GoogleSheetsService {
  private sheets!: sheets_v4.Sheets;
  private spreadsheetId!: string;

  constructor(spreadsheetId: string, auth: any) {
    this.spreadsheetId = spreadsheetId;
    this.sheets = google.sheets({ version: "v4", auth });
  }
}

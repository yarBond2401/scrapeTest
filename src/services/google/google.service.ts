import { google } from "googleapis";
import { GoogleAuth } from "googleapis-common";
import { GoogleSheetsService } from "./google-sheets.service";

export class GoogleService {
  private auth: GoogleAuth;

  constructor(credentials: object) {
    this.auth = new google.auth.GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      credentials,
    });
  }

  async verifyAuth(): Promise<boolean> {
    try {
      const authClient = await this.auth.getClient();
      const token = await authClient.getAccessToken();

      if (!token.token) {
        return false;
      }

      await google.oauth2("v2").tokeninfo({
        access_token: token.token,
      });

      return true;
    } catch {
      return false;
    }
  }

  createSheetsService(sheetId: string): GoogleSheetsService {
    return new GoogleSheetsService(sheetId, this.auth);
  }
}

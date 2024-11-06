import * as fs from 'fs';
import PuppeteerService, { ScraperClassOptions } from '../puppeteer.service';

interface ModuleClassOptions extends ScraperClassOptions {
  cookiesFilePath?: string;
}

export default function CookieModule<
  T extends new (...args: any[]) => PuppeteerService,
>(Base: T) {
  return class extends Base {
    protected cookiesFilePath!: string;

    constructor(...args: any[]) {
      const options = args[0] as ModuleClassOptions;
      const { cookiesFilePath = './scraper-cookies.json', ...baseOptions } =
        options || {};
      super(baseOptions);
      this.cookiesFilePath = cookiesFilePath;
    }

    async saveCookies(): Promise<void> {
      const cookies = await this.page.cookies();
      fs.writeFileSync(this.cookiesFilePath, JSON.stringify(cookies, null, 2));
    }

    async loadCookies(): Promise<void> {
      if (fs.existsSync(this.cookiesFilePath)) {
        const cookies = JSON.parse(
          fs.readFileSync(this.cookiesFilePath, 'utf-8'),
        );

        if (Array.isArray(cookies) && cookies.length > 0) {
          await this.page.setCookie(...cookies);
        } else {
          console.log(`Invalid cookie format in ${this.cookiesFilePath}`);
        }
      } else {
        console.log(`Cookies file does not exist, ${this.cookiesFilePath}`);
      }
    }
  };
}

import { Browser, Credentials, Page, Viewport } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export interface ScraperClassOptions {
  baseUrl: string;
}

interface ProxyServer {
  host: string;
  port: number | string;
}

export interface InitBrowserOptions {
  headless?: boolean;
  args?: string[];
  proxy?: ProxyServer;
}

export interface InitPageOptions {
  proxy?: Credentials;
  viewport?: Viewport;
}

export default class PuppeteerService {
  public browser!: Browser;
  public page!: Page;
  public baseUrl!: string;

  constructor(options: ScraperClassOptions) {
    const { baseUrl } = options;

    this.baseUrl = baseUrl;
  }

  async initBrowser(options: InitBrowserOptions = {}): Promise<void> {
    const { headless = false, args = [], proxy } = options;

    const launchArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      ...args,
    ];

    if (proxy) {
      launchArgs.push(`--proxy-server=${proxy.host}:${proxy.port}`);
    }

    this.browser = await puppeteer.launch({
      headless,
      executablePath: puppeteer.executablePath(),
      args: launchArgs,
    });
  }

  async initPage(options: InitPageOptions = {}): Promise<void> {
    const { proxy, viewport } = options;

    this.page = await this.browser.newPage();
    await this.page.deleteCookie(...(await this.page.cookies()));

    if (proxy) {
      this.page.authenticate(proxy);
    }

    if (viewport) {
      await this.page.setViewport(viewport);
    }
  }

  async disableVisualRequests(): Promise<void> {
    await this.page.setRequestInterception(true);

    this.page.on('request', request => {
      if (
        request.resourceType() === 'image' ||
        request.resourceType() === 'stylesheet'
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });
  }

  delay(delay: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  async close(): Promise<void> {
    await this.browser.close();
  }
}

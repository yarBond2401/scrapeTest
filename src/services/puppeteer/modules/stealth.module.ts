import { faker } from '@faker-js/faker';
import { WaitForOptions } from 'puppeteer';
import PuppeteerService, { InitPageOptions } from '../puppeteer.service';

interface RandomDelay {
  min: number;
  max: number;
}

interface StealthSettings {
  randomDelay?: RandomDelay;
}

export default function StealthModule<
  T extends new (...args: any[]) => PuppeteerService,
>(Base: T) {
  return class extends Base {
    private randomDelay: RandomDelay = { min: 100, max: 300 };

    set stealthSettings(settings: StealthSettings) {
      this.validateRandomDelay(settings.randomDelay);
    }

    private validateRandomDelay(randomDelay?: RandomDelay) {
      if (!randomDelay) return;

      const { min, max } = randomDelay;

      if (min < 0 || max < 0) {
        throw new Error('Delay values must be greater than or equal to 0');
      }
      if (min >= max) {
        throw new Error('Min delay must be less than max delay');
      }

      this.randomDelay = randomDelay;
    }

    async waitResponseWithRetry(
      waitUrl: string,
      callback?: (...args: any[]) => any,
    ) {
      while (true) {
        if (callback) {
          callback();
        }

        console.log('wait');
        const response = await this.page.waitForResponse(response => {
          return (
            (response.url() === waitUrl + '/' || response.url() === waitUrl) &&
            response.request().method() === 'GET'
          );
        });
        const status = response.status();
        console.log(status);

        if (status !== 403) break;

        await this.randomizeUserAgent();
      }
    }

    async initStealthPage(options: InitPageOptions): Promise<void> {
      await this.initPage(options);
      await this.page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        Object.defineProperty(navigator, 'plugins', {
          get: () => [{ name: 'Chrome PDF Viewer' }],
        });
      });
      // await this.randomizeUserAgent();
      await this.randomizeViewport();
    }

    async randomizeViewport(): Promise<void> {
      const width = Math.floor(Math.random() * (1920 - 1366) + 1366);
      const height = Math.floor(Math.random() * (1080 - 768) + 768);
      await this.page.setViewport({ width, height });
    }

    async randomizeUserAgent(): Promise<void> {
      const userAgent = faker.internet.userAgent();
      await this.page.setUserAgent(userAgent);
    }

    async navigateWithRandomDelays(url: string, options: WaitForOptions) {
      const { waitUntil = 'networkidle2' } = options;

      await this.page.goto(url, { waitUntil, ...options });

      await this.delay(1000, 3000);

      await this.page.evaluate(() =>
        window.scrollBy(0, window.innerHeight / 2),
      );

      await this.delay(500, 1500);
    }

    getRandomDelay(
      min: number = this.randomDelay.min,
      max: number = this.randomDelay.max,
    ): number {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    delay(
      min: number = this.randomDelay.min,
      max: number = min,
    ): Promise<void> {
      const time = Math.floor(Math.random() * (max - min + 1)) + min;
      return new Promise(resolve => setTimeout(resolve, time));
    }
  };
}

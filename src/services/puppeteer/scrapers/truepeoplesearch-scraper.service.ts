import CookieModule from '../modules/cookie.module';
import StealthModule from '../modules/stealth.module';
import PuppeteerService, { ScraperClassOptions } from '../puppeteer.service';

interface SearchByAddressFilters {
  address: string;
  city: string;
  state: string;
}

const selectors = {
  searchByAddressButton:
    '#searchTypes > #searchTypeAddress-d > .search-type-link',
  streetAddressInput: '#searchFormAddressDesktop > input[name="StreetAddress"]',
  cityStateZipInput: '#searchFormAddressDesktop > input[name="CityStateZip"]',
  submitSearchFormButton: '#searchFormAddressDesktop button[type="submit"]',
  peopleCard: '.content-container > .content-center > .card[data-detail-link]',
};

const PuppeteerServiceWithModules = StealthModule(
  CookieModule(PuppeteerService),
);

class TruePeopleSearchScraperService extends PuppeteerServiceWithModules {
  constructor(options: ScraperClassOptions) {
    super(options);
  }

  async searchByFilters({ address, city, state }: SearchByAddressFilters) {
    await this.waitResponseWithRetry(this.baseUrl, () =>
      this.page.goto(this.baseUrl),
    );
    // await this.page.goto(this.baseUrl);

    await this.page.waitForFunction(
      selector => {
        return document.querySelector(selector) !== null;
      },
      { polling: 1000 },
      selectors.searchByAddressButton,
    );
    await this.delay(1000, 2000);
    await this.page.click(selectors.searchByAddressButton);

    await this.page.waitForSelector(selectors.streetAddressInput, {
      visible: true,
    });
    await this.delay(100, 500);
    await this.page.click(selectors.streetAddressInput);
    await this.page.type(selectors.streetAddressInput, address, {
      delay: this.getRandomDelay(),
    });

    await this.delay(100, 500);
    await this.page.click(selectors.cityStateZipInput);
    await this.page.type(selectors.cityStateZipInput, `${city}, ${state}`, {
      delay: this.getRandomDelay(),
    });

    await this.delay(100, 500);
    await this.page.click(selectors.submitSearchFormButton);

    const url = await this.page.url();
    console.log(url);
    await this.waitResponseWithRetry(url, () => this.page.goto(url));
    console.log('done');

    await this.page.waitForFunction(
      selector => {
        return document.querySelector(selector) !== null;
      },

      { polling: 1000 },
      selectors.peopleCard,
    );

    const peopleCards = await this.page.$$(selectors.peopleCard);

    return Array.from(peopleCards);
  }
}

export default new TruePeopleSearchScraperService({
  baseUrl: 'https://www.truepeoplesearch.com',
  cookiesFilePath: './truepeoplesearch-cookies.json',
} as ScraperClassOptions);

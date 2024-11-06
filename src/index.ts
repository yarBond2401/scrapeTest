import dotenv from 'dotenv';
import truepeoplesearchScraperService from './services/puppeteer/scrapers/truepeoplesearch-scraper.service';

dotenv.config();

(async () => {
  await truepeoplesearchScraperService.initBrowser({
    headless: false,
    proxy: JSON.parse(String(process.env.PROXY_SERVER)),
  });

  await truepeoplesearchScraperService.initStealthPage({
    proxy: JSON.parse(String(process.env.PROXY_SERVER_CREDENTIALS)),
    viewport: { width: 1080, height: 768 },
  });

  await truepeoplesearchScraperService.disableVisualRequests();

  await truepeoplesearchScraperService.searchByFilters({
    address: 'Powell Street',
    city: 'San Francisco',
    state: 'CA',
  });
})();

import * as puppeteer from 'puppeteer';
import { Browser, Page } from 'puppeteer';
import { DEFAULT_PUPETTEER_MINIMAL_ARGS } from './model/constants';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BrowserService {
  private readonly logger = new Logger(BrowserService.name);
  public static instance: BrowserService | null = null;

  public static async getInstance(): Promise<BrowserService> {
    if (this.instance == null) {
      this.instance = new BrowserService();
      await this.instance.initialise();
    }

    return this.instance;
  }
  private browser: Browser;
  private numberPages = 0;

  /**
   * Get a browser page.
   */
  public async getPage(): Promise<Page> {
    if (this.browser == null) {
      await this.initialise();
    }
    this.numberPages++;
    return this.browser.newPage();
  }

  /**
   * Close a page.
   */
  public async closePage(page: Page): Promise<void> {
    await page.close();
    this.numberPages--;

    this.logger.debug(`Closed pages: ${this.numberPages}`);
    if (this.numberPages === 0) {
      await this.browser.close();
      this.logger.debug('Closed browser');
      BrowserService.instance = null;
    }
  }

  /**
   * Initialise the instance.
   */
  public async initialise(): Promise<void> {
    this.logger.debug('Initialising browser');
    this.browser = await puppeteer.launch({
      headless: true,
      args: DEFAULT_PUPETTEER_MINIMAL_ARGS,
    });
  }
}

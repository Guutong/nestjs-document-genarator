import { DEFAULT_PUPETTEER_MINIMAL_ARGS } from './model/constants';
import { Injectable, Logger } from '@nestjs/common';
import { Cluster } from 'puppeteer-cluster';

@Injectable()
export class BrowserClusterService {
  private readonly logger = new Logger(BrowserClusterService.name);
  public static instance: BrowserClusterService | null = null;

  public static async getInstance(): Promise<BrowserClusterService> {
    if (this.instance == null) {
      this.instance = new BrowserClusterService();
      await this.instance.initialise();
    }
    return this.instance;
  }
  private cluster: Cluster;
  /**
   * Get a browser page.
   */
  public async pdf(html): Promise<Buffer> {
    return this.cluster.execute({ html });
  }

  /**
   * Initialise the instance.
   */
  public async initialise(): Promise<void> {
    this.logger.debug('Initialising browser');
    this.cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      monitor: true,
      maxConcurrency: 2,
      puppeteerOptions: {
        headless: true,
        args: DEFAULT_PUPETTEER_MINIMAL_ARGS,
      },
    });

    await this.cluster.task(async ({ page, data }) => {
      await page.setContent(data.html);
      this.logger.debug(`Generating PDF`);
      return await page.pdf({
        format: 'A1',
        margin: {
          top: '.5cm',
          bottom: '.5cm',
          right: '1cm',
          left: '1cm',
        },
        printBackground: true,
        scale: 2,
      });
    });
  }
}

import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GeneratePdfCommand } from '../command/generate-pdf.command';
import { DEFAULT_HTML_TEMPLATE } from '../model/constants';
import { GeneratePdfCompletedEvent } from '../event/genterate-pdf-completed.event';
import { UploadS3Command } from '../command/upload-s3.command';
import { BrowserService } from '../browser.service';
import { BrowserClusterService } from '../browser-cluster.service';

@CommandHandler(GeneratePdfCommand)
export class GeneratePdfHandler implements ICommandHandler<GeneratePdfCommand> {
  private readonly logger = new Logger(GeneratePdfHandler.name);

  constructor(
    private browserService: BrowserService,
    private browserClusterService: BrowserClusterService,
    private commandBus: CommandBus,
    private eventBus: EventBus,
  ) {}

  async execute(command: GeneratePdfCommand) {
    try {
      const browser = await BrowserClusterService.getInstance();
      const pdfBuffer = await browser.pdf(
        this.getTemplate(command.html, command.style),
      );

      // const page = await browser.getPage();
      // await page.setContent(this.getTemplate(command.html, command.style));
      // const pdfBuffer: Buffer = await page.pdf({
      //   format: 'A1',
      //   margin: {
      //     top: '.5cm',
      //     bottom: '.5cm',
      //     right: '1cm',
      //     left: '1cm',
      //   },
      //   printBackground: true,
      //   scale: 2,
      // });
      // await browser.closePage(page);

      this.logger.debug(`Publishing event GeneratePdfCompletedEvent`);
      this.eventBus.publish(
        new GeneratePdfCompletedEvent(pdfBuffer, command.fileName),
      );

      if (!command.skipS3) {
        this.logger.debug(`Publishing command UploadS3Command`);
        await this.commandBus.execute(
          new UploadS3Command(pdfBuffer, command.fileName),
        );
      }
      return pdfBuffer;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private getTemplate(html: string, style: string): string {
    if (style) {
      return DEFAULT_HTML_TEMPLATE.replace('{{style}}', style).replace(
        '{{body}}',
        html,
      );
    }

    return html;
  }
}

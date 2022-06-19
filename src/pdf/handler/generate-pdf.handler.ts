import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { GeneratePdfCommand } from '../command/generate-pdf.command';
import * as puppeteer from 'puppeteer';
import {
  DEFAULT_PUPETTEER_MINIMAL_ARGS,
  DEFAULT_HTML_TEMPLATE,
} from '../model/constants';
import { GeneratePdfCompletedEvent } from '../event/genterate-pdf-completed.event';
import { UploadS3Command } from '../command/upload-s3.command';
import { Logger } from '@nestjs/common';

@CommandHandler(GeneratePdfCommand)
export class GeneratePdfHandler implements ICommandHandler<GeneratePdfCommand> {
  private readonly logger = new Logger(GeneratePdfHandler.name);

  constructor(private commandBus: CommandBus, private eventBus: EventBus) {}

  async execute(command: GeneratePdfCommand) {
    this.logger.debug(`GeneratePdfHandler execute with GeneratePdfCommand`);
    const browser = await puppeteer.launch({
      headless: true,
      args: DEFAULT_PUPETTEER_MINIMAL_ARGS,
    });

    const page = await browser.newPage();
    await page.setContent(this.getTemplate(command.html, command.style));

    const pdfBuffer: Buffer = await page.pdf({
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

    await page.close();
    await browser.close();

    this.eventBus.publish(
      new GeneratePdfCompletedEvent(pdfBuffer, command.fileName),
    );
    this.commandBus.execute(new UploadS3Command(pdfBuffer, command.fileName));
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

import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GeneratePdfCommand } from './command/generate-pdf.command';

@Injectable()
export class PdfService {
  constructor(private commandBus: CommandBus) {}
  public async generatePdf(html: string, style: string, fileName: string) {
    return this.commandBus.execute(
      new GeneratePdfCommand(html, style, fileName),
    );
  }
}

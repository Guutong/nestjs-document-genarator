import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GeneratePdfCommand } from './command/generate-pdf.command';
import { Readable } from 'stream';

@Injectable()
export class PdfService {
  constructor(private commandBus: CommandBus) {}
  public async generatePdf(
    html: string,
    style: string,
    fileName: string,
    skipS3: boolean,
  ) {
    return this.commandBus.execute(
      new GeneratePdfCommand(html, style, fileName, skipS3),
    );
  }

  getReadableStream(buffer: Buffer): Readable {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }
}

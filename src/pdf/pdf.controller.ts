import { Controller, Post, Body, Res } from '@nestjs/common';
import { PdfRequest } from './model/pdf.models';
import { PdfService } from './pdf.service';
import { Response } from 'express';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('/')
  async generatePdfAndUpload(
    @Body() request: PdfRequest,
    @Res() response: Response,
  ): Promise<void> {
    const { html, style, fileName, skipS3, skipResponse } = request;
    const buffer = await this.pdfService.generatePdf(
      html,
      style,
      fileName,
      skipS3,
    );

    if (!skipResponse) {
      const stream = this.pdfService.getReadableStream(buffer);
      response.set({
        'Content-Type': 'application/pdf',
        'Content-Length': buffer.length,
      });
      stream.pipe(response);
    }
    return;
  }
}

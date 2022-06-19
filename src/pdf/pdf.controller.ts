import { Controller, Post, Body } from '@nestjs/common';
import { PdfRequest } from './model/pdf.models';
import { PdfService } from './pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('/')
  async generatePdfAndUpload(@Body() request: PdfRequest) {
    const { html, style, fileName } = request;
    return this.pdfService.generatePdf(html, style, fileName);
  }
}

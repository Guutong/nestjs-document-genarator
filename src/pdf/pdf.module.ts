import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { GeneratePdfHandler } from './handler/generate-pdf.handler';
import { UploadS3Handler } from './handler/upload-s3.handler';
import { BrowserService } from './browser.service';

export const CommandHandlers = [GeneratePdfHandler, UploadS3Handler];
export const EventHandlers = [];

@Module({
  imports: [CqrsModule],
  controllers: [PdfController],
  providers: [
    {
      provide: BrowserService,
      useValue: BrowserService.getInstance(),
    },
    PdfService,
    ...CommandHandlers,
    ...EventHandlers,
  ],
})
export class PdfModule {}

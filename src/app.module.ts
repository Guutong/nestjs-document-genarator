import { Module } from '@nestjs/common';
import { PdfModule } from './pdf/pdf.module';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        !process.env.NODE_ENV || process.env.NODE_ENV === 'local'
          ? `${process.cwd()}/.env`
          : `${process.cwd()}/.env.${process.env.NODE_ENV}`,
    }),
    PdfModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

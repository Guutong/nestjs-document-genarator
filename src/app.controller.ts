import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('')
export class AppController {
  constructor(private configService: ConfigService) {}

  @Get('/health')
  health() {
    return {
      status: 'OK',
      environment: this.configService.get('MODE'),
    };
  }
}

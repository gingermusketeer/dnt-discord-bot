import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VisbookApi } from './visbook.api';
import { VisbookService } from './visbook.service';

@Module({
  imports: [ConfigModule],
  providers: [VisbookService, VisbookApi],
  exports: [VisbookService],
})
export class VisbookModule {}

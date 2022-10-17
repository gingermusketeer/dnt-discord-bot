import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VisbookService } from './visbook.service';

@Module({
  imports: [ConfigModule],
  providers: [VisbookService],
  exports: [VisbookService],
})
export class VisbookModule {}

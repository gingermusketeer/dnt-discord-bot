import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VisbookModule } from 'src/visbook/visbook.module';
import { CabinUtApi } from './cabinUt.api';
import { CabinUtService } from './cabinUt.service';

@Module({
  imports: [ConfigModule, VisbookModule],
  providers: [CabinUtService, CabinUtApi],
  exports: [CabinUtService],
})
export class CabinUtModule {}

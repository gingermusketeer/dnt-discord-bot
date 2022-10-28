import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VisbookModule } from 'src/visbook/visbook.module';
import { CabinUtService } from './cabinUt.service';

@Module({
  imports: [ConfigModule, VisbookModule],
  providers: [CabinUtService],
  exports: [CabinUtService],
})
export class CabinUtModule {}

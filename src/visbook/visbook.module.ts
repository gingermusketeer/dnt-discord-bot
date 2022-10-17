import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CabinModule } from 'src/cabin/cabin.module';
import { VisbookService } from './visbook.service';

@Module({
  imports: [ConfigModule, CabinModule],
  providers: [VisbookService],
  exports: [VisbookService],
})
export class VisbookModule {}

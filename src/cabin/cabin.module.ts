import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VisbookModule } from 'src/visbook/visbook.module';
import { CabinService } from './cabin.service';

@Module({
  imports: [ConfigModule, VisbookModule],
  providers: [CabinService],
  exports: [CabinService],
})
export class CabinModule {}

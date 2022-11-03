import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CabinDatabaseModule } from 'src/cabinDatabase/cabinDatabase.module';
import { VisbookModule } from 'src/visbook/visbook.module';
import { CabinService } from './cabin.service';

@Module({
  imports: [ConfigModule, CabinDatabaseModule, VisbookModule],
  providers: [CabinService],
  exports: [CabinService],
})
export class CabinModule {}

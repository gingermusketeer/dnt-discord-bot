import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CabinUtModule } from 'src/cabinUt/cabinUt.module';
import { CabinDatabaseApi } from './cabinDatabase.api';
import { CabinDatabaseService } from './cabinDatabase.service';

@Module({
  imports: [ConfigModule, CabinUtModule],
  providers: [CabinDatabaseService, CabinDatabaseApi],
  exports: [CabinDatabaseService],
})
export class CabinDatabaseModule {}

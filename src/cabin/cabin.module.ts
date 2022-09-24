import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CabinService } from './cabin.service';

@Module({
  imports: [ConfigModule],
  providers: [CabinService],
  exports: [CabinService],
})
export class CabinModule {}

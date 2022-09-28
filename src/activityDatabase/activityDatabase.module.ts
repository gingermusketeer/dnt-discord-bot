import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ActivityDatabaseService } from './activityDatabase.service';

@Module({
  imports: [ConfigModule],
  providers: [ActivityDatabaseService],
  exports: [ActivityDatabaseService],
})
export class ActivityDatabaseModule {}

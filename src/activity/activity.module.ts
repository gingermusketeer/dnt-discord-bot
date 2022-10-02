import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ActivityDatabaseModule } from 'src/activityDatabase/activityDatabase.module';
import { ActivityService } from './activity.service';

@Module({
  imports: [ConfigModule, ActivityDatabaseModule],
  providers: [ActivityService],
})
export class ActivityModule {}

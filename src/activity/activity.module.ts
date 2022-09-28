import { Module } from '@nestjs/common';
import { ActivityDatabaseModule } from 'src/activityDatabase/activityDatabase.module';
import { ActivityService } from './activity.service';

@Module({
  imports: [ActivityDatabaseModule],
  providers: [ActivityService],
})
export class ActivityModule {}

import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createClient,
  SupabaseClient,
  SupabaseRealtimePayload,
} from '@supabase/supabase-js';
import { ActivityData } from 'src/activity/activity.interface';
import { groupByKeys } from './activityDatabase.utils';

@Injectable()
export class ActivityDatabaseService implements OnModuleInit {
  private supabase: SupabaseClient;
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.getOrThrow('SUPABASE_URL');
    const supabaseKey = this.configService.getOrThrow('SUPABASE_KEY');
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async upsertActivities(activities: ActivityData[]) {
    const groups = groupByKeys(activities);
    const errors = [];
    for (const group of groups) {
      const { error } = await this.supabase
        .from('activities')
        .upsert(group, {});
      errors.push(error);
    }

    return errors;
  }

  async registerEventListener(
    table: 'activities',
    event: 'INSERT',
    onNewEvent: (data: SupabaseRealtimePayload<any>) => void,
  ) {
    await this.supabase.from(table).on(event, onNewEvent).subscribe();
  }
}

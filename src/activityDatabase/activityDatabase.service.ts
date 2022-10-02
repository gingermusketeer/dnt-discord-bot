import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createClient,
  SupabaseClient,
  SupabaseRealtimePayload,
} from '@supabase/supabase-js';

@Injectable()
export class ActivityDatabaseService implements OnModuleInit {
  private supabase: SupabaseClient;
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.getOrThrow('SUPABASE_URL');
    const supabaseKey = this.configService.getOrThrow('SUPABASE_KEY');
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async upsertActivities(activities: object[]) {
    const { error } = await this.supabase
      .from('activities')
      .upsert(activities, {});
    return error;
  }

  async registerEventListener(
    table: 'activities',
    event: 'INSERT',
    onNewEvent: (data: SupabaseRealtimePayload<any>) => void,
  ) {
    await this.supabase.from(table).on(event, onNewEvent).subscribe();
  }
}

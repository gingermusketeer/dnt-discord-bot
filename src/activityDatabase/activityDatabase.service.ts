import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
    const { data, error } = await this.supabase
      .from('activities')
      .upsert(activities, {});
    console.log(data, error);
    return error;
  }
}

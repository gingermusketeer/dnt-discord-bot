import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CabinUtApi } from 'src/cabinUt/cabinUt.api';
import { getVisbookId } from 'src/cabinUt/cabinUt.utils';
import { Logger } from '@nestjs/common';
import * as cron from 'node-cron';
import { CabinDatabaseApi } from './cabinDatabase.api';
import { SupabaseCabin } from './cabinDatabase.interface';
import { PostgrestResponse } from '@supabase/supabase-js';

@Injectable()
export class CabinDatabaseService implements OnModuleInit {
  private readonly logger = new Logger(CabinDatabaseService.name);
  private task: cron.ScheduledTask;
  private cabinUtApi: CabinUtApi;

  constructor(
    private readonly configService: ConfigService,
    private readonly cabinDatabaseApi: CabinDatabaseApi,
  ) {}

  async onModuleInit() {
    this.cabinUtApi = new CabinUtApi();

    if (this.configService.get('NODE_ENV') === 'production') {
      this.task = cron.schedule('0 1 * * *', this.on1am);
      this.logger.log('setup 1am cabin update');
    }
  }

  on1am = () => {
    this.logger.log('starting 1am cabin update');
    this.upsertCabinsFromUt().catch((error) => {
      this.logger.error('upsertCabinsFromUt failed with error', error);
    });
  };

  private async upsertCabinsFromUt() {
    const cabins = await this.cabinUtApi.getCabins();
    const supabaseCabins = await this.getCabinUtDetailsAsSupabaseCabins(cabins);
    const errors = await this.cabinDatabaseApi.upsertCabins(supabaseCabins);

    if (errors.length > 0) {
      console.log('errors');
      throw new Error(`${errors}`);
    }
  }

  private async getCabinUtDetailsAsSupabaseCabins(
    cabins: {
      node: {
        id: number;
      };
    }[],
  ): Promise<Omit<SupabaseCabin, 'id'>[]> {
    const supabaseCabins = [];
    for (const cabin of cabins) {
      const cabinDetails = await this.cabinUtApi.getCabinDetails(cabin.node.id);
      const bookingUrl = cabinDetails.bookingUrl;
      const visbookId = getVisbookId(bookingUrl);
      const description = cabinDetails.description;

      supabaseCabins.push({
        utId: cabinDetails.id,
        visbookId: visbookId,
        description: description,
        bookingUrl: bookingUrl,
        name: cabinDetails.name,
        lastUpdatedAt: new Date().toISOString(),
        geometry: cabinDetails.geometry,
        media: cabinDetails.media,
        openingHours: cabinDetails.openingHours,
      });
    }

    return supabaseCabins;
  }

  async getRandomCabin(options?: {
    mustBeBookable?: boolean;
  }): Promise<SupabaseCabin | null> {
    const cabins = await this.getRandomCabins({
      mustBeBookable: options?.mustBeBookable,
      limit: 1,
    });
    if (cabins !== null) return cabins[0];
    return null;
  }

  async getRandomCabins(options?: {
    mustBeBookable?: boolean;
    limit?: number;
  }): Promise<SupabaseCabin[] | null> {
    let response: PostgrestResponse<any>;
    if (options?.mustBeBookable) {
      response = await this.cabinDatabaseApi.getRandomBookableCabins(
        options?.limit,
      );
    }
    response = await this.cabinDatabaseApi.getRandomCabins(options?.limit);
    this.evaluateResponse(response);

    return response.data;
  }

  private evaluateResponse(response: PostgrestResponse<any>) {
    if (response.statusText !== 'OK') {
      throw new Error(
        `Supabase (cabins) response not ok. Got: ${response.status}`,
      );
    }

    if (response.data === null) {
      throw new Error(
        `Supabase (cabins) did not return data. Response status is: ${response.status}`,
      );
    }
  }
}

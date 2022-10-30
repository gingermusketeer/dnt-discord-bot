import { Injectable } from '@nestjs/common';
import { SupabaseCabin } from 'src/cabinDatabase/cabinDatabase.interface';
import { CabinDatabaseService } from 'src/cabinDatabase/cabinDatabase.service';
import { VisbookService } from 'src/visbook/visbook.service';
import { hasExceededTimeLimit } from './cabin.utils';

@Injectable()
export class CabinService {
  constructor(
    private readonly visbookService: VisbookService,
    private readonly cabinDatabaseService: CabinDatabaseService,
  ) {}


  async getRandomCabin(): Promise<SupabaseCabin | null> {
    const cabins = await this.cabinDatabaseService.getRandomCabin();
    return cabins;
  }

  async getRandomAvailableCabin(
    checkIn: string,
    checkOut: string,
  ): Promise<SupabaseCabin | null> {
    const startTime = Date.now();
    do {
      const cabin = await this.cabinDatabaseService.getRandomCabin();
      if (cabin === null) return null;

      const cabinIsBookable = await this.visbookService.isBookingEnabled(
        cabin.visbookId,
        checkIn,
        checkOut,
      );
      if (!cabinIsBookable) continue;

      const cabinIsAvailable = await this.visbookService.isCabinAvailable(
        cabin.visbookId,
        checkIn,
        checkOut,
      );
      if (cabinIsAvailable) return cabin;

      const ONE_MIN_IN_MILLISECONDS = 1 * 60 * 1000;
      if (
        hasExceededTimeLimit(startTime, Date.now(), ONE_MIN_IN_MILLISECONDS)
      ) {
        return null;
      }
    } while (true === true);

    return null;
  }
}

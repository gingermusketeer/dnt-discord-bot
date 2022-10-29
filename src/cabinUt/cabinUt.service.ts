import { Injectable } from '@nestjs/common';
import { VisbookService } from 'src/visbook/visbook.service';
import { dateIsValid, getVisbookId } from './cabinUt.utils';
import { CabinUtApi } from './cabinUt.api';
import { CabinUtDetails } from './cabinUt.interface';

@Injectable()
export class CabinUtService {
  private readonly apiClient = new CabinUtApi();

  constructor(private readonly visbookService: VisbookService) {}

  async getRandomCabin(): Promise<CabinUtDetails> {
    const cabins = await this.apiClient.getCabins();
    const cabin = cabins[Math.floor(Math.random() * cabins.length)];
    const { id } = cabin.node;
    const cabinDetails = await this.apiClient.getCabinDetails(id);
    return cabinDetails;
  }

  async isCabinAvailable(
    cabin: CabinUtDetails,
    checkIn: string,
    checkOut: string,
  ): Promise<boolean> {
    if (!dateIsValid(checkIn) || !dateIsValid(checkOut)) {
      console.log('invalid date(s)');
      return false;
    }

    const cabinVisbookId = getVisbookId(cabin.bookingUrl);

    if (cabinVisbookId === 0) return false;

    const cabinIsAvailable = await this.visbookService.isCabinAvailable(
      cabinVisbookId,
      checkIn,
      checkOut,
    );

    return cabinIsAvailable;
  }

  async getRandomAvailableCabin(
    checkIn: string,
    checkOut: string,
  ): Promise<CabinUtDetails | undefined> {
    if (!dateIsValid(checkIn) || !dateIsValid(checkOut)) {
      return undefined;
    }

    const hasExceededTimeLimit = (now: number, timeLimit: number): boolean => {
      const elapsedTime = now - startTime;
      if (elapsedTime >= timeLimit) {
        return true;
      }
      return false;
    };

    const startTime = Date.now();
    let cabin = await this.getRandomCabin();

    while ((await this.isCabinAvailable(cabin, checkIn, checkOut)) === false) {
      cabin = await this.getRandomCabin();
      const ONE_MIN_IN_MILLISECONDS = 1 * 60 * 1000;
      if (hasExceededTimeLimit(Date.now(), ONE_MIN_IN_MILLISECONDS)) {
        return undefined;
      }
    }

    return cabin;
  }
}

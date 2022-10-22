import { Injectable } from '@nestjs/common';
import { VisbookService } from 'src/visbook/visbook.service';
import { CabinDetails, CabinApi } from './cabin.api';
import { dateIsValid, getVisbookId } from './cabin.utils';

@Injectable()
export class CabinService {
  private readonly apiClient = new CabinApi();

  constructor(private readonly visbookService: VisbookService) {}

  async getRandomCabin(): Promise<CabinDetails> {
    const cabins = await this.apiClient.getCabins();
    const cabin = cabins[Math.floor(Math.random() * cabins.length)];
    const { id } = cabin.node;
    const cabinDetails = await this.apiClient.getCabinDetails(id);
    return cabinDetails;
  }

  async isCabinAvailable(
    cabin: CabinDetails,
    checkIn: string,
    checkOut: string,
  ): Promise<boolean> {
    if (!dateIsValid(checkIn) || !dateIsValid(checkOut)) {
      console.log('invalid date(s)');
      return false;
    }

    if (cabin.bookingUrl === null) {
      console.log('no booking url');
      return false;
    }

    if (!cabin.bookingUrl.includes('reservations')) {
      console.log('not a reservations url');
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
  ): Promise<CabinDetails | undefined> {
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

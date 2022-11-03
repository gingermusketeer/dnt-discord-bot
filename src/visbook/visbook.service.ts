import { Injectable, Logger } from '@nestjs/common';
import { VisbookApi } from './visbook.api';

@Injectable()
export class VisbookService {
  private readonly logger = new Logger(VisbookService.name);

  constructor(private readonly visbookApi: VisbookApi) {}

  async isCabinAvailable(
    cabinVisbookId: number,
    checkIn: string,
    checkOut: string,
  ): Promise<boolean> {
    const visbookResponse = await this.visbookApi.getAccommodationAvailability(
      cabinVisbookId,
      checkIn,
      checkOut,
    );

    const accommodations = visbookResponse.accommodations;

    if (accommodations === undefined) {
      return false;
    }

    for (const accommodation of accommodations) {
      if (accommodation.availability.available === true) return true;
    }

    return false;
  }

  // TODO This is a suggestion to prevent exceptions getting in the way of finding a random available cabin
  async isBookingEnabled(
    cabinVisbookId: number,
    checkIn: string,
    checkOut: string,
  ): Promise<boolean> {
    try {
      await this.visbookApi.getAccommodationAvailability(
        cabinVisbookId,
        checkIn,
        checkOut,
      );
    } catch (error) {
      this.logger.error(
        'getAccommodationAvailability failed with error',
        error,
      );
      return false;
    }
    return true;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { BookingDates } from 'src/slashCommand/commands/randomcabin.utils';
import { VisbookApi } from './visbook.api';

@Injectable()
export class VisbookService {
  private readonly logger = new Logger(VisbookService.name);

  constructor(private readonly visbookApi: VisbookApi) {}

  async isCabinAvailable(
    cabinVisbookId: number,
    bookingDates: BookingDates,
  ): Promise<boolean> {
    const visbookResponse = await this.visbookApi.getAccommodationAvailability(
      cabinVisbookId,
      bookingDates,
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
    bookingDates: BookingDates,
  ): Promise<boolean> {
    try {
      await this.visbookApi.getAccommodationAvailability(
        cabinVisbookId,
        bookingDates,
      );
    } catch (error) {
      this.logger.warn(
        'getAccommodationAvailability failed with error via isBookingEnabled',
        error,
      );
      return false;
    }
    return true;
  }
}

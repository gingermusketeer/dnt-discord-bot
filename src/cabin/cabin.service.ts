import { Injectable } from '@nestjs/common';
import { CabinDetails, CabinApi } from './cabin.api';

@Injectable()
export class CabinService {
  private readonly apiClient = new CabinApi();
  async getRandomCabin(): Promise<CabinDetails> {
    const cabins = await this.apiClient.getCabins();
    const cabin = cabins[Math.floor(Math.random() * cabins.length)];
    const { id } = cabin.node;
    const cabinDetails = await this.apiClient.getCabinDetails(id);
    return cabinDetails;
  }

  async isCabinAvailable(
    id: number,
    checkIn: Date,
    checkOut: Date,
  ): Promise<boolean> {
    const cabinDetails = await this.apiClient.getCabinDetails(id);
    /*
    TODO
    - How does user give input - via a message in discord?
    - Validate/format date to match yyyy-mm-dd
    */
    const checkInDate = checkIn;
    const checkOutDate = checkOut;

    const bookingUrl = `${cabinDetails.bookingUrl}?checkIn=${checkInDate}&checkOut=${checkOutDate}`;
    /*
    TODO
    - Some cabins point to booking.visbook.com, others to reservations.visbook.com
    - Sample URL: https://reservations.visbook.com/6093/search?lang=no&checkIn=2022-10-12&checkOut=2022-10-13
    - lang is optional
    - visbook API: https://ws.visbook.com/8/docs/index.html#tag/AvailabilityCalendar
    */

    // Call visbook api
    // If available rooms/beds, return true
    return false;
  }

  async getRandomAvailableCabin(
    checkIn: Date,
    checkOut: Date,
  ): Promise<CabinDetails | undefined> {
    const hasExceededTimeLimit = (now: number, timeLimit: number): boolean => {
      const elapsedTime = now - startTime;
      if (elapsedTime >= timeLimit) {
        return true;
      }
      return false;
    };

    // TODO validate/format checkIn, checkOut to match yyyy-mm-dd
    const startTime = Date.now();
    let cabin = await this.getRandomCabin();

    while (
      (await this.isCabinAvailable(cabin.id, checkIn, checkOut)) === false
    ) {
      cabin = await this.getRandomCabin();
      if (hasExceededTimeLimit(Date.now(), 60000)) {
        /* TODO
        - How long should response time (time limit) be? 1min? 5min?
        - Do we have a limit on how many api calls we can make in a given time?
        - Return undefined or specific message aka "could not find within time limit?"
        */
        return undefined;
      }
    }

    return cabin;
  }

  async getAvailableCabins(
    checkIn: Date,
    checkOut: Date,
  ): Promise<CabinDetails[]> {
    const cabins = await this.apiClient.getCabins();

    // TODO validate/format checkIn, checkOut to match yyyy-mm-dd

    const areCabinsAvailable = await Promise.all(
      cabins.map((cabin) =>
        this.isCabinAvailable(cabin.node.id, checkIn, checkOut),
      ),
    );

    const availableCabins = cabins.filter(
      (_value, index) => areCabinsAvailable[index],
    );

    const cabinDetails = await Promise.all(
      availableCabins.map((cabin) =>
        this.apiClient.getCabinDetails(cabin.node.id),
      ),
    );

    return cabinDetails;
  }
}

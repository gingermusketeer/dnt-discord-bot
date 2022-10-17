import { Injectable } from '@nestjs/common';
import { VisbookApi } from 'src/visbook/visbook.api';
import { CabinDetails, CabinApi } from './cabin.api';
import { dateIsValid } from './cabin.utils';

@Injectable()
export class CabinService {
  private readonly apiClient = new CabinApi();
  private readonly visbookApiClient = new VisbookApi();

  async getRandomCabin(): Promise<CabinDetails> {
    const cabins = await this.apiClient.getCabins();
    const cabin = cabins[Math.floor(Math.random() * cabins.length)];
    const { id } = cabin.node;
    const cabinDetails = await this.apiClient.getCabinDetails(id);
    return cabinDetails;
  }

  async isCabinAvailable(
    id: number,
    checkIn: string,
    checkOut: string,
  ): Promise<boolean> {
    // TODO Validate earlier to provide more useful user feedback
    if (!dateIsValid(checkIn) || !dateIsValid(checkOut)) {
      return false;
    }

    const cabinDetails = await this.apiClient.getCabinDetails(id);

    const cabinIsAvailable = this.visbookApiClient.isCabinAvailable(
      cabinDetails,
      checkIn,
      checkOut,
    );

    return cabinIsAvailable;
  }

  async getRandomAvailableCabin(
    checkIn: string,
    checkOut: string,
  ): Promise<CabinDetails | undefined> {
    // TODO Validate earlier to provide more useful user feedback
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
    checkIn: string,
    checkOut: string,
  ): Promise<CabinDetails[] | undefined> {
    // TODO Validate earlier to provide more useful user feedback
    if (!dateIsValid(checkIn) || !dateIsValid(checkOut)) {
      return undefined;
    }

    const cabins = await this.apiClient.getCabins();

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

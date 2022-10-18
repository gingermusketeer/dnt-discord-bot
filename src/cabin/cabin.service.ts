import { Injectable } from '@nestjs/common';
import { CabinApi } from './cabin.api';
import { CabinDetails } from './cabin.interface';

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
}

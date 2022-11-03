import { Injectable } from '@nestjs/common';
import { CabinSummary } from 'src/cabinDatabase/cabinDatabase.interface';
import { CabinUtApi } from './cabinUt.api';
import { getVisbookId } from './cabinUt.utils';

@Injectable()
export class CabinUtService {
  constructor(private readonly cabinUtApi: CabinUtApi) {}

  async getCabins() {
    return this.cabinUtApi.getCabins();
  }

  async getCabinSummaries(
    cabins: {
      node: {
        id: number;
      };
    }[],
  ): Promise<Omit<CabinSummary, 'id'>[]> {
    const cabinSummaries = [];
    for (const cabin of cabins) {
      const cabinDetails = await this.cabinUtApi.getCabinDetails(cabin.node.id);
      const bookingUrl = cabinDetails.bookingUrl;
      const visbookId = getVisbookId(bookingUrl);
      const description = cabinDetails.description;

      cabinSummaries.push({
        utId: cabinDetails.id,
        visbookId: visbookId,
        description: description,
        bookingUrl: bookingUrl,
        name: cabinDetails.name,
        updatedAt: new Date().toISOString(),
        geometry: cabinDetails.geometry,
        media: cabinDetails.media,
        openingHours: cabinDetails.openingHours,
      });
    }

    return cabinSummaries;
  }
}

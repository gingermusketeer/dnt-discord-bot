import { AccommodationAvailability } from './visbook.interface';

export class VisbookApi {
  async getAccommodationAvailability(
    cabinVisbookId: number,
    checkIn: string,
    checkOut: string,
  ): Promise<AccommodationAvailability> {
    const request = `/${cabinVisbookId}/webproducts/${checkIn}/${checkOut}`;
    return await this.makeRequest(request);
  }

  private async makeRequest(
    request: string,
  ): Promise<AccommodationAvailability> {
    const apiURL = `https://ws.visbook.com/8/api`;
    const requestUrl = `${apiURL}${request}`;

    const response = await fetch(requestUrl, {
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'no,nb-NO',
        'cache-control': 'no-cache',
      },
    });

    return response.json();
  }
}

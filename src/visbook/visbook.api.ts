import { BookingDates } from 'src/slashCommand/commands/randomcabin.utils';
import { formatAsYYYYMMDD } from './visbook.utils';
import { AccommodationAvailability } from './visbook.interface';

/*
Visbook API docs: https://ws.visbook.com/8/docs/index.html
*/

export class VisbookApi {
  async getAccommodationAvailability(
    cabinVisbookId: number,
    bookingDates: BookingDates,
  ): Promise<AccommodationAvailability> {
    const checkIn = formatAsYYYYMMDD(bookingDates.checkIn);
    const checkOut = formatAsYYYYMMDD(bookingDates.checkOut);
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

    if (!response.ok) {
      throw new Error(`Visbook response not ok. Got: ${response.status}`);
    }

    return response.json();
  }
}

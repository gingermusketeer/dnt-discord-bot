import { CabinDetails } from 'src/cabin/cabin.api';
import { AccommodationAvailability } from './visbook.interface';

export class VisbookApi {
  async isCabinAvailable(
    cabin: CabinDetails,
    checkIn: string,
    checkOut: string,
  ): Promise<boolean> {
    const bookingUrl = cabin.bookingUrl;

    console.log('Cabin:', cabin.id, bookingUrl, checkIn, checkOut);

    if (bookingUrl === undefined) {
      return false;
    }

    // https://reservations.visbook.com/5461?lang=no
    // Check if booking.visbook or reservations.visbook
    // Extract ID

    /*
    TODO
    - Some cabins point to booking.visbook.com, others to reservations.visbook.com
    - Sample URL: https://reservations.visbook.com/6093/search?lang=no&checkIn=2022-10-12&checkOut=2022-10-13
    - lang is optional
    - visbook API: https://ws.visbook.com/8/docs/index.html#tag/AvailabilityCalendar
    */

    // TODO get ID from bookingUrl
    // verify it also works for bookings.visbook.com ?
    const cabinVisbookId = 5972;

    const visbookResponse = await this.makeRequest(
      cabinVisbookId,
      checkIn,
      checkOut,
    );

    const accommodations = visbookResponse.accommodations;

    for (const accommodation of accommodations) {
      if (accommodation.availability.available === true) return true;
    }

    return false;
  }

  private async makeRequest(
    cabinId: number,
    checkIn: string,
    checkOut: string,
  ): Promise<AccommodationAvailability> {
    const requestUrl = `https://ws.visbook.com/8/api/${cabinId}/webproducts/${checkIn}/${checkOut}`;

    const response = await fetch(requestUrl, {
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'no,nb-NO',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        'sec-ch-ua':
          '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'x-requested-with': 'XMLHttpRequest',
      },
      referrer: 'https://reservations.visbook.com/',
      referrerPolicy: 'strict-origin-when-cross-origin',
      body: null,
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
    });

    return response.json();
  }
}

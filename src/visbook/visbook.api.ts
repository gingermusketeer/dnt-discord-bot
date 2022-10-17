import { CabinDetails } from 'src/cabin/cabin.api';

export class VisbookApi {
  async isCabinAvailable(
    cabinDetails: CabinDetails,
    checkIn: string,
    checkOut: string,
  ): Promise<boolean> {
    /*
    TODO
    - Validate/format date to match yyyy-mm-dd
    */
    const checkInDate = checkIn;
    const checkOutDate = checkOut;

    const bookingUrl = cabinDetails.bookingUrl;

    console.log(bookingUrl);

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

  private async makeRequest(query: any) {
    const response = await fetch(
      `https://ws.visbook.com/8/api/6093/webproducts/${checkIn}/${checkOut}`,
      {
        headers: {
          accept: 'application/json, text/plain, */*',
          'accept-language': 'no,nb-NO',
          //'cache-control': 'no-cache',
          /*pragma: 'no-cache',
          'sec-ch-ua':
            '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
          'x-requested-with': 'XMLHttpRequest',*/
        },
        referrer: 'https://reservations.visbook.com/',
        referrerPolicy: 'strict-origin-when-cross-origin',
        body: null,
        method: 'GET',
        mode: 'cors',
        //credentials: 'include',
      },
    );

    //console.log(resp);

    return response.json();
  }
}

import { AccommodationAvailability } from './visbook.interface';

export class VisbookApi {
  async isCabinAvailable(
    cabinVisbookId: number,
    checkIn: string,
    checkOut: string,
  ): Promise<boolean> {
    const visbookResponse = await this.makeRequest(
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

  private async makeRequest(
    cabinVisbookId: number,
    checkIn: string,
    checkOut: string,
  ): Promise<AccommodationAvailability> {
    const requestUrl = `https://ws.visbook.com/8/api/${cabinVisbookId}/webproducts/${checkIn}/${checkOut}`;

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

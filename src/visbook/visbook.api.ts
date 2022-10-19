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

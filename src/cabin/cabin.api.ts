import { CabinDetails } from './cabin.interface';

export class CabinApi {
  async getCabins(): Promise<{ node: { id: number } }[]> {
    const query = {
      operationName: 'FindCabins',
      variables: {
        input: {
          pageOptions: {
            limit: 500,
            afterCursor: null,
            orderByDirection: 'DESC',
            orderBy: 'ID',
          },
          filters: {
            and: [
              {
                serviceLevel: {
                  values: ['staffed', 'self-service', 'no-service'],
                },
              },
              { dntCabin: { value: true } },
            ],
          },
        },
      },
      query:
        'query FindCabins($input: NTB_FindCabinsInput) {\n  ntb_findCabins(input: $input) {\n    totalCount\n    pageInfo {\n      hasNextPage\n      endCursor\n      __typename\n    }\n    edges {\n      node {\n        ...CabinFragment\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment CabinFragment on NTB_Cabin {\n  id\n  name\n  serviceLevel\n  bedsToday\n  bedsStaffed\n  bedsNoService\n  bedsSelfService\n  bedsWinter\n  dntCabin\n  owner {\n    name\n    __typename\n  }\n  accessibilities {\n    id\n    name\n    __typename\n  }\n  openingHours {\n    allYear\n    from\n    to\n    serviceLevel\n    key\n    __typename\n  }\n  geometry\n  media {\n    id\n    uri\n    type\n    description\n    tags\n    __typename\n  }\n  areas {\n    id\n    name\n    __typename\n  }\n  __typename\n}\n',
    };

    const body = await this.makeRequest(query);
    const {
      data: {
        ntb_findCabins: { edges },
      },
    } = body;
    return edges;
  }
  async getCabinDetails(id: number): Promise<CabinDetails> {
    const query = {
      operationName: 'GetCabin',
      variables: { id },
      query:
        'query GetCabin($id: Int!) {\n  ntb_getCabin(id: $id) {\n    __typename\n    id\n    status\n    name\n    description\n    geometry\n    dntCabin\n    dntDiscount\n    serviceLevel\n    bedsToday\n    bedsStaffed\n    bedsNoService\n    bedsSelfService\n    bedsWinter\n    maintainerGroup\n    owner {\n      id\n      name\n      type\n      __typename\n    }\n    contactGroup\n    contactName\n    email\n    phone\n    mobile\n    fax\n    address\n    publicTransportAvailable\n    carAllYear\n    carSummer\n    bicycle\n    boatTransportAvailable\n    wintertimeText\n    summertimeText\n    bookingEnable\n    bookingOnly\n    bookingUrl\n    accessibilityDescription\n    videoUri\n    media {\n      id\n      tags\n      altText\n      type\n      uri\n      status\n      description\n      license\n      photographer\n      email\n      tags\n      altText\n      __typename\n    }\n    suitableFor {\n      name\n      __typename\n    }\n    accessibilities {\n      id\n      name\n      __typename\n    }\n    facilities {\n      name\n      __typename\n    }\n    openingHours {\n      allYear\n      from\n      to\n      key\n      serviceLevel\n      __typename\n    }\n    links {\n      type\n      url\n      title\n      __typename\n    }\n    areas {\n      id\n      name\n      type\n      __typename\n    }\n    trips {\n      name\n      id\n      __typename\n    }\n    pois {\n      name\n      id\n      __typename\n    }\n    routes {\n      id\n      name\n      grading\n      type\n      distance\n      code\n      __typename\n    }\n    createdAt\n    updatedAt\n    checkinInfo {\n      totalCount\n      myCheckins {\n        id\n        type\n        date\n        __typename\n      }\n      __typename\n    }\n  }\n}\n',
    };
    const response = await this.makeRequest(query);
    console.log(JSON.stringify(response));
    return response.data.ntb_getCabin;
  }

  private async makeRequest(query: any) {
    const response = await fetch('https://api.ut.no/', {
      body: JSON.stringify(query),
      cache: 'default',
      credentials: 'omit',
      headers: {
        Accept: '*/*',
        'Accept-Language': 'nb-NO,nb;q=0.9',
        Authorization: '',
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15',
      },
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      referrer: 'https://ut.no/',
      referrerPolicy: 'strict-origin-when-cross-origin',
    });

    return response.json();
  }
}

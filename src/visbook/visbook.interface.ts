// TODO replace "unknown" for relevant properties

export interface AccommodationAvailability {
  accommodations: Accommodation[];
  activities: Record<string, unknown>[];
  restaurants: Record<string, unknown>[];
}

interface Accommodation {
  id: number;
  type: string;
  sortIndex: number;
  encryptedCompanyId: string;
  name: string;
  defaultName: string;
  unitName: string;
  defaultUnitName: string;
  maxPeople: number;
  minPeople: number;
  description: Record<string, unknown>; // example: { "long": null, "short": "Lower bunk" }
  availability: Availability;
  prices: Price[];
  images: Image[];
  additionalServices: unknown[];
  additionalMechandises: unknown[];
  productGroup: unknown;
  properties: { [key: string]: Property };
}

interface Availability {
  available: boolean;
  reason: unknown; // string?
  reasonText: string;
  steps: Step[];
}

interface Image {
  imageType: string;
  imagePath: string;
  transformer: string;
}

interface Price {
  id: number;
  name: string;
  priceType: string;
  pensionType: string;
  discount1: number;
  discount2: number;
  originalPricePerStep: number;
  pricePerStep: number;
  calculatedPrice: number;
  availableNumberOfPeople: [
    {
      from: number;
      to: number;
      exclude: []; // ?
    },
  ];
  steps: Step[];
  priceAgeGroup: []; // ?
}

interface Property {
  value: unknown; // ?
  text: unknown; // ?
  name: string;
  description: string;
  type: string; // ?
  group: unknown; // ?
}

interface Step {
  availableUnits?: number;
  from: string;
  to: string;
}

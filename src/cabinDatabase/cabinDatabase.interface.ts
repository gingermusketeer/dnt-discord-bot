import { Geometry, Media, OpeningHour } from 'src/cabinUt/cabinUt.interface';

export interface SupabaseCabin {
  id: number;
  updatedAt: string;
  utId: number;
  visbookId: number;
  bookingUrl: string;
  description: string;
  name: string;
  geometry: Geometry;
  media: Media[];
  openingHours: OpeningHour[];
}

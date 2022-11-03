export interface CabinUtDetails {
  __typename: string;
  id: number;
  status: string;
  name: string;
  description: string;
  geometry: Geometry;
  dntCabin: boolean;
  dntDiscount: boolean;
  serviceLevel: string;
  bedsToday: number;
  bedsStaffed: number;
  bedsNoService: number;
  bedsSelfService: number;
  bedsWinter: number;
  maintainerGroup: number;
  owner: Owner;
  contactGroup: number;
  contactName: string;
  email: string;
  phone?: any;
  mobile: string;
  fax?: any;
  address: string;
  publicTransportAvailable: boolean;
  carAllYear: boolean;
  carSummer: boolean;
  bicycle: boolean;
  boatTransportAvailable: boolean;
  wintertimeText: string;
  summertimeText: string;
  bookingEnable: boolean;
  bookingOnly: boolean;
  bookingUrl: string;
  accessibilityDescription?: any;
  videoUri?: any;
  media: Media[];
  suitableFor: SuitableFor[];
  accessibilities?: any;
  facilities: SuitableFor[];
  openingHours: OpeningHour[];
  links: Link[];
  areas: Owner[];
  trips: Trip[];
  pois?: any;
  routes: Route[];
  createdAt: string;
  updatedAt: string;
  checkinInfo: CheckinInfo;
}
interface CheckinInfo {
  totalCount: number;
  myCheckins?: any;
  __typename: string;
}
interface Route {
  id: number;
  name: string;
  grading: string;
  type: string;
  distance: number;
  code: string;
  __typename: string;
}
interface Trip {
  name: string;
  id: number;
  __typename: string;
}
interface Link {
  type: string;
  url: string;
  title: string;
  __typename: string;
}
export interface OpeningHour {
  allYear: boolean;
  from: string;
  to: string;
  key?: any;
  serviceLevel: string;
  __typename: string;
}
interface SuitableFor {
  name: string;
  __typename: string;
}
export interface Media {
  id: number;
  tags?: string[];
  altText?: any;
  type: string;
  uri: string;
  status: string;
  description: string;
  license?: string;
  photographer: string;
  email?: string;
  __typename: string;
}
interface Owner {
  id: number;
  name: string;
  type: string;
  __typename: string;
}
export interface Geometry {
  type: string;
  coordinates: number[];
}

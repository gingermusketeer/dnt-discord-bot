import { JTDSchemaType } from 'ajv/dist/jtd';

export type ActivityData = {
  id: string;
  title: string;
  url: string;
  type: string;
  descriptionNb?: string;
  descriptionEn?: string;
  media: { url: string; caption: string }[];
  updatedAt: Date;
  tripCode: string;
  tripArea: string[];
  organiser: string[];
  tripType: string[];
  audience: string[];
  difficulty: string;
  endsAt: Date | null;
  startsAt: Date | null;
  signUpAt?: Date;
  requiresSignUp: boolean;
  cancelled: boolean;
};

export type Info = Pick<
  ActivityData,
  | 'tripCode'
  | 'tripArea'
  | 'organiser'
  | 'tripType'
  | 'audience'
  | 'difficulty'
  | 'endsAt'
  | 'startsAt'
>;

export const ActivityDataSchema: JTDSchemaType<ActivityData> = {
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    url: { type: 'string' },
    type: { type: 'string' },
    media: {
      elements: {
        properties: { url: { type: 'string' }, caption: { type: 'string' } },
      },
    },
    updatedAt: { type: 'timestamp' },
    tripCode: { type: 'string' },
    tripArea: { elements: { type: 'string' } },
    organiser: { elements: { type: 'string' } },
    tripType: { elements: { type: 'string' } },
    audience: { elements: { type: 'string' } },
    difficulty: { type: 'string' },
    endsAt: { type: 'timestamp', nullable: true },
    startsAt: { type: 'timestamp', nullable: true },
    requiresSignUp: { type: 'boolean' },
    cancelled: { type: 'boolean' },
  },
  optionalProperties: {
    descriptionEn: { type: 'string' },
    descriptionNb: { type: 'string' },
    signUpAt: { type: 'timestamp' },
  },
};

import { Prisma } from '@prisma/client';

const subscriber = Prisma.validator<Prisma.subscriptionsArgs>()({
  select: { subscriberId: true, subscriberType: true },
});

export type Subscriber = Prisma.subscriptionsGetPayload<typeof subscriber>;

const subscription = Prisma.validator<Prisma.subscriptionsArgs>()({
  select: {
    id: true,
    subscriberId: true,
    subscriberType: true,
    topic: true,
    createdAt: true,
    updatedAt: true,
    notifiedAt: true,
    type: true,
  },
});

export type Subscription = Prisma.subscriptionsGetPayload<typeof subscription>;

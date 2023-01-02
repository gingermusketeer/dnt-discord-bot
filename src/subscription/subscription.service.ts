import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Subscriber } from 'prisma/prisma.types';
import { DbService } from 'src/db/db.service';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(private readonly dbService: DbService) {}

  public async add(subscription: Prisma.subscriptionsCreateInput) {
    try {
      await this.dbService.prisma.subscriptions.create({
        data: subscription,
      });
    } catch (error) {
      this.logger.log(
        'Adding new subscription to database failed with error',
        error,
      );
      return false;
    }

    return true;
  }

  // TODO move to activity module?
  public async getNewActivities(tripType: string, after: Date) {
    return this.dbService.prisma.activities.findMany({
      where: {
        tripType: { has: tripType }, // TODO make this case INsensitive! https://www.prisma.io/docs/concepts/components/prisma-client/case-sensitivity
        createdAt: { gt: after },
      },
    });
  }

  // TODO move to cabins module?
  public async getNewCabins(after: Date) {
    return this.dbService.prisma.cabins.findMany({
      where: {
        createdAt: { gt: after },
      },
    });
  }

  public async getSubscribers(): Promise<Subscriber[] | undefined> {
    return this.dbService.prisma.subscriptions.groupBy({
      by: ['subscriberType', 'subscriberId'],
    });
  }

  public async getSubscriptions(subscriberId: string) {
    return this.dbService.prisma.subscriptions.findMany({
      where: { subscriberId: subscriberId },
    });
  }
}

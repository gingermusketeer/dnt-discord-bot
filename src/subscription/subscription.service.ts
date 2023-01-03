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

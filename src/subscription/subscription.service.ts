import { Injectable, Logger } from '@nestjs/common';
import { DbService } from 'src/db/db.service';

interface Subscription {
  subscriberId: string;
  subscriberType: string;
  type: string;
  topic: string | null;
}

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(private readonly dbService: DbService) {}

  public async add(subscription: Subscription) {
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

  public async getActivities(tripType: string, after: Date) {
    return this.dbService.prisma.activities.findMany({
      where: {
        tripType: { has: tripType },
        createdAt: { gt: after },
      },
    });
  }
}

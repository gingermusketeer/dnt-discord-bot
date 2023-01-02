import { Injectable, Logger } from '@nestjs/common';
import * as cron from 'node-cron';
import { ConfigService } from '@nestjs/config';
import { DiscordService } from 'src/discord/discord.service';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { Subscriber } from 'prisma/prisma.types';
import { activities, cabins, subscriptions } from '@prisma/client';

type NewActivities = {
  topic: string;
  activities: activities[];
};

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private task: cron.ScheduledTask;

  constructor(
    private readonly configService: ConfigService,
    private readonly discordService: DiscordService,
    private readonly subscriptionService: SubscriptionService,
  ) {
    if (this.configService.get('NODE_ENV') === 'production') {
      this.task = cron.schedule('0 16 * * *', this.on4pm);
      this.logger.log('setup 4pm notifications');
    }
  }

  //// DO NOT COMMIT >>>>
  onModuleInit() {
    this.findSubscribersAndSubscriptions();
  }
  //// <<<< DO NOT COMMIT ABOVE

  on4pm = () => {
    this.logger.log('on4pm');
    this.findSubscribersAndSubscriptions()
      .catch((error) => {
        this.logger.error('Sending notifications failed with error.', error);
      })
      .then(() => this.logger.log('Notifications sent successfully.'));
  };

  private async findSubscribersAndSubscriptions() {
    const subscribers = await this.subscriptionService.getSubscribers();

    subscribers?.forEach(async (subscriber) => {
      const subscriptions = await this.subscriptionService.getSubscriptions(
        subscriber.subscriberId,
      );
      if (subscriptions === undefined || subscriptions.length === 0) {
        return;
      }

      const { newActivities, newCabins } = await this.findNewsForSubscriptions(
        subscriptions,
      );
      if (newActivities === null && newCabins === null) {
        return;
      }

      const messageContent = this.createNotificationMessage(
        subscriber,
        subscriptions.length,
        newActivities,
        newCabins,
      );
      await this.sendNotification(subscriber, messageContent);
      // TODO set notifiedAt for all subscriptions of this subscriber
    });
  }

  private async findNewsForSubscriptions(subscriptions: subscriptions[]) {
    const cabinSubscriptions = subscriptions.filter((s) => s.type === 'cabins');
    const activitySubscriptions = subscriptions.filter(
      (s) => s.type === 'activities',
    );

    const newCabins = await this.getNewCabins(cabinSubscriptions);
    const newActivities = await this.getNewActivities(activitySubscriptions);

    if (newActivities.length === 0 && newCabins.length === 0) {
      return { newActivities: null, newCabins: null };
    }

    return { newActivities: newActivities, newCabins: newCabins };
  }

  private async getNewCabins(subscriptions: subscriptions[]) {
    const news: cabins[] = [];

    for (const subscription of subscriptions) {
      const cabins = await this.subscriptionService.getNewCabins(
        subscription.notifiedAt,
      );
      news.push(...cabins);
    }
    return news;
  }

  private async getNewActivities(
    subscriptions: subscriptions[],
  ): Promise<NewActivities[]> {
    const news: NewActivities[] = [];
    for (const subscription of subscriptions) {
      if (subscription.topic !== null) {
        const activities = await this.subscriptionService.getNewActivities(
          subscription.topic,
          subscription.notifiedAt,
        );
        news.push({ topic: subscription.topic, activities: [...activities] });
      }
    }
    return news;
  }

  private createNotificationMessage(
    subscriber: Subscriber,
    subscriptionCount: number,
    newActivities: NewActivities[] | null,
    newCabins: cabins[] | null,
  ) {
    const messageContent = [];

    if (subscriber.subscriberType === 'user') {
      messageContent.push(
        `Hei! :heart_eyes_cat: Here is your daily digest of ${subscriptionCount} active subscriptions.\n`,
      );
    }
    if (subscriber.subscriberType === 'channel') {
      messageContent.push(
        "Hei, I found some new activities related to this channel's subscriptions! :heart_eyes_cat:\n",
      );
    }

    if (newActivities !== null && newActivities.length > 0) {
      newActivities.forEach((activitiesByTopic) => {
      messageContent.push(
          `${activitiesByTopic.activities.length} new activities that mention "${activitiesByTopic.topic}":\n`,
      );
      // TODO list new activities
      });
    }

    if (newCabins !== null && newCabins.length > 0) {
      messageContent.push(`Check out ${newCabins.length} new cabins:\n`);
      // TODO list new cabins
    }

    return messageContent.join('');
  }

  private async sendNotification(
    subscriber: Subscriber,
    messageContent: string,
  ) {
    if (subscriber.subscriberType === 'user') {
      await this.discordService.sendDm(subscriber.subscriberId, messageContent);
    }

    if (subscriber.subscriberType === 'channel') {
      await this.discordService.sendMessageWithoutEmbed(
        subscriber.subscriberId,
        messageContent,
      );
    }
  }
}

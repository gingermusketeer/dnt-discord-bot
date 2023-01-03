import { Injectable, Logger } from '@nestjs/common';
import * as cron from 'node-cron';
import { ConfigService } from '@nestjs/config';
import { DiscordService } from 'src/discord/discord.service';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { Subscriber } from 'prisma/prisma.types';
import { activities, cabins, subscriptions } from '@prisma/client';
import { ActivityService } from 'src/activity/activity.service';
import { CabinService } from 'src/cabin/cabin.service';
import { EmbedBuilder } from 'discord.js';

type MessageThread = {
  topic: string | null;
  mainMessage: string;
  embeds: EmbedBuilder[];
};

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private task: cron.ScheduledTask;

  constructor(
    private readonly activityService: ActivityService,
    private readonly cabinService: CabinService,
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
      if (subscriptions.length === 0) {
        return;
      }

      const subscriptionsWithNews = await this.findNewsForSubscriptions(
        subscriptions,
      );
      if (subscriptionsWithNews.length === 0) {
        return;
      }

      const messages = this.createNotificationMessages(subscriptionsWithNews);
      if (subscriber.subscriberType === 'channel') {
        await this.sendNotificationsInThreads(subscriber, messages);
      }
      if (subscriber.subscriberType === 'user') {
        await this.sendNotificationsAsDm(subscriber, messages);
      }
      // TODO set notifiedAt for all subscriptions of this subscriber
    });
  }

  private async findNewsForSubscriptions(subscriptions: subscriptions[]) {
    const subscriptionsWithNews = [];

    for (const subscription of subscriptions) {
      if (subscription.type === 'cabins') {
        const news = await this.getNewCabins(subscription);
        if (news.length > 0) {
          subscriptionsWithNews.push({
            subscription: subscription,
            news: news,
          });
        }
      }

      if (subscription.type === 'activities') {
        const news = await this.getNewActivities(subscription);
        if (news.length > 0) {
          subscriptionsWithNews.push({
            subscription: subscription,
            news: news,
          });
        }
      }
    }

    return subscriptionsWithNews;
  }

  private async getNewCabins(subscription: subscriptions) {
    return this.cabinService.getNewCabins(subscription.notifiedAt);
  }

  private async getNewActivities(
    subscription: subscriptions,
  ): Promise<activities[]> {
    if (subscription.topic !== null) {
      return await this.activityService.getNewActivities(
        subscription.topic,
        subscription.notifiedAt,
      );
    }
    return [];
  }

  private createNotificationMessages(
    subscriptionsWithNews: {
      subscription: subscriptions;
      news: cabins[] | activities[];
    }[],
  ): MessageThread[] {
    const subscriberType = subscriptionsWithNews[0].subscription.subscriberType;
    const today = new Date();
    const todayString = `${today.getDate()}.${
      today.getMonth() + 1
    }.${today.getFullYear()}`;
    const messages = subscriptionsWithNews.map((sub) => {
      if (sub.subscription.type === 'activities') {
        const topic = `${sub.subscription.topic} (${todayString})`;
        const mainMessage = `:point_right: ${sub.news.length} new activities that mention "${sub.subscription.topic}".\n`;
        const embeds = sub.news.map((activity) => {
          // return new EmbedBuilder()
          //   .setTitle(activity.title)
          //   .setURL(activity.url);
          return new EmbedBuilder().setTitle('activity').setURL('http://ut.no');
        });
        return { topic: topic, mainMessage: mainMessage, embeds: embeds };
      }
      if (sub.subscription.type === 'cabins') {
        const mainMessage = `:house_with_garden: ${sub.news.length} new cabins:`;
        const embeds = sub.news.map((cabin) => {
          // return new EmbedBuilder()
          //   .setTitle(cabin.name)
          //   .setURL(`http://ut.no/hytte/${cabin.utId}`);
          return new EmbedBuilder().setTitle('cabin').setURL('http://ut.no');
        });
        return {
          topic: `New cabins (${todayString})`,
          mainMessage: mainMessage,
          embeds: embeds,
        };
      }
      return { topic: '', mainMessage: '', embeds: [] };
    });

    if (subscriberType === 'user') {
      messages.unshift({
        topic: '',
        mainMessage: `Hei! Here is your daily digest of ${subscriptionsWithNews.length} active subscriptions. :smiley_cat:\n`,
        embeds: [],
      });
    }
    if (subscriberType === 'channel') {
      messages.unshift({
        topic: '',
        mainMessage: `Hei, I found some new activities related to this channel's subscriptions! :smiley_cat:\n`,
        embeds: [],
      });
    }

    return messages;
  }

  private async sendNotificationsAsDm(
    subscriber: Subscriber,
    messages: MessageThread[],
  ) {
    for (const message of messages) {
      await this.discordService.sendDm(
        subscriber.subscriberId,
        message.mainMessage,
      );

      for (const embed of message.embeds) {
        await this.discordService.sendDmWithEmbeds(
          subscriber.subscriberId,
          '',
          [embed],
        );
      }

      // TODO TODO fix this to send embeds as chunks; chunks are created successfully, but only one embed appears
      // multiple embeds only possible with webhooks? https://www.reddit.com/r/discordapp/comments/brqw71/how_can_i_add_multiple_embeds_in_a_message/
      // const maxEmbedsPerMessage = 5;
      // for (let i = 0; i < message.embeds.length; i += maxEmbedsPerMessage) {
      //   const chunk = message.embeds.slice(i, i + maxEmbedsPerMessage);
      //   await this.discordService.sendDmWithEmbeds(
      //     subscriber.subscriberId,
      //     '',
      //     chunk,
      //   );
      // }
    }
  }

  private async sendNotificationsInThreads(
    subscriber: Subscriber,
    messages: MessageThread[],
  ) {
    for (const notificationMessage of messages) {
      const message = await this.discordService.sendMessageWithoutEmbed(
        subscriber.subscriberId,
        notificationMessage.mainMessage,
      );

      if (message && notificationMessage.embeds.length > 0) {
        const threadName = notificationMessage.topic
          ? notificationMessage.topic
          : 'New cabins';
        const thread = await this.discordService.createThreadFromMessage(
          message,
          threadName,
        );

        for (const embed of notificationMessage.embeds) {
          await thread.send({ embeds: [embed] });
        }

        // TODO fix this to send embeds as chunks; chunks are created successfully, but only one embed appears in the thread message
        // multiple embeds only possible with webhooks? https://www.reddit.com/r/discordapp/comments/brqw71/how_can_i_add_multiple_embeds_in_a_message/
        // const maxEmbedsPerMessage = 10;
        // for (
        //   let i = 0;
        //   i < notificationMessage.embeds.length;
        //   i += maxEmbedsPerMessage
        // ) {
        //   const chunk = notificationMessage.embeds.slice(
        //     i,
        //     i + maxEmbedsPerMessage,
        //   );
        //   await thread.send({ embeds: chunk });
        // }
      }
    }
  }
}

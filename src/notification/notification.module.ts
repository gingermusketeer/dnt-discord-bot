import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordModule } from 'src/discord/discord.module';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { NotificationService } from './notification.service';

@Module({
  imports: [ConfigModule, DiscordModule, SubscriptionModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}

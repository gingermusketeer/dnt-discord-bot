import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { Client, GatewayIntentBits } from 'discord.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [DiscordService],
})
export class DiscordModule {}

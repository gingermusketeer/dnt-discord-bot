import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { ConfigModule } from '@nestjs/config';
import { CabinModule } from 'src/cabin/cabin.module';

@Module({
  imports: [ConfigModule, CabinModule],
  providers: [DiscordService],
})
export class DiscordModule {}

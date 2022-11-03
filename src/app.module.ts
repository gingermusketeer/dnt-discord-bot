import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ActivityModule } from './activity/activity.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BotModule } from './bot/bot.module';
import { CabinModule } from './cabin/cabin.module';

@Module({
  imports: [
    LoggerModule.forRoot(),
    BotModule,
    ActivityModule,
    ConfigModule.forRoot(),
    CabinModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

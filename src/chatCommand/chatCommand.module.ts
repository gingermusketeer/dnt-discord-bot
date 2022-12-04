import { Module } from '@nestjs/common';
import { ChatCommandService } from './chatCommand.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [ChatCommandService],
  exports: [ChatCommandService],
})
export class ChatCommandModule {}

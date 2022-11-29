import { Module } from '@nestjs/common';
import { EmbedService } from './embed.service';

@Module({
  imports: [],
  providers: [EmbedService],
  exports: [EmbedService],
})
export class EmbedModule {}

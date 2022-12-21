import { Module } from '@nestjs/common';
import { DbModule } from 'src/db/db.module';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [DbModule],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}

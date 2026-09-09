import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliverySubmission } from './delivery-submissions.entity';
import { DeliverySubmissionsController } from './delivery-submissions.controller';
import { DeliverySubmissionsService } from './delivery-submissions.service';

@Module({
  imports: [TypeOrmModule.forFeature([DeliverySubmission])],
  controllers: [DeliverySubmissionsController],
  providers: [DeliverySubmissionsService],
})
export class DeliverySubmissionsModule {}
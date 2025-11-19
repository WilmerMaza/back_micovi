import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from 'src/infrastructure/auth/auth.module';
import { PersistenceModule } from 'src/infrastructure/persistence/persistence.module';
import { PlanController } from 'src/interfaces/rest/billing/controllers/plan.controller';
import { SubscriptionController } from 'src/interfaces/rest/billing/controllers/subscription.controller';
import { CreatePlanHandler } from 'src/application/billing/plans/handlers/create-plan.handler';
import { UpdatePlanHandler } from 'src/application/billing/plans/handlers/update-plan.handler';
import { DeletePlanHandler } from 'src/application/billing/plans/handlers/delete-plan.handler';
import { ListPlansHandler } from 'src/application/billing/plans/handlers/list-plans.handler';
import { GetPlanHandler } from 'src/application/billing/plans/handlers/get-plan.handler';
import { AssignPlanToSchoolHandler } from 'src/application/billing/subscriptions/handlers/assign-plan-to-school.handler';
import { CancelSubscriptionHandler } from 'src/application/billing/subscriptions/handlers/cancel-subscription.handler';
import { GetCurrentSubscriptionHandler } from 'src/application/billing/subscriptions/handlers/get-current-subscription.handler';
import { ListSubscriptionsHandler } from 'src/application/billing/subscriptions/handlers/list-subscriptions.handler';
import { GetPlanStatusHandler } from 'src/application/billing/subscriptions/handlers/get-plan-status.handler';

const commandHandlers = [
  CreatePlanHandler,
  UpdatePlanHandler,
  DeletePlanHandler,
  AssignPlanToSchoolHandler,
  CancelSubscriptionHandler,
];
const queryHandlers = [
  ListPlansHandler,
  GetPlanHandler,
  GetCurrentSubscriptionHandler,
  ListSubscriptionsHandler,
  GetPlanStatusHandler,
];

@Module({
  imports: [CqrsModule, PersistenceModule, AuthModule],
  controllers: [PlanController, SubscriptionController],
  providers: [...commandHandlers, ...queryHandlers],
})
export class BillingModule {}

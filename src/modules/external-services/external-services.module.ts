import { Global, Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';

@Global()
@Module({
  imports: [EmailModule],
  exports: [EmailModule],
})
export class ExternalServicesModule {}

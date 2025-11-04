import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from './core/config/configuration.module';

@Module({
  imports: [ConfigurationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

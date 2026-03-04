import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AppController],
})
export class AppModule {}

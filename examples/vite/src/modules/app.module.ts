import { Module } from '@abdokouta/ts-container';
import { LoggerModule } from '@abdokouta/react-logger';
import loggerConfig from '@/config/logger.config';

@Module({
  imports: [
    LoggerModule.forRoot(loggerConfig),
  ],
  providers: [],
  exports: [],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { LogViewService } from './log-view.service';
import { LogViewController } from './log-view.controller';

@Module({
  controllers: [LogViewController],
  providers: [LogViewService],
  exports: [LogViewService],
})
export class LogViewModule {}

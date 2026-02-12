import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from 'src/entities/Event';
import { User } from 'src/entities/User';

@Module({
  imports:[TypeOrmModule.forFeature([Event,User])],
  controllers: [EventController],
  providers: [EventService]
})
export class EventModule {}

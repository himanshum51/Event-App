import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Event } from 'src/entities/Event';
import { User } from 'src/entities/User';
import { EventOwnerGuard } from 'src/guards/event-owner.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, User]),
    JwtModule.register({
      secret: 'mySecretKey',  // Same secret as user.module.ts
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [EventController],
  providers: [EventService, EventOwnerGuard, JwtAuthGuard]
})
export class EventModule { }

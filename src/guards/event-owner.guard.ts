import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/Event';

@Injectable()
export class EventOwnerGuard implements CanActivate {
    constructor(
        @InjectRepository(Event)
        private eventRepository: Repository<Event>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user; 
        const eventId = parseInt(request.params.id);

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        if (!eventId) {
            throw new ForbiddenException('Event ID not provided');
        }

        // Find the event with its creator
        const event = await this.eventRepository.findOne({
            where: { id: eventId },
            relations: ['createdBy'],
        });

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        // Check if the authenticated user is the creator
        if (event.createdBy.id !== user.id && event.createdBy.id !== user.userId) {
            throw new ForbiddenException(
                'You do not have permission to modify this event',
            );
        }

        return true;
    }
}

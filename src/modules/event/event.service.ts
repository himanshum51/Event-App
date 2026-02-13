import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../entities/Event';
import { User } from '../../entities/User';
import { CreateEventDto } from '../../DTOs/Event/create-event.dto';
import { UpdateEventDto } from '../../DTOs/Event/update-event.dto';

@Injectable()
export class EventService {
    constructor(
        @InjectRepository(Event)
        private eventRepository: Repository<Event>,

        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    // CREATE - Only authenticated users can create events
    async create(createEventDto: CreateEventDto, user: any) {
        const userId = user.id || user.userId;

        const userEntity = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!userEntity) {
            throw new NotFoundException('User not found');
        }

        const event = this.eventRepository.create({
            ...createEventDto,
            createdBy: userEntity,
        });

        return await this.eventRepository.save(event);
    }

    // FIND ALL - Anyone can list all events (public listing)
    async findAll() {
        return await this.eventRepository.find({
            relations: ['createdBy'],
            select: {
                id: true,
                name: true,
                description: true,
                start_time: true,
                end_time: true,
                start_date: true,
                end_date: true,
                participents_needed: true,
                location: true,
                createdAt: true,
                updatedAt: true,
                createdBy: {
                    id: true,
                    username: true,
                    firstname: true,
                    lastname: true,
                }
            }
        });
    }

    // FIND ONE - Anyone can view, but only creator sees full details
    async findOne(id: number, user?: any) {
        const event = await this.eventRepository.findOne({
            where: { id },
            relations: ['createdBy'],
        });

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        const userId = user?.id || user?.userId;
        const isOwner = userId && event.createdBy.id === userId;

        if (isOwner) {
            return event;
        } else {
            return {
                id: event.id,
                name: event.name,
                description: event.description,
                start_time: event.start_time,
                end_time: event.end_time,
                start_date: event.start_date,
                end_date: event.end_date,
                participents_needed: event.participents_needed,
                location: event.location,
                createdAt: event.createdAt,
                createdBy: {
                    id: event.createdBy.id,
                    username: event.createdBy.username,
                    firstname: event.createdBy.firstname,
                    lastname: event.createdBy.lastname,
                }
            };
        }
    }

    // UPDATE - Only the creator can update their event
    async update(id: number, updateEventDto: UpdateEventDto, user: any) {
        const userId = user.id || user.userId;

        const event = await this.eventRepository.findOne({
            where: { id },
            relations: ['createdBy'],
        });

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        if (event.createdBy.id !== userId) {
            throw new ForbiddenException('You can only update your own events');
        }

        Object.assign(event, updateEventDto);

        return await this.eventRepository.save(event);
    }

    // DELETE - Only the creator can delete their event
    async remove(id: number, user: any) {
        const userId = user.id || user.userId;

        const event = await this.eventRepository.findOne({
            where: { id },
            relations: ['createdBy'],
        });

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        if (event.createdBy.id !== userId) {
            throw new ForbiddenException('You can only delete your own events');
        }

        await this.eventRepository.remove(event);

        return { message: 'Event deleted successfully' };
    }
}


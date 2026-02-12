import { Injectable, NotFoundException } from '@nestjs/common';
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

    // CREATE
    async create(createEventDto: CreateEventDto) {
        const user = await this.userRepository.findOne({
            where: { id: createEventDto.createdBy },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const event = this.eventRepository.create({
            ...createEventDto,
            createdBy: user,
        });

        return await this.eventRepository.save(event);
    }

    // FIND ALL
    async findAll() {
        return await this.eventRepository.find({
            relations: ['createdBy'],
        });
    }

    // FIND ONE
    async findOne(id: number) {
        const event = await this.eventRepository.findOne({
            where: { id },
            relations: ['createdBy'],
        });

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        return event;
    }

    // UPDATE
    async update(id: number, updateEventDto: UpdateEventDto) {
        const event = await this.findOne(id);

        Object.assign(event, updateEventDto);

        return await this.eventRepository.save(event);
    }

    // DELETE
    async remove(id: number) {
        const event = await this.findOne(id);

        await this.eventRepository.remove(event);

        return { message: 'Event deleted successfully' };
    }
}

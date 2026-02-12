    import {
        Controller,
        Get,
        Post,
        Body,
        Param,
        Delete,
        Put,
        ParseIntPipe,
        UseGuards,
    } from '@nestjs/common';
    import { EventService } from './event.service';
    import { CreateEventDto } from '../../DTOs/Event/create-event.dto';
    import { UpdateEventDto } from '../../DTOs/Event/update-event.dto';
    import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
    import { EventOwnerGuard } from '../../guards/event-owner.guard';
    import { CurrentUser } from '../../decorators/current-user.decorator';

    @Controller('events')
    export class EventController {
        constructor(private readonly eventService: EventService) { }

        // Only authenticated users can create events
        @Post()
        @UseGuards(JwtAuthGuard)
        create(
            @Body() createEventDto: CreateEventDto,
            @CurrentUser() user: any,
        ) {
            return this.eventService.create(createEventDto, user);
        }

        // Anyone can list all events
        @Get()
        findAll() {
            return this.eventService.findAll();
        }

        // Get specific event - only creator can see full details
        @Get(':id')
        findOne(
            @Param('id', ParseIntPipe) id: number,
            @CurrentUser() user?: any,
        ) {
            return this.eventService.findOne(id, user);
        }

        // Only the creator can update their event
        @Put(':id')
        @UseGuards(JwtAuthGuard, EventOwnerGuard)
        update(
            @Param('id', ParseIntPipe) id: number,
            @Body() updateEventDto: UpdateEventDto,
            @CurrentUser() user: any,
        ) {
            return this.eventService.update(id, updateEventDto, user);
        }

        // Only the creator can delete their event
        @Delete(':id')
        @UseGuards(JwtAuthGuard, EventOwnerGuard)
        remove(
            @Param('id', ParseIntPipe) id: number,
            @CurrentUser() user: any,
        ) {
            return this.eventService.remove(id, user);
        }
    }

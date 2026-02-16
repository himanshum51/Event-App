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
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { EventService } from './event.service';
import { CreateEventDto } from '../../DTOs/Event/create-event.dto';
import { UpdateEventDto } from '../../DTOs/Event/update-event.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { EventOwnerGuard } from '../../guards/event-owner.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { multerStorage, imageFileFilter, documentFileFilter } from '../../utils/file-upload.helper';

@Controller('events')
export class EventController {
    constructor(private readonly eventService: EventService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'image', maxCount: 1 },
            { name: 'files', maxCount: 10 },
        ], {
            storage: multerStorage,
            fileFilter: (req: any, file: any, callback: any) => {
                if (file.fieldname === 'image') {
                    return imageFileFilter(req, file, callback);
                }
                return documentFileFilter(req, file, callback);
            },
            limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
        }),
    )
    create(
        @Body() createEventDto: CreateEventDto,
        @CurrentUser() user: any,
        @UploadedFiles() files?: { image?: Express.Multer.File[], files?: Express.Multer.File[] },
    ) {
        return this.eventService.create(createEventDto, user, files);
    }

    @Get()
    findAll() {
        return this.eventService.findAll();
    }

    @Get(':id')
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user?: any,
    ) {
        return this.eventService.findOne(id, user);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, EventOwnerGuard)
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'image', maxCount: 1 },
            { name: 'files', maxCount: 10 },
        ], {
            storage: multerStorage,
            fileFilter: (req: any, file: any, callback: any) => {
                if (file.fieldname === 'image') {
                    return imageFileFilter(req, file, callback);
                }
                return documentFileFilter(req, file, callback);
            },
            limits: { fileSize: 10 * 1024 * 1024 },
        }),
    )
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateEventDto: UpdateEventDto,
        @CurrentUser() user: any,
        @UploadedFiles() files?: { image?: Express.Multer.File[], files?: Express.Multer.File[] },
    ) {
        return this.eventService.update(id, updateEventDto, user, files);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, EventOwnerGuard)
    remove(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: any,
    ) {
        return this.eventService.remove(id, user);
    }
}

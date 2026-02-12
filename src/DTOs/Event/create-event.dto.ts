import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    description: string;

    @IsDateString()
    start_date: Date;

    @IsDateString()
    end_date: Date;

    @IsString()
    start_time: string;

    @IsString()
    end_time: string;

    @IsInt()
    participents_needed: number;

    // createdBy is removed - it will be set from authenticated user
}

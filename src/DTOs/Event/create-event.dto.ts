import { IsDateString, IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    description: string;

    @IsDateString()
    start_date: string; 

    @IsDateString()
    end_date: string;   

    @IsString()
    start_time: string;

    @IsString()
    end_time: string;

    @Type(() => Number)
    @IsInt()
    participents_needed: number;

    @IsString()
    @IsNotEmpty()
    location: string;

    @IsOptional()
    image?: any;

    @IsOptional()
    files?: any;
}

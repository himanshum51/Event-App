import { IsEmail, IsNumber, IsString, Min, MinLength } from "class-validator";

export class CreateUserDto {
    @IsString()
    username: string;

    @IsString()
    firstname: string;

    @IsString()
    lastname: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsNumber()
    @Min(0)
    age: number;

}
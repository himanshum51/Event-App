import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from 'src/DTOs/User/CreateUser.dto';
import { UserService } from './user.service';
import { LoginUserDto } from 'src/DTOs/User/LoginUser.dto';

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) { }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        return this.userService.userRegister(createUserDto)
    }

    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto) {
        return this.userService.userLogin(loginUserDto)
    }

}

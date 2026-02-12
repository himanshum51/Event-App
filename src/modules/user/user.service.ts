import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/DTOs/User/CreateUser.dto';
import { LoginUserDto } from 'src/DTOs/User/LoginUser.dto';
import { User } from 'src/entities/User';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private jwtService: JwtService,

    ) { }

    async userRegister(createUserDto: CreateUserDto) {
        const newUser = this.userRepository.create(createUserDto)
        return this.userRepository.save(newUser)
    }

    async userLogin(loginUserDto: LoginUserDto) {

        const { email, password } = loginUserDto;
        const user = await this.userRepository.findOne({ where: { email } })

        if (!user) {
            throw new UnauthorizedException("User is not Registred")
        }

        if (user.password != password) {
            throw new UnauthorizedException("Password is Wrong")
        }

        // Payload
        const payload = {
            sub: user.id,
            email: user.email,
        };

        // Generate token
        const accessToken = this.jwtService.sign(payload);

        return {
            message: 'Login successful',
            access_token: accessToken,

        }
    }
}
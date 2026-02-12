import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/User';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: 'mySecretKey',  
      signOptions: { expiresIn: '1h' },
    }),
  ],

  providers: [UserService],
  controllers: [UserController]
})
export class UserModule { }

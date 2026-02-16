import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { User } from 'src/entities/User';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(
      getRepositoryToken(User),
    );
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('userRegister', () => {
    it('should create and save a new user', async () => {
      const dto = {
        name: 'John',
        email: 'john@test.com',
        password: '123456',
      };

      const createdUser = { id: 1, ...dto };

      mockUserRepository.create.mockReturnValue(dto);
      mockUserRepository.save.mockResolvedValue(createdUser);

      const result = await service.userRegister(dto as any);

      expect(userRepository.create).toHaveBeenCalledWith(dto);
      expect(userRepository.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual(createdUser);
    });
  });

  describe('userLogin', () => {
    it('should login successfully and return token', async () => {
      const dto = {
        email: 'john@test.com',
        password: '123456',
      };

      const user = {
        id: 1,
        email: 'john@test.com',
        password: '123456',
      };

      const fakeToken = 'fake-jwt-token';

      mockUserRepository.findOne.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue(fakeToken);

      const result = await service.userLogin(dto as any);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: dto.email },
      });

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });

      expect(result).toEqual({
        message: 'Login successful',
        access_token: fakeToken,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const dto = {
        email: 'notfound@test.com',
        password: '123456',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.userLogin(dto as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      const dto = {
        email: 'john@test.com',
        password: 'wrongpassword',
      };

      const user = {
        id: 1,
        email: 'john@test.com',
        password: '123456',
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      await expect(service.userLogin(dto as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

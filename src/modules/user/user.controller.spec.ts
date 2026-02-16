import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
    let controller: UserController;
    let service: UserService;

    const mockUserService = {
        userRegister: jest.fn(),
        userLogin: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
        service = module.get<UserService>(UserService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a user successfully', async () => {
            const dto = {
                name: 'John',
                email: 'john@test.com',
                password: '123456',
            };

            const expectedResult = {
                id: 1,
                ...dto,
            };

            mockUserService.userRegister.mockResolvedValue(expectedResult);

            const result = await controller.register(dto as any);

            expect(service.userRegister).toHaveBeenCalledWith(dto);
            expect(service.userRegister).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expectedResult);
        });

        it('should throw error if registration fails', async () => {
            const dto = {
                name: 'John',
                email: 'john@test.com',
                password: '123456',
            };

            mockUserService.userRegister.mockRejectedValue(
                new Error('User already exists'),
            );

            await expect(controller.register(dto as any)).rejects.toThrow(
                'User already exists',
            );
        });
    });

    describe('login', () => {
        it('should login user successfully', async () => {
            const dto = {
                email: 'john@test.com',
                password: '123456',
            };

            const expectedResult = {
                accessToken: 'fake-jwt-token',
            };

            mockUserService.userLogin.mockResolvedValue(expectedResult);

            const result = await controller.login(dto as any);

            expect(service.userLogin).toHaveBeenCalledWith(dto);
            expect(service.userLogin).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expectedResult);
        });

        it('should throw error if login fails', async () => {
            const dto = {
                email: 'wrong@test.com',
                password: 'wrongpassword',
            };

            mockUserService.userLogin.mockRejectedValue(
                new Error('Invalid credentials'),
            );

            await expect(controller.login(dto as any)).rejects.toThrow(
                'Invalid credentials',
            );
        });
    });
});

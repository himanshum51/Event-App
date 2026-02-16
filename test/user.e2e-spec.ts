import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, CanActivate, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { ThrottlerGuard } from '@nestjs/throttler';

// Load test environment variables BEFORE anything else with override
dotenv.config({ path: path.resolve(__dirname, '../.env.test'), override: true });

// Mock guard that always allows requests (disables throttling)
class MockThrottlerGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        return true;
    }
}

describe('User Module (e2e)', () => {
    let app: INestApplication;
    const timestamp = Date.now();
    const testUser = {
        username: `johndoe${timestamp}`,
        firstname: 'John',
        lastname: 'Doe',
        email: `john${timestamp}@test.com`,
        password: '123456',
        age: 25,
        mobile_number: '1234567890',
    };

    beforeAll(async () => {
        // Verify test environment variables are loaded
        console.log('Using database:', process.env.DB_NAME);

        const moduleFixture: TestingModule =
            await Test.createTestingModule({
                imports: [AppModule],
            })
                .overrideGuard(ThrottlerGuard)
                .useClass(MockThrottlerGuard)
                .compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        // Verify we're connected to the test database
        const dataSource = app.get(DataSource);
        const result = await dataSource.query('SELECT current_database()');
        console.log('Connected to database:', result[0].current_database);

        if (result[0].current_database !== 'event_app_test') {
            throw new Error(`Expected to connect to event_app_test but connected to ${result[0].current_database}`);
        }
    });

    afterAll(async () => {
        const dataSource = app.get(DataSource);
        await dataSource.destroy();   
        await app.close();
    });

    // REGISTER TEST

    it('should register a user (POST /user/register)', async () => {
        const response = await request(app.getHttpServer())
            .post('/user/register')
            .send(testUser)
            .expect(201);

        expect(response.body.email).toBe(testUser.email);
        expect(response.body.id).toBeDefined();
    });

    // LOGIN SUCCESS

    it('should login successfully (POST /user/login)', async () => {
        const response = await request(app.getHttpServer())
            .post('/user/login')
            .send({
                email: testUser.email,
                password: testUser.password,
            })
            .expect(201);

        expect(response.body.access_token).toBeDefined();
        expect(response.body.message).toBe('Login successful');
    });

    // LOGIN FAIL - USER NOT FOUND

    it('should fail if user does not exist', async () => {
        await request(app.getHttpServer())
            .post('/user/login')
            .send({
                email: 'notfound@test.com',
                password: '123456',
            })
            .expect(401);
    });

    // LOGIN FAIL - WRONG PASSWORD

    it('should fail if password is incorrect', async () => {
        await request(app.getHttpServer())
            .post('/user/login')
            .send({
                email: testUser.email,
                password: 'wrongpassword',
            })
            .expect(401);
    });
});

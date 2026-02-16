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

describe('Event Module (e2e)', () => {
    let app: INestApplication;
    let accessToken: string;
    let userId: number;
    let eventId: number;
    const timestamp = Date.now();

    const testUser = {
        username: `eventuser${timestamp}`,
        firstname: 'Event',
        lastname: 'Tester',
        email: `eventuser${timestamp}@test.com`,
        password: '123456',
        age: 30,
        mobile_number: '9876543210',
    };

    const testEvent = {
        name: 'Test Conference 2026',
        description: 'Annual tech conference for developers',
        start_date: '2026-12-15',
        end_date: '2026-12-17',
        start_time: '09:00:00',
        end_time: '18:00:00',
        participents_needed: 100,
        location: 'Convention Center, Mumbai',
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

        // Register and login user for authenticated tests
        const registerResponse = await request(app.getHttpServer())
            .post('/user/register')
            .send(testUser);

        userId = registerResponse.body.id;

        const loginResponse = await request(app.getHttpServer())
            .post('/user/login')
            .send({
                email: testUser.email,
                password: testUser.password,
            });

        accessToken = loginResponse.body.access_token;
    });

    afterAll(async () => {
        await app.close();
    });

    // CREATE EVENT - SUCCESS

    it('should create an event when authenticated (POST /events)', async () => {
        const response = await request(app.getHttpServer())
            .post('/events')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(testEvent)
            .expect(201);

        expect(response.body.name).toBe(testEvent.name);
        expect(response.body.location).toBe(testEvent.location);
        expect(response.body.id).toBeDefined();
        eventId = response.body.id;
    });

    // CREATE EVENT - FAIL (Unauthenticated)

    it('should fail to create event without authentication (POST /events)', async () => {
        await request(app.getHttpServer())
            .post('/events')
            .send(testEvent)
            .expect(401);
    });

    // GET ALL EVENTS - SUCCESS

    it('should get all events without authentication (GET /events)', async () => {
        const response = await request(app.getHttpServer())
            .get('/events')
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    // GET SINGLE EVENT - SUCCESS

    it('should get a single event by id (GET /events/:id)', async () => {
        const response = await request(app.getHttpServer())
            .get(`/events/${eventId}`)
            .expect(200);

        expect(response.body.id).toBe(eventId);
        expect(response.body.name).toBe(testEvent.name);
    });

    // UPDATE EVENT - SUCCESS (Owner)

    it('should update event when owner is authenticated (PUT /events/:id)', async () => {
        const updateData = {
            name: 'Updated Conference Name',
            participents_needed: 150,
        };

        const response = await request(app.getHttpServer())
            .put(`/events/${eventId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(updateData)
            .expect(200);

        expect(response.body.name).toBe(updateData.name);
        expect(response.body.participents_needed).toBe(updateData.participents_needed);
    });

    // UPDATE EVENT - FAIL (Unauthenticated)

    it('should fail to update event without authentication (PUT /events/:id)', async () => {
        await request(app.getHttpServer())
            .put(`/events/${eventId}`)
            .send({ name: 'Unauthorized Update' })
            .expect(401);
    });

    // UPDATE EVENT - FAIL (Non-owner)

    it('should fail to update event when not the owner (PUT /events/:id)', async () => {
        // Create another user
        const anotherUser = {
            username: `another${timestamp}`,
            firstname: 'Another',
            lastname: 'User',
            email: `another${timestamp}@test.com`,
            password: '123456',
            age: 25,
            mobile_number: '1231231234',
        };

        await request(app.getHttpServer())
            .post('/user/register')
            .send(anotherUser);

        const loginResponse = await request(app.getHttpServer())
            .post('/user/login')
            .send({
                email: anotherUser.email,
                password: anotherUser.password,
            });

        const anotherToken = loginResponse.body.access_token;

        await request(app.getHttpServer())
            .put(`/events/${eventId}`)
            .set('Authorization', `Bearer ${anotherToken}`)
            .send({ name: 'Unauthorized Update' })
            .expect(403);
    });

    // DELETE EVENT - FAIL (Unauthenticated)

    it('should fail to delete event without authentication (DELETE /events/:id)', async () => {
        await request(app.getHttpServer())
            .delete(`/events/${eventId}`)
            .expect(401);
    });

    // DELETE EVENT - SUCCESS (Owner)

    it('should delete event when owner is authenticated (DELETE /events/:id)', async () => {
        await request(app.getHttpServer())
            .delete(`/events/${eventId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        // Verify event is deleted
        await request(app.getHttpServer())
            .get(`/events/${eventId}`)
            .expect(404);
    });
});

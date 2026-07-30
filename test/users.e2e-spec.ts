/**
 * Users Module E2E Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Users Module E2E Tests', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let authToken: string;
  let userId: number;
  let userIdForDeletion: number;
  let deleteUserToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);

    // Setup: Register and login a user for auth
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Test User',
        email: 'test.user@example.com',
        password: 'password123',
      });
    userId = registerResponse.body.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test.user@example.com',
        password: 'password123',
      });
    authToken = loginResponse.body.access_token;

    // Create a separate user for deletion tests
    const deleteResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Delete Test User',
        email: 'delete.user@example.com',
        password: 'password123',
      });
    userIdForDeletion = deleteResponse.body.id;

    const deleteLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'delete.user@example.com',
        password: 'password123',
      });
    deleteUserToken = deleteLoginResponse.body.access_token;
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await app.close();
  });

  describe('GET /users', () => {
    it('should return all users', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
        });
    });

    it('should reject unauthorized request', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(401);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('id', userId);
          expect(response.body).toHaveProperty('email', 'test.user@example.com');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/9999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user', () => {
      return request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('message', 'User updated successfully');
          expect(response.body).toHaveProperty('data');
        });
    });

    it('should return 404 when updating non-existent user', () => {
      return request(app.getHttpServer())
        .patch('/users/9999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
        })
        .expect(404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userIdForDeletion}`)
        .set('Authorization', `Bearer ${deleteUserToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('message', 'User removed successfully');
          expect(response.body).toHaveProperty('data');
        });
    });

    it('should return 404 when deleting non-existent user', () => {
      return request(app.getHttpServer())
        .delete('/users/9999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});

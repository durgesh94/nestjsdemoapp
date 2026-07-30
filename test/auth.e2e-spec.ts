/**
 * Auth Module E2E Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Auth Module E2E Tests', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'John Doe',
          email: 'john.doe@example.com',
          password: 'password123',
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('name', 'John Doe');
          expect(response.body).toHaveProperty('email', 'john.doe@example.com');
          userId = response.body.id;
        });
    });

    it('should reject duplicate email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'john.doe@example.com',
          password: 'password123',
        })
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully and return access token', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'password123',
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('access_token');
          authToken = response.body.access_token;
        });
    });

    it('should reject invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should reject invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });
});

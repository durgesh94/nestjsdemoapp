/**
 * Application Health Check E2E Test
 * This file serves as the main E2E test entry point and checks basic app health.
 * Module-specific E2E tests are organized in separate files:
 * - auth.e2e-spec.ts - Authentication module tests
 * - users.e2e-spec.ts - Users module tests
 * - products.e2e-spec.ts - Products module tests
 * - orders.e2e-spec.ts - Orders module tests
 * - integration.e2e-spec.ts - Cross-module integration tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('App Health Check', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

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

  it('GET / - should return success message', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Nest application successfully started!');
  });
});

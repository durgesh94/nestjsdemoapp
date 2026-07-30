/**
 * Common utilities and setup for E2E tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

export interface E2ETestContext {
  app: INestApplication<App>;
  dataSource: DataSource;
  authToken: string;
  userId: number;
  productId: number;
  orderId: number;
}

/**
 * Initialize the test application and database
 */
export async function initializeApp(): Promise<{
  app: INestApplication<App>;
  dataSource: DataSource;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  const dataSource = app.get(DataSource);

  return { app, dataSource };
}

/**
 * Clean up and close the application
 */
export async function cleanupApp(
  app: INestApplication<App>,
  dataSource: DataSource,
): Promise<void> {
  try {
    await dataSource.dropDatabase();
  } catch (error) {
    console.warn('Database cleanup warning:', error);
  }
  await app.close();
}

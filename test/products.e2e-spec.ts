/**
 * Products Module E2E Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Products Module E2E Tests', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let authToken: string;
  let productId: number;

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
        name: 'Product Test User',
        email: 'product.test@example.com',
        password: 'password123',
      });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'product.test@example.com',
        password: 'password123',
      });
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await app.close();
  });

  describe('POST /products', () => {
    it('should create a product', () => {
      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Product',
          description: 'This is a test product',
          price: 99.99,
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('name', 'Test Product');
          expect(response.body).toHaveProperty('price', 99.99);
          productId = response.body.id;
        });
    });
  });

  describe('GET /products', () => {
    it('should return all products', () => {
      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
        });
    });

    it('should return empty array when no products exist', () => {
      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
        });
    });
  });

  describe('GET /products/:id', () => {
    it('should return a product by id', () => {
      return request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('id', productId);
          expect(response.body).toHaveProperty('name', 'Test Product');
        });
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer()).get('/products/9999').expect(404);
    });
  });

  describe('PATCH /products/:id', () => {
    it('should update a product', () => {
      return request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Product',
          price: 149.99,
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('name', 'Updated Product');
          expect(response.body).toHaveProperty('price', 149.99);
        });
    });

    it('should return 404 when updating non-existent product', () => {
      return request(app.getHttpServer())
        .patch('/products/9999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Product',
        })
        .expect(404);
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete a product', () => {
      return request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('id', productId);
        });
    });

    it('should return 404 when deleting non-existent product', () => {
      return request(app.getHttpServer())
        .delete('/products/9999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});

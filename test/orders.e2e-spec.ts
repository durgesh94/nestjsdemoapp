/**
 * Orders Module E2E Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Orders Module E2E Tests', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let authToken: string;
  let userId: number;
  let productId: number;
  let orderId: number;
  let orderForDeletion: number;

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
        name: 'Order Test User',
        email: 'order.test@example.com',
        password: 'password123',
      });
    userId = registerResponse.body.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'order.test@example.com',
        password: 'password123',
      });
    authToken = loginResponse.body.access_token;

    // Create a product for orders
    const productResponse = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Product',
        description: 'Test product for orders',
        price: 99.99,
      });
    productId = productResponse.body.id;
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await app.close();
  });

  describe('POST /orders', () => {
    it('should create an order', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: userId,
          items: [
            {
              productId: productId,
              quantity: 2,
            },
          ],
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('userId', userId);
          expect(response.body).toHaveProperty('totalAmount');
          expect(response.body.items).toHaveLength(1);
          orderId = response.body.id;
        });
    });

    it('should create another order for deletion test', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: userId,
          items: [
            {
              productId: productId,
              quantity: 1,
            },
          ],
        })
        .expect(201)
        .then((response) => {
          orderForDeletion = response.body.id;
        });
    });

    it('should reject order with non-existent product', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: userId,
          items: [
            {
              productId: 9999,
              quantity: 1,
            },
          ],
        })
        .expect(404);
    });
  });

  describe('GET /orders', () => {
    it('should return all orders', () => {
      return request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /orders/:id', () => {
    it('should return an order by id', () => {
      return request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('id', orderId);
          expect(response.body).toHaveProperty('userId', userId);
        });
    });

    it('should return 404 for non-existent order', () => {
      return request(app.getHttpServer())
        .get('/orders/9999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /orders/:id', () => {
    it('should update an order', () => {
      return request(app.getHttpServer())
        .patch(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: userId,
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('userId', userId);
        });
    });

    it('should reject update of non-existent order', () => {
      return request(app.getHttpServer())
        .patch('/orders/9999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: userId,
        })
        .expect(404);
    });
  });

  describe('PATCH /orders/:id/status', () => {
    it('should update order status to CONFIRMED', () => {
      return request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'CONFIRMED',
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('status', 'CONFIRMED');
        });
    });

    it('should update order status to SHIPPED', () => {
      return request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'SHIPPED',
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('status', 'SHIPPED');
        });
    });

    it('should update order status to DELIVERED', () => {
      return request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'DELIVERED',
        })
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('status', 'DELIVERED');
        });
    });
  });

  describe('DELETE /orders/:id', () => {
    it('should delete an order', () => {
      return request(app.getHttpServer())
        .delete(`/orders/${orderForDeletion}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('id', orderForDeletion);
        });
    });

    it('should return 404 when deleting non-existent order', () => {
      return request(app.getHttpServer())
        .delete('/orders/9999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});

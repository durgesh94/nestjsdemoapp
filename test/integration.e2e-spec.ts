/**
 * Integration E2E Tests
 * Tests complete workflows across multiple modules
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Integration E2E Tests', () => {
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

  describe('Complete User → Product → Order Workflow', () => {
    it('should complete a full application workflow', async () => {
      // 1. Register a new user
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Integration Test User',
          email: 'integration@example.com',
          password: 'password123',
        });

      expect(registerResponse.status).toBe(201);
      const testUserId = registerResponse.body.id;

      // 2. Login with the new user
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'integration@example.com',
          password: 'password123',
        });

      expect(loginResponse.status).toBe(200);
      const testToken = loginResponse.body.access_token;

      // 3. Create a product
      const productResponse = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Integration Product',
          description: 'Test product for integration workflow',
          price: 199.99,
        });

      expect(productResponse.status).toBe(201);
      const testProductId = productResponse.body.id;

      // 4. Retrieve the created product
      const getProductResponse = await request(app.getHttpServer())
        .get(`/products/${testProductId}`);

      expect(getProductResponse.status).toBe(200);
      expect(getProductResponse.body).toHaveProperty('id', testProductId);
      expect(getProductResponse.body).toHaveProperty('name', 'Integration Product');

      // 5. Create an order with the product
      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          userId: testUserId,
          items: [
            {
              productId: testProductId,
              quantity: 2,
            },
          ],
        });

      expect(orderResponse.status).toBe(201);
      const testOrderId = orderResponse.body.id;
      expect(orderResponse.body).toHaveProperty('totalAmount', 399.98);

      // 6. Retrieve the created order
      const getOrderResponse = await request(app.getHttpServer())
        .get(`/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(getOrderResponse.status).toBe(200);
      expect(getOrderResponse.body).toHaveProperty('id', testOrderId);
      expect(getOrderResponse.body).toHaveProperty('userId', testUserId);

      // 7. Update order status through workflow
      const confirmResponse = await request(app.getHttpServer())
        .patch(`/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          status: 'CONFIRMED',
        });

      expect(confirmResponse.status).toBe(200);
      expect(confirmResponse.body).toHaveProperty('status', 'CONFIRMED');

      // 8. Update to shipped
      const shippedResponse = await request(app.getHttpServer())
        .patch(`/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          status: 'SHIPPED',
        });

      expect(shippedResponse.status).toBe(200);
      expect(shippedResponse.body).toHaveProperty('status', 'SHIPPED');

      // 9. Update to delivered
      const deliveredResponse = await request(app.getHttpServer())
        .patch(`/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          status: 'DELIVERED',
        });

      expect(deliveredResponse.status).toBe(200);
      expect(deliveredResponse.body).toHaveProperty('status', 'DELIVERED');

      // 10. Verify final state
      const finalOrderResponse = await request(app.getHttpServer())
        .get(`/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(finalOrderResponse.status).toBe(200);
      expect(finalOrderResponse.body).toHaveProperty('status', 'DELIVERED');
    });

    it('should allow user to view their profile after creating orders', async () => {
      // 1. Register a user
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Profile Test User',
          email: 'profile@example.com',
          password: 'password123',
        });

      const userId = registerResponse.body.id;

      // 2. Login
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'profile@example.com',
          password: 'password123',
        });

      const token = loginResponse.body.access_token;

      // 3. View user profile
      const profileResponse = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body).toHaveProperty('email', 'profile@example.com');
      expect(profileResponse.body).toHaveProperty('name', 'Profile Test User');
    });
  });
});

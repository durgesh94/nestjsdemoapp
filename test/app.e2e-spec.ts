import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

describe('Full Application E2E Tests', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let authToken: string;
  let userId: number;
  let productId: number;
  let orderId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    // Drop all tables to clean up the test database
    await dataSource.dropDatabase();
    await app.close();
  });

  // ==================== APP HEALTH ====================
  describe('App Health Check', () => {
    it('/ (GET) - should return success message', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Nest application successfully started!');
    });
  });

  // ==================== AUTH MODULE ====================
  describe('Auth Module', () => {
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

  // ==================== USERS MODULE ====================
  describe('Users Module', () => {
    let userIdForDeletion: number;
    let deleteUserToken: string;

    beforeAll(async () => {
      // Create a separate user just for deletion tests
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Delete Test User',
          email: 'delete.user@example.com',
          password: 'password123',
        });
      userIdForDeletion = response.body.id;

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'delete.user@example.com',
          password: 'password123',
        });
      deleteUserToken = loginResponse.body.access_token;
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
            expect(response.body).toHaveProperty('email', 'john.doe@example.com');
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
            name: 'John Smith',
          })
          .expect(200)
          .then((response) => {
            expect(response.body).toHaveProperty('message', 'User updated successfully');
            expect(response.body).toHaveProperty('data');
          });
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

  // ==================== PRODUCTS MODULE ====================
  describe('Products Module', () => {
    describe('POST /products', () => {
      it('should create a product', () => {
        return request(app.getHttpServer())
          .post('/products')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Test Product',
            description: 'This is a test product',
            price: 99.99,
            stock: 10,
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
        return request(app.getHttpServer())
          .get('/products/9999')
          .expect(404);
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
    });
  });

  // ==================== ORDERS MODULE ====================
  describe('Orders Module', () => {
    let newUserId: number;
    let testOrderId: number;
    let orderForDeletion: number;

    beforeAll(async () => {
      // Register a new user for orders
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Order User',
          email: 'order.user@example.com',
          password: 'password123',
        });
      newUserId = response.body.id;
    });

    describe('POST /orders', () => {
      it('should create an order', () => {
        return request(app.getHttpServer())
          .post('/orders')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            userId: newUserId,
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
            expect(response.body).toHaveProperty('userId', newUserId);
            expect(response.body).toHaveProperty('totalAmount');
            expect(response.body.items).toHaveLength(1);
            testOrderId = response.body.id;
            orderId = response.body.id;
          });
      });

      it('should create another order for deletion test', () => {
        return request(app.getHttpServer())
          .post('/orders')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            userId: newUserId,
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
            userId: newUserId,
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
          .get(`/orders/${testOrderId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .then((response) => {
            expect(response.body).toHaveProperty('id', testOrderId);
            expect(response.body).toHaveProperty('userId', newUserId);
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
          .patch(`/orders/${testOrderId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            userId: newUserId,
          })
          .expect(200)
          .then((response) => {
            expect(response.body).toHaveProperty('userId', newUserId);
          });
      });

      it('should reject update of non-existent order', () => {
        return request(app.getHttpServer())
          .patch('/orders/9999')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            userId: newUserId,
          })
          .expect(404);
      });
    });

    describe('PATCH /orders/:id/status', () => {
      it('should update order status to CONFIRMED', () => {
        return request(app.getHttpServer())
          .patch(`/orders/${testOrderId}/status`)
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
          .patch(`/orders/${testOrderId}/status`)
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
          .patch(`/orders/${testOrderId}/status`)
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

  // ==================== INTEGRATION TESTS ====================
  describe('Integration Tests', () => {
    it('should complete a full user and product workflow', async () => {
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

      // 2. Login the user
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
          description: 'Test product for integration',
          price: 199.99,
          stock: 5,
        });

      expect(productResponse.status).toBe(201);
      const testProductId = productResponse.body.id;

      // 4. Create an order with the product
      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          userId: testUserId,
          items: [
            {
              productId: testProductId,
              quantity: 1,
            },
          ],
        });

      expect(orderResponse.status).toBe(201);
      expect(orderResponse.body.totalAmount).toBe(199.99);

      // 5. Update order status
      const testOrderId = orderResponse.body.id;
      const statusResponse = await request(app.getHttpServer())
        .patch(`/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          status: 'CONFIRMED',
        });

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body.status).toBe('CONFIRMED');
    });
  });
});

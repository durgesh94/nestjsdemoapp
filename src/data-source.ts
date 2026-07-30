import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Product } from './products/entities/product.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/orderItem.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'durgesh.tambe',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nestjs_db',
  entities: [User, Product, Order, OrderItem],
  migrations: ['src/migrations/*.ts', 'dist/migrations/*.js'],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: false,
});

export default AppDataSource;

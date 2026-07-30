import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'durgesh.tambe',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'nestjs_db',
      autoLoadEntities: true, // Automatically load entities from all modules
      // Synchronize the database schema with the entities (use with caution in production)
      synchronize: true, // Set to true for development, false for production
      // drop the schema each time the application starts (useful for development)
      dropSchema: false, // Set to true for development, false for production
    }),
    UsersModule,
    ProductsModule,
    OrdersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

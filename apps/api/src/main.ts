import { NestFactory } from '@nestjs/core';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  // Run migrations after listening so Cloud Run startup probe succeeds even if DB is slow/unreachable
  const connectionString =
    process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/postgres';
  const db = drizzle(connectionString);
  migrate(db, { migrationsFolder: './drizzle' }).catch((err) => {
    console.error('Migration failed (server is up):', err);
  });
}
bootstrap();

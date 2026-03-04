import { Global, Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

export const DRIZZLE = 'DRIZZLE';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      useFactory: () => {
        const connectionString =
          process.env.DATABASE_URL ??
          'postgresql://postgres:postgres@localhost:5432/postgres';
        return drizzle(connectionString, { schema });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}

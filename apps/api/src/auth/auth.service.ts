import { Injectable, ConflictException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
  ) {}

  async register(dto: { name: string; surname: string; email: string; password: string }) {
    const existing = await this.db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, dto.email),
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    await this.db.insert(schema.users).values({
      name: dto.name,
      surname: dto.surname,
      email: dto.email,
      passwordHash,
    });
  }

  async login(email: string, password: string): Promise<{ id: number } | null> {
    const user = await this.db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return null;
    }
    return { id: user.id };
  }
}

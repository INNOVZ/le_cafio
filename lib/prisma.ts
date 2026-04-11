import { PrismaClient } from '@/lib/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

function createPrismaClient() {
  // Pass a PoolConfig directly — PrismaPg accepts `pg.Pool | pg.PoolConfig`
  // Using PoolConfig avoids the @types/pg version mismatch between the root
  // package and the bundled types inside @prisma/adapter-pg.
  const connectionString = `${process.env.DATABASE_URL}`.replace(
    'sslmode=require',
    'sslmode=no-verify'
  );

  const adapter = new PrismaPg({
    connectionString,
  });
  return new PrismaClient({ adapter });
}

function hasRestaurantLocationDelegate(client: PrismaClient) {
  return typeof (client as PrismaClient & { restaurantLocation?: unknown }).restaurantLocation !== 'undefined';
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const cachedPrisma = globalForPrisma.prisma;

export const prisma =
  cachedPrisma && hasRestaurantLocationDelegate(cachedPrisma)
    ? cachedPrisma
    : createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

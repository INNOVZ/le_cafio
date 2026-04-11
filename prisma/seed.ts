import { config as loadEnv } from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../lib/generated/prisma/client';

loadEnv({ path: '.env' });
loadEnv({ path: '.env.local', override: true });

function createPrismaClient() {
  const connectionString = `${process.env.DATABASE_URL}`.replace(
    'sslmode=require',
    'sslmode=no-verify'
  );

  const adapter = new PrismaPg({
    connectionString,
  });

  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main() {
  const locations = [
    {
      slug: 'cafio-adnec',
      name: 'CAFIO | ADNEC',
      phone: '+971558280105 ',
      line1: '36 Az Zumurrud St - Al Ma’arid Capital Centre - W59 01',
      city: 'Abu Dhabi',
      state: 'Abu Dhabi',
      postalCode: '',
      country: 'AE',
      latitude: '24.4178452712677',
      longitude: '54.442165413890734',
      deliveryRadiusKm: '10.00',
      isActive: true,
    },
    {
      slug: 'cafio-al-reem-island',
      name: 'CAFIO | Al Reem Island',
      phone: '+971565316002',
      line1: 'Al Reem Island',
      city: 'Abu Dhabi',
      state: 'Abu Dhabi',
      postalCode: '',
      country: 'AE',
      latitude: '24.48838442290973',
      longitude: '54.408778539462986',
      deliveryRadiusKm: '10.00',
      isActive: true,
    },
  ];

  for (const location of locations) {
    await prisma.restaurantLocation.upsert({
      where: { slug: location.slug },
      update: location,
      create: location,
    });
  }

  console.log(`Seeded ${locations.length} restaurant locations.`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

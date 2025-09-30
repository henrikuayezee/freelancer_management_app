/**
 * Database Seed Script
 * Creates initial data for development and testing
 * Run with: npm run db:seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ayadata.com' },
    update: {},
    create: {
      email: 'admin@ayadata.com',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
      adminProfile: {
        create: {
          firstName: 'System',
          lastName: 'Administrator',
          phone: '+233000000000',
          department: 'IT',
        },
      },
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create system configurations
  const configs = [
    {
      key: 'BASE_HOURLY_RATE',
      value: '8.50',
      description: 'Base hourly rate in GHC',
    },
    {
      key: 'MAX_ONBOARDING_ATTEMPTS',
      value: '3',
      description: 'Maximum attempts for onboarding tests',
    },
    {
      key: 'MAX_INTERVENTIONS',
      value: '3',
      description: 'Maximum performance interventions before deactivation',
    },
    {
      key: 'TIER_THRESHOLDS',
      value: JSON.stringify({
        PLATINUM: { minScore: 95, minHours: 500 },
        GOLD: { minScore: 90, minHours: 200 },
        SILVER: { minScore: 85, minHours: 100 },
        BRONZE: { minScore: 0, minHours: 0 },
      }),
      description: 'Performance thresholds for tier progression',
    },
  ];

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    });
  }

  console.log('✅ Created system configurations');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📝 Default credentials:');
  console.log('   Email: admin@ayadata.com');
  console.log('   Password: Admin@123');
  console.log('\n⚠️  IMPORTANT: Change this password immediately!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
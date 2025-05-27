import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';
import { seedCategories } from './categories.seed';

const prisma = new PrismaClient();

/**
 * Run all seeds
 */
async function main() {
  logger.info('Starting database seed...');

  // Run seeds in order
  await seedCategories();

  logger.info('Database seed completed successfully');
}

// Run the seed
main()
  .catch((error) => {
    logger.error('Error running seeds:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
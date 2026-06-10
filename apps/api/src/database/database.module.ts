import { Global, Module } from '@nestjs/common';
import { PrismaClient } from '@ci/database';

@Global()
@Module({
  providers: [
    {
      provide: 'PRISMA',
      useFactory: () => {
        const prisma = new PrismaClient({
          log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
        });
        prisma.$connect();
        return prisma;
      },
    },
  ],
  exports: ['PRISMA'],
})
export class DatabaseModule {}

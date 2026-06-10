import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@ci/database';

@Injectable()
export class CustomersService {
  constructor(@Inject('PRISMA') private prisma: PrismaClient) {}

  async getCustomers(slug: string, options: { page?: number; limit?: number } = {}) {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    if (!company) throw new NotFoundException();

    const { page = 1, limit = 20 } = options;

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where: { companyId: company.id },
        orderBy: { detectedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.customer.count({ where: { companyId: company.id } }),
    ]);

    return {
      data: customers,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async getPartnerships(slug: string, options: { page?: number; limit?: number } = {}) {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    if (!company) throw new NotFoundException();

    const { page = 1, limit = 20 } = options;

    const [partnerships, total] = await Promise.all([
      this.prisma.partnership.findMany({
        where: { companyId: company.id },
        orderBy: { detectedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.partnership.count({ where: { companyId: company.id } }),
    ]);

    return {
      data: partnerships,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async getGrowthChart(slug: string) {
    const company = await this.prisma.company.findUnique({ where: { slug } });
    if (!company) throw new NotFoundException();

    const weeks = [];
    for (let i = 11; i >= 0; i--) {
      const end = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
      const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [customers, partnerships] = await Promise.all([
        this.prisma.customer.count({
          where: { companyId: company.id, detectedAt: { gte: start, lt: end } },
        }),
        this.prisma.partnership.count({
          where: { companyId: company.id, detectedAt: { gte: start, lt: end } },
        }),
      ]);

      weeks.push({
        week: start.toISOString().split('T')[0],
        newCustomers: customers,
        newPartnerships: partnerships,
      });
    }

    return weeks;
  }
}

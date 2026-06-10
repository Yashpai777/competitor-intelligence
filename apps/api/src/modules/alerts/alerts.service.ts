import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@ci/database';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @Inject('PRISMA') private prisma: PrismaClient,
    private config: ConfigService,
  ) {
    if (config.get('features.emailAlerts')) {
      this.transporter = nodemailer.createTransport({
        host: config.get('email.host'),
        port: config.get('email.port'),
        auth: {
          user: config.get('email.user'),
          pass: config.get('email.pass'),
        },
      });
    }
  }

  async getAlerts(options: {
    companySlug?: string;
    severity?: string;
    isRead?: boolean;
    limit?: number;
    page?: number;
  } = {}) {
    const { companySlug, severity, isRead, limit = 20, page = 1 } = options;

    let companyId: string | undefined;
    if (companySlug) {
      const company = await this.prisma.company.findUnique({
        where: { slug: companySlug },
      });
      companyId = company?.id;
    }

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (severity) where.severity = severity;
    if (isRead !== undefined) where.isRead = isRead;

    const [alerts, total] = await Promise.all([
      this.prisma.alert.findMany({
        where,
        include: {
          company: { select: { name: true, slug: true, logo: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.alert.count({ where }),
    ]);

    return {
      data: alerts,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
      unreadCount: await this.prisma.alert.count({ where: { isRead: false } }),
    };
  }

  async markRead(alertId: string) {
    return this.prisma.alert.update({
      where: { id: alertId },
      data: { isRead: true },
    });
  }

  async markAllRead() {
    return this.prisma.alert.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
  }

  async createAlert(data: {
    companyId?: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    sourceUrl?: string;
    metadata?: any;
  }) {
    const alert = await this.prisma.alert.create({ data });

    if (
      this.config.get('features.emailAlerts') &&
      (data.severity === 'high' || data.severity === 'critical')
    ) {
      await this.sendEmailAlert(alert, data);
    }

    return alert;
  }

  private async sendEmailAlert(alert: any, data: any) {
    try {
      const company = data.companyId
        ? await this.prisma.company.findUnique({ where: { id: data.companyId } })
        : null;

      const severityColors: Record<string, string> = {
        low: '#6b7280',
        medium: '#f59e0b',
        high: '#ef4444',
        critical: '#dc2626',
      };

      await this.transporter.sendMail({
        from: this.config.get('email.from'),
        to: this.config.get('email.to'),
        subject: `[${data.severity.toUpperCase()}] Competitor Alert: ${data.title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0f172a; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 18px;">Competitor Intelligence Alert</h1>
            </div>
            <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <div style="display: inline-block; background: ${severityColors[data.severity] || '#6b7280'}; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-bottom: 16px;">
                ${data.severity.toUpperCase()}
              </div>
              <h2 style="color: #111827; margin: 0 0 8px;">${data.title}</h2>
              ${company ? `<p style="color: #6b7280; margin: 0 0 16px;">Competitor: <strong>${company.name}</strong></p>` : ''}
              <p style="color: #374151; line-height: 1.6;">${data.description}</p>
              ${data.sourceUrl ? `<a href="${data.sourceUrl}" style="display: inline-block; margin-top: 16px; background: #3b82f6; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px;">View Source</a>` : ''}
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
              <p style="color: #9ca3af; font-size: 12px;">Competitor Intelligence Dashboard | ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        `,
      });

      await this.prisma.alert.update({
        where: { id: alert.id },
        data: { isSent: true, sentAt: new Date() },
      });
    } catch (e) {
      this.logger.error('Failed to send alert email:', e.message);
    }
  }

  async getUnreadCount() {
    return this.prisma.alert.count({ where: { isRead: false } });
  }
}

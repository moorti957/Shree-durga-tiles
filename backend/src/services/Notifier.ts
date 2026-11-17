import nodemailer from 'nodemailer';
import { IEnquiry } from '../models/Enquiry';
import { AppError } from '../middlewares/errorHandler';

export type NotificationStatus = 'sent' | 'failed' | 'skipped';

export interface Notifier {
  notifyNewEnquiry(enquiry: IEnquiry): Promise<NotificationStatus>;
}

export class NoopNotifier implements Notifier {
  async notifyNewEnquiry(): Promise<NotificationStatus> {
    return 'skipped';
  }
}

export class EmailNotifier implements Notifier {
  async notifyNewEnquiry(enquiry: IEnquiry): Promise<NotificationStatus> {
    const host = process.env.EMAIL_HOST;
    const portValue = process.env.EMAIL_PORT;
    const user = process.env.EMAIL_USER;
    const password = process.env.EMAIL_PASS;
    const from = process.env.EMAIL_FROM;
    const to = process.env.ADMIN_EMAIL;

    if (!host || !portValue || !user || !password || !from || !to) {
      throw new AppError('Email notification settings are incomplete.', 500, 'NOTIFIER_CONFIG_ERROR');
    }

    const port = Number(portValue);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new AppError('EMAIL_PORT must be a valid TCP port.', 500, 'NOTIFIER_CONFIG_ERROR');
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: password },
    });

    await transporter.sendMail({
      from,
      to,
      subject: `New website enquiry: ${enquiry.need}`,
      text: [
        `Name: ${enquiry.name}`,
        `Phone: ${enquiry.phone}`,
        `Need: ${enquiry.need}`,
        `Source: ${enquiry.source}`,
        `Message: ${enquiry.message || '(not provided)'}`,
      ].join('\n'),
    });

    return 'sent';
  }
}

export const createNotifier = (): Notifier => {
  const mailSettings = [
    process.env.EMAIL_HOST,
    process.env.EMAIL_PORT,
    process.env.EMAIL_USER,
    process.env.EMAIL_PASS,
    process.env.EMAIL_FROM,
    process.env.ADMIN_EMAIL,
  ];

  if (mailSettings.every((value) => !value)) return new NoopNotifier();
  return new EmailNotifier();
};

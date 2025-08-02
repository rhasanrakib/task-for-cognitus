import { NotificationEvent, EmailTemplate } from '../types';
import { config } from '../config/config';

export class EmailService {
    private static instance: EmailService;

    private constructor() { }

    public static getInstance(): EmailService {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }
        return EmailService.instance;
    }

    public async sendAccountCreatedNotification(notification: NotificationEvent): Promise<void> {
        if (!config.email.enabled) {
            console.log('Email notifications are disabled');
            return;
        }

        const template = this.generateAccountCreatedEmailTemplate(notification);
        await this.sendEmail(template);
    }


    private generateAccountCreatedEmailTemplate(notification: NotificationEvent): EmailTemplate {
        const subject = `IPTV Account Created - Welcome ${notification.name}`;
        const body = `
        IPTV Account Successfully Created
        • User ID: ${notification.userId}
        • Name: ${notification.name}
        • Email: ${notification.email || 'Not provided'}
        • Created At: ${new Date(notification.processedAt).toLocaleString()}
        This is an automated notification from the File Management System.
            `.trim();

        return {
            subject,
            body,
            recipients: [config.email.admin]
        };
    }


    private async sendEmail(template: EmailTemplate): Promise<void> {
        try {
            // Mock email sending - just log the details
            console.log('\n' + '='.repeat(80));
            console.log('EMAIL NOTIFICATION');
            console.log('='.repeat(80));
            console.log(`From: ${config.email.from}`);
            console.log(`To: ${template.recipients.join(', ')}`);
            console.log(`Subject: ${template.subject}`);
            console.log('Body:');
            console.log(template.body);
            console.log('='.repeat(80));
            console.log(`SMTP Config: ${config.email.smtp.host}:${config.email.smtp.port}`);
            console.log(`SMTP User: ${config.email.smtp.user}`);
            console.log('Email sent successfully (mocked)');
            console.log('='.repeat(80) + '\n');

            // In a real implementation, you would use a library like nodemailer:
            /*
            const transporter = nodemailer.createTransporter({
              host: config.email.smtp.host,
              port: config.email.smtp.port,
              secure: config.email.smtp.port === 465,
              auth: {
                user: config.email.smtp.user,
                pass: config.email.smtp.pass,
              },
            });
      
            await transporter.sendMail({
              from: config.email.from,
              to: template.recipients.join(', '),
              subject: template.subject,
              text: template.body,
            });
            */

        } catch (error: any) {
            console.error('Failed to send email:', error.message);
            throw error;
        }
    }

    public async testEmailConnection(): Promise<boolean> {
        try {
            console.log('Testing email configuration...');
            console.log(`SMTP Host: ${config.email.smtp.host}`);
            console.log(`SMTP Port: ${config.email.smtp.port}`);
            console.log(`SMTP User: ${config.email.smtp.user}`);
            console.log(`Admin Email: ${config.email.admin}`);
            console.log(`Email Enabled: ${config.email.enabled}`);

            // Mock connection test
            console.log('Email configuration test passed (mocked)');
            return true;
        } catch (error: any) {
            console.error('Email configuration test failed:', error.message);
            return false;
        }
    }
}

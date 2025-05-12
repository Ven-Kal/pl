import { MailService } from '@sendgrid/mail';
if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SENDGRID_API_KEY environment variable must be set");
}
const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@pling.co.in';
const VERIFICATION_TEMPLATE_ID = process.env.SENDGRID_VERIFICATION_TEMPLATE_ID;
export async function sendEmail(params) {
    try {
        await mailService.send({
            to: params.to,
            from: FROM_EMAIL,
            subject: params.subject,
            text: params.text,
            html: params.html,
            templateId: params.templateId,
            dynamicTemplateData: params.dynamicTemplateData,
        });
        return true;
    }
    catch (error) {
        console.error('SendGrid email error:', error);
        return false;
    }
}
export async function sendVerificationEmail(to, verificationToken, name) {
    const verificationUrl = `${process.env.SITE_URL}/verify-email?token=${verificationToken}`;
    return sendEmail({
        to,
        subject: 'Verify Your Email - Pling Bicycle Marketplace',
        text: `Hello ${name},\n\nPlease verify your email by clicking the following link: ${verificationUrl}`,
        templateId: VERIFICATION_TEMPLATE_ID,
        dynamicTemplateData: {
            name,
            verificationUrl,
        }
    });
}

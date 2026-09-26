import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { CreateEmailOptions, Resend } from 'resend';

export const emailSenderConfig = async (
  options: CreateEmailOptions,
): Promise<boolean> => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send(options);
  if (error) {
    return false;
  }
  return true;
};

export const emailTemplateBuilder = (
  templateFileName: string,
  email: string,
  subject: string,
  pageHeading: string,
  data: object,
) => {
  const templatesPath = path.join(__dirname, '../../../../views/templates');

  // 1. Compile the specific email body (e.g., welcome-user.hbs)
  const bodySource = fs.readFileSync(
    path.join(templatesPath, templateFileName),
    'utf-8',
  );
  const bodyGenerator = handlebars.compile(bodySource);
  const bodyHtml = bodyGenerator(data);

  // 2. Compile the Master Layout and inject the body HTML into it
  const layoutSource = fs.readFileSync(
    path.join(templatesPath, 'layout.hbs'),
    'utf-8',
  );
  const layoutGenerator = handlebars.compile(layoutSource);

  // Pass the data PLUS the newly compiled body
  const html = layoutGenerator({
    ...data,
    pageHeading,
    body: bodyHtml,
    brandUrl: process.env.ELITE_WHOLESALERS_URL ?? 'https://elitewholesalers.com',
  });

  return {
    from:
      process.env.EMAIL_FROM ??
      'Elite Wholesalers <support@elitewholesalers.com>',
    to: email,
    subject,
    html,
  };
};

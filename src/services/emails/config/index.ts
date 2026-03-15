import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { Resend } from 'resend';
import { BadGatewayException } from '@nestjs/common';

export const emailSenderConfig = async (options: any) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send(options);
  if (data) return true;
  throw new BadGatewayException(error);
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
  const html = layoutGenerator({ ...data, pageHeading, body: bodyHtml });

  return {
    from: 'Badge <support@connectwithbadge.com>',
    to: email,
    subject,
    html,
  };
};

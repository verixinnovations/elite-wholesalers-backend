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
  data: object,
) => {
  const source = fs.readFileSync(
    path.join(__dirname, '../../../../views/templates', templateFileName),
    'utf-8',
  );

  const templateGenerator = handlebars.compile(source);
  const html = templateGenerator(data);

  const mailOptions = {
    from: 'Badge <support@connectwithbadge.com>',
    to: email,
    subject,
    html,
  };
  return mailOptions;
};

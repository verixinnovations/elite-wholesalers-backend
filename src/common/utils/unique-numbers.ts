import { v4 as uuidv4 } from 'uuid';

const generateOtp = () => {
  const max = 9999;
  const min = 1000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateOtpExpiryTime = () => {
  return new Date(Date.now() + 10 * 60 * 1000);
};

const generateReportID = () => {
  const id = uuidv4();
  const uuidStr = id.replace(/-/g, '');
  return uuidStr.slice(0, 12);
};

const generateCompanyID = () => {
  const id = uuidv4();
  const uuidStr = id.replace(/-/g, '');
  return uuidStr.slice(0, 6);
};

export const uniqueNumber = {
  generateOtp,
  generateReportID,
  generateOtpExpiryTime,
  generateCompanyID,
};

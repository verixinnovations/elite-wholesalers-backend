import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  public static readonly ENCRYPTION_KEY = crypto.randomBytes(32);

  public static readonly IV_LENGTH = 16;

  // Encrypts a given text and returns the result in hex format
  public static encrypt(data: string | number): string {
    const iv = crypto.randomBytes(this.IV_LENGTH); // Generate a random IV
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      this.ENCRYPTION_KEY,
      iv,
    );

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  }

  public static decrypt(encryptedText: string): string {
    const [ivHex, encryptedHex] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      this.ENCRYPTION_KEY,
      iv,
    );

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted) as string;
  }
}

const encryptedText = EncryptionService.encrypt(499);
console.log(encryptedText);
console.log(EncryptionService.decrypt(encryptedText));

import * as bcrypt from 'bcrypt';

export class BcryptConfig {
  private static saltOrRounds = 12;

  static async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(this.saltOrRounds);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(userPassword: string, hashedPassword: string) {
    return await bcrypt.compare(userPassword, hashedPassword);
  }
}

import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { PasswordHasher } from 'src/domain/auth/services/password-hasher.service';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);

@Injectable()
export class ScryptPasswordHasherService implements PasswordHasher {
  private readonly keyLength = 32;

  async hash(plain: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(plain, salt, this.keyLength)) as Buffer;
    return `${salt}:${derivedKey.toString('hex')}`;
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    const [salt, storedHash] = hash.split(':');
    if (!salt || !storedHash) {
      return false;
    }

    const derivedKey = (await scrypt(plain, salt, this.keyLength)) as Buffer;
    const storedBuffer = Buffer.from(storedHash, 'hex');
    if (storedBuffer.length !== derivedKey.length) {
      return false;
    }

    return timingSafeEqual(derivedKey, storedBuffer);
  }
}

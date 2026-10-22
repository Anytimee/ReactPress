import { createHash, createDecipheriv, createCipheriv, randomBytes } from 'node:crypto';

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function randomToken(bytes = 64): string {
  return randomBytes(bytes).toString('hex');
}

function deriveKey(secret: string): Buffer {
  // SETTINGS_KEY boleh hex (64 char) atau string biasa -> dinormalisasi ke 32 byte.
  if (/^[0-9a-fA-F]{64}$/.test(secret)) {
    return Buffer.from(secret, 'hex');
  }
  return createHash('sha256').update(secret).digest();
}

export interface EncryptedValue {
  iv: string;
  tag: string;
  data: string;
}

/** Enkripsi AES-256-GCM. Format: iv.tag.data (semua hex). */
export function encryptValue(plain: string, secret: string): string {
  const key = deriveKey(secret);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}.${tag.toString('hex')}.${encrypted.toString('hex')}`;
}

/** Dekripsi AES-256-GCM. Mengembalikan null bila data rusak / kunci berbeda. */
export function decryptValue(payload: string, secret: string): string | null {
  const parts = payload.split('.');
  if (parts.length !== 3) return null;

  const [ivHex, tagHex, dataHex] = parts;
  if (!ivHex || !tagHex || !dataHex) return null;

  try {
    const key = deriveKey(secret);
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataHex, 'hex')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch {
    return null;
  }
}

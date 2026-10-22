import { createHmac, timingSafeEqual } from 'node:crypto';

export interface PreviewPayload {
  id: string;
  type: 'article' | 'page';
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

/** Token preview stateless: payload base64url + HMAC. Berlaku 1 jam. */
export function createPreviewToken(
  payload: PreviewPayload,
  secret: string,
  ttlSeconds = 3600,
): string {
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds }),
  ).toString('base64url');
  return `${body}.${sign(body, secret)}`;
}

export function verifyPreviewToken(token: string, secret: string): PreviewPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [body, signature] = parts;
  if (!body || !signature) return null;

  const expected = sign(body, secret);
  const givenBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    givenBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(givenBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
      id?: unknown;
      type?: unknown;
      exp?: unknown;
    };

    if (typeof decoded.id !== 'string') return null;
    if (decoded.type !== 'article' && decoded.type !== 'page') return null;
    if (typeof decoded.exp !== 'number' || decoded.exp * 1000 <= Date.now()) return null;

    return { id: decoded.id, type: decoded.type };
  } catch {
    return null;
  }
}

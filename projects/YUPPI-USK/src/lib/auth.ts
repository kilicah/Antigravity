import { jwtVerify, SignJWT } from 'jose';

export interface SessionPayload {
  id: number;
  username: string;
  role: string;
}

const secretKey = process.env.JWT_SECRET || 'yuppi-super-secret-key-2026-usk';
const key = new TextEncoder().encode(secretKey);

export async function signToken(payload: SessionPayload) {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // 24 saat kalıcı oturum kuralı
    .sign(key);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

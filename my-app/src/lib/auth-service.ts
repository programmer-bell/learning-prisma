import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/password';
import {
  createSessionToken,
  hashSessionToken,
  SESSION_DURATION_SECONDS,
} from '@/lib/session';

export async function registerAccount(fields: {
  name: string;
  email: string;
  password: string;
}) {
  return prisma.user.create({
    data: {
      name: fields.name,
      email: fields.email,
      passwordHash: await hashPassword(fields.password),
    },
    select: { id: true },
  });
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });
  if (!user || !(await verifyPassword(password, user.passwordHash))) return null;
  return { id: user.id };
}

export async function createUserSession(userId: string) {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);

  await prisma.session.create({
    data: { tokenHash: hashSessionToken(token), userId, expiresAt },
  });

  return { token, expiresAt };
}

export async function getUserFromSession(token: string) {
  const tokenHash = hashSessionToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      expiresAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await prisma.session.deleteMany({ where: { id: session.id } });
    return null;
  }

  return session.user;
}

export async function revokeUserSession(token: string) {
  await prisma.session.deleteMany({
    where: { tokenHash: hashSessionToken(token) },
  });
}
'use server';

import { Prisma } from '@prisma/client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  authenticateUser,
  createUserSession as createSessionRecord,
  getUserFromSession,
  registerAccount,
  revokeUserSession,
} from '@/lib/auth-service';
import {
  SESSION_COOKIE_NAME,
} from '@/lib/session';
import { parseLoginForm, parseRegistrationForm } from '@/lib/validation';

type AuthActionState = { success: false; error: string } | null;

async function setSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const user = await getUserFromSession(token);
  if (!user) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  return user;
}

export async function loginUser(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const fields = parseLoginForm(formData);
  if ('error' in fields && fields.error) return { success: false, error: fields.error };

  const user = await authenticateUser(fields.email, fields.password);
  if (!user) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const session = await createSessionRecord(user.id);
  await setSessionCookie(session.token, session.expiresAt);
  redirect('/dashboard');
}

export async function registerUser(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const fields = parseRegistrationForm(formData);
  if ('error' in fields && fields.error) return { success: false, error: fields.error };

  try {
    const user = await registerAccount(fields);
    const session = await createSessionRecord(user.id);
    await setSessionCookie(session.token, session.expiresAt);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    return { success: false, error: 'Registration failed. Please try again.' };
  }

  redirect('/dashboard');
}

export async function logoutUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  try {
    if (token) {
      await revokeUserSession(token);
    }
  } finally {
    cookieStore.delete(SESSION_COOKIE_NAME);
  }

  redirect('/');
}

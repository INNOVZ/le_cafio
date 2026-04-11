'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import type { AuthActionState } from '@/lib/auth-action-state';
import { createClient } from '@/utils/supabase/server';

function getAuthErrorMessage(message?: string) {
  return message ?? 'Something went wrong while contacting Supabase.';
}

export async function login(
  _: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: getAuthErrorMessage(error.message) };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signup(
  _: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const firstName = formData.get('first-name') as string;
  const lastName = formData.get('last-name') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirm-password') as string;

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  const data = {
    email: formData.get('email') as string,
    password,
    options: {
      data: {
        full_name: `${firstName + ' ' + lastName}`,
        email: formData.get('email') as string,
      },
    },
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    return { error: getAuthErrorMessage(error.message) };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.log(error);
    redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/auth/login');
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.log(error);
    redirect('/error');
  }

  redirect(data.url);
}

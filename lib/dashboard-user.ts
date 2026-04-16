import type { User } from '@supabase/supabase-js';

export type DashboardUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
  role: string | null;
};

function getMetadataValue(
  metadata: Record<string, unknown> | undefined,
  keys: string[]
) {
  for (const key of keys) {
    const value = metadata?.[key];

    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function getDisplayName(user: User) {
  const fullName = getMetadataValue(user.user_metadata, ['full_name', 'name']);
  if (fullName && fullName !== 'null null') {
    return fullName;
  }

  const firstName = getMetadataValue(user.user_metadata, ['first_name']);
  const lastName = getMetadataValue(user.user_metadata, ['last_name']);
  const combinedName = [firstName, lastName].filter(Boolean).join(' ').trim();

  if (combinedName) {
    return combinedName;
  }

  if (user.email) {
    return user.email.split('@')[0];
  }

  return 'Dashboard User';
}

function getInitials(name: string, email: string) {
  const parts = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length > 0) {
    return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
  }

  return email.slice(0, 2).toUpperCase() || 'DU';
}

function formatRole(role: string | null) {
  if (!role) {
    return null;
  }

  return role
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getDashboardUser(user: User): DashboardUser {
  const name = getDisplayName(user);
  const email = user.email ?? 'No email available';

  return {
    id: user.id,
    name,
    email,
    avatarUrl: getMetadataValue(user.user_metadata, [
      'avatar_url',
      'picture',
      'avatar',
    ]),
    initials: getInitials(name, email),
    role: formatRole(
      getMetadataValue(user.app_metadata, ['role']) ??
        getMetadataValue(user.user_metadata, ['role', 'app_role'])
    ),
  };
}

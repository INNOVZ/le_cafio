/**
 * Maps URL-friendly branch slugs to the actual RestaurantLocation slugs in the database.
 * URL: /alreem  → DB slug: cafio-al-reem-island
 * URL: /adnec   → DB slug: cafio-adnec
 */
export const BRANCH_SLUG_MAP: Record<string, string> = {
  alreem: 'cafio-al-reem-island',
  adnec: 'cafio-adnec',
};

export const KNOWN_BRANCH_SLUGS = Object.keys(BRANCH_SLUG_MAP);

/**
 * Resolve a URL-friendly slug to a DB slug.
 * Returns the DB slug if found, otherwise returns the input as-is.
 */
export function resolveDbSlug(urlSlug: string): string {
  return BRANCH_SLUG_MAP[urlSlug] ?? urlSlug;
}

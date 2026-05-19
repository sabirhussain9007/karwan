export function isDisplayableAvatar(value?: string | null): boolean {
  if (!value) return false;
  return /^https?:\/\//.test(value) || value.startsWith("/uploads/");
}

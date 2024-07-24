const whitelist: string[] = ["admin@example.com", "root@example.com", "gerryscotti@example.com"];

export function isEmailWhitelisted(email: string): boolean {
  return whitelist.includes(email);
}

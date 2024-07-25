const whitelist: string[] = [
  "adriano@root.com",
  "raffaele@root.com",
  "francesco@root.com",
  "peppe@root.com",
  "giuseppe@root.com",
];

export function isEmailWhitelisted(email: string): boolean {
  return whitelist.includes(email);
}

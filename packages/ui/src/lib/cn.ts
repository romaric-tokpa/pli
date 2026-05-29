// Concaténation conditionnelle de classNames — équivalent typé minimal de clsx,
// pour éviter une dépendance externe sur un helper de 200 octets.
// Usage : cn('base', condition && 'extra', autre)

export function cn(...parts: Array<string | number | false | null | undefined>): string {
  return parts.filter((p): p is string | number => Boolean(p)).join(' ');
}

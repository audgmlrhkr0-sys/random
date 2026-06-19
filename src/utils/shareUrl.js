export function getRoomShareUrl(roomId) {
  if (typeof window === 'undefined') return '';
  const base = import.meta.env.BASE_URL || '/';
  const normalized = base.startsWith('/') ? base : `/${base}`;
  const withSlash = normalized.endsWith('/') ? normalized : `${normalized}/`;
  return `${window.location.origin}${withSlash}#/r/${roomId}`;
}

export const ADMIN_ROUTE = '/adminvka';

export function normalizePath(pathname: string) {
  if (pathname === '/' || pathname === '/booking' || pathname === '/contact' || pathname === ADMIN_ROUTE) {
    return pathname;
  }
  return '/';
}

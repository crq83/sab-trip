import { cookies } from 'next/headers';

export async function getAuthState(): Promise<{
  isViewer: boolean;
  isAdmin: boolean;
}> {
  const cookieStore = await cookies();
  const isViewer = cookieStore.get('view-auth')?.value === 'true';
  const isAdmin = cookieStore.get('admin-auth')?.value === 'true';
  return { isViewer, isAdmin };
}

/** For use in API route handlers — reads cookie from request headers directly */
export function isAdminRequest(request: Request): boolean {
  const cookie = request.headers.get('cookie') ?? '';
  return cookie.split(';').some((c) => c.trim() === 'admin-auth=true');
}

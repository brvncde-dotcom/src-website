import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateAdminKey } from "@/lib/db";

// Authorize an admin request by EITHER:
//  1) a valid ADMIN_API_KEY Bearer token (server-to-server / programmatic), or
//  2) a logged-in admin session (email in ADMIN_EMAILS — the session callback
//     sets session.user.isAdmin).
//
// This means the browser never needs the admin key: a logged-in admin is
// authorized by their session cookie alone. The key path stays for scripts.
export async function isAdminRequest(request: Request): Promise<boolean> {
  if (validateAdminKey(request)) return true;
  const session = await getServerSession(authOptions);
  return !!(session?.user as { isAdmin?: boolean } | undefined)?.isAdmin;
}

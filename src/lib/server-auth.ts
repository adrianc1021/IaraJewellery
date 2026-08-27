import { auth } from "@/lib/auth";
import { HttpError } from "@/lib/http";

export async function sessionFromRequest(request: Request) {
  return auth.api.getSession({ headers: request.headers });
}

export async function requireApiUser(request: Request) {
  const session = await sessionFromRequest(request);
  if (!session) throw new HttpError(401, "請先登入。" );
  return session;
}

export async function requireApiStaff(request: Request, allowed: readonly string[]) {
  const session = await requireApiUser(request);
  const role = session.user.role ?? "CUSTOMER";
  if (!allowed.includes(role)) throw new HttpError(403, "你沒有此操作權限。" );
  if (process.env.NODE_ENV === "production" && !session.user.twoFactorEnabled) {
    throw new HttpError(403, "公司後台帳戶必須先啟用雙重驗證。" );
  }
  return session;
}

import { db } from "@/lib/db";

export async function writeAudit(input: { actorId?: string; action: string; entityType: string; entityId: string; oldValue?: unknown; newValue?: unknown; reason?: string; ipAddress?: string }) {
  return db.auditLog.create({ data: {
    actorId: input.actorId, action: input.action, entityType: input.entityType, entityId: input.entityId,
    oldValue: input.oldValue === undefined ? undefined : JSON.stringify(input.oldValue),
    newValue: input.newValue === undefined ? undefined : JSON.stringify(input.newValue),
    reason: input.reason, ipAddress: input.ipAddress
  } });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiStaff } from "@/lib/server-auth";
import { apiError, enforceSameOrigin, requestIp } from "@/lib/http";
import { writeAudit } from "@/lib/audit";
const schema=z.object({membershipTier:z.enum(["MEMBER","GOLD","DIAMOND","VIP"]),status:z.enum(["ACTIVE","SUSPENDED"]),reason:z.string().min(3).max(300)});
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){try{enforceSameOrigin(request);const session=await requireApiStaff(request,["CUSTOMER_SERVICE","ADMIN","SUPER_ADMIN"]);const{id}=await params;const body=schema.parse(await request.json());const old=await db.user.findUniqueOrThrow({where:{id}});const user=await db.user.update({where:{id},data:{membershipTier:body.membershipTier,status:body.status}});await writeAudit({actorId:session.user.id,action:"UPDATE_MEMBER",entityType:"User",entityId:id,oldValue:{membershipTier:old.membershipTier,status:old.status},newValue:{membershipTier:user.membershipTier,status:user.status},reason:body.reason,ipAddress:requestIp(request)});return NextResponse.json({user});}catch(error){return apiError(error);}}

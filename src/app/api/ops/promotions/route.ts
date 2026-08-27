import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiStaff } from "@/lib/server-auth";
import { apiError, enforceSameOrigin, requestIp } from "@/lib/http";
import { writeAudit } from "@/lib/audit";
const schema=z.object({name:z.string().min(2),code:z.string().min(3).max(30).transform(v=>v.toUpperCase()),value:z.number().int().min(1).max(100),minimumMinor:z.number().int().min(0),usageLimit:z.number().int().min(1),startsAt:z.coerce.date(),endsAt:z.coerce.date()});
export async function POST(request:Request){try{enforceSameOrigin(request);const session=await requireApiStaff(request,["MARKETING","ADMIN","SUPER_ADMIN"]);const body=schema.parse(await request.json());const promotion=await db.promotion.create({data:{...body,type:"PERCENT"}});await writeAudit({actorId:session.user.id,action:"CREATE_PROMOTION",entityType:"Promotion",entityId:promotion.id,newValue:promotion,reason:"後台建立優惠",ipAddress:requestIp(request)});return NextResponse.json({promotion},{status:201});}catch(error){return apiError(error);}}

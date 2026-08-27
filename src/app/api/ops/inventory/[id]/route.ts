import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inventorySchema } from "@/lib/validation";
import { requireApiStaff } from "@/lib/server-auth";
import { apiError, enforceSameOrigin, requestIp } from "@/lib/http";
import { writeAudit } from "@/lib/audit";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){try{enforceSameOrigin(request);const session=await requireApiStaff(request,["WAREHOUSE","MERCHANDISER","ADMIN","SUPER_ADMIN"]);const{id}=await params;const body=inventorySchema.parse(await request.json());const old=await db.productVariant.findUniqueOrThrow({where:{id}});const variant=await db.$transaction(async(tx)=>{const updated=await tx.productVariant.update({where:{id},data:{stockOnHand:body.stockOnHand}});await tx.inventoryMovement.create({data:{variantId:id,type:"ADJUST",quantity:body.stockOnHand-old.stockOnHand,reason:body.reason,actorId:session.user.id}});return updated;});await writeAudit({actorId:session.user.id,action:"ADJUST_INVENTORY",entityType:"ProductVariant",entityId:id,oldValue:{stockOnHand:old.stockOnHand},newValue:{stockOnHand:variant.stockOnHand},reason:body.reason,ipAddress:requestIp(request)});return NextResponse.json({variant});}catch(error){return apiError(error);}}

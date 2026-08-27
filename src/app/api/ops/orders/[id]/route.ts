import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orderStatusSchema } from "@/lib/validation";
import { requireApiStaff } from "@/lib/server-auth";
import { apiError, enforceSameOrigin, requestIp } from "@/lib/http";
import { writeAudit } from "@/lib/audit";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){try{enforceSameOrigin(request);const session=await requireApiStaff(request,["CUSTOMER_SERVICE","WAREHOUSE","ADMIN","SUPER_ADMIN"]);const{id}=await params;const body=orderStatusSchema.parse(await request.json());const old=await db.order.findUniqueOrThrow({where:{id}});const order=await db.order.update({where:{id},data:{orderStatus:body.orderStatus,fulfillmentStatus:body.orderStatus}});await db.orderStatusHistory.create({data:{orderId:id,status:body.orderStatus,note:body.note,actorId:session.user.id}});await writeAudit({actorId:session.user.id,action:"UPDATE_ORDER_STATUS",entityType:"Order",entityId:id,oldValue:{orderStatus:old.orderStatus},newValue:{orderStatus:order.orderStatus},reason:body.note,ipAddress:requestIp(request)});return NextResponse.json({order});}catch(error){return apiError(error);}}

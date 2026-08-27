import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appointmentStatusSchema } from "@/lib/validation";
import { requireApiStaff } from "@/lib/server-auth";
import { apiError, enforceSameOrigin, requestIp } from "@/lib/http";
import { writeAudit } from "@/lib/audit";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){try{enforceSameOrigin(request);const session=await requireApiStaff(request,["CUSTOMER_SERVICE","ADMIN","SUPER_ADMIN"]);const{id}=await params;const body=appointmentStatusSchema.parse(await request.json());const old=await db.appointment.findUniqueOrThrow({where:{id}});const appointment=await db.appointment.update({where:{id},data:body});await writeAudit({actorId:session.user.id,action:"UPDATE_APPOINTMENT",entityType:"Appointment",entityId:id,oldValue:{status:old.status,assignedTo:old.assignedTo},newValue:{status:appointment.status,assignedTo:appointment.assignedTo},reason:body.internalNote,ipAddress:requestIp(request)});return NextResponse.json({appointment});}catch(error){return apiError(error);}}

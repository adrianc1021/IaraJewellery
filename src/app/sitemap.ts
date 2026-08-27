import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const base=process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000";const products=await db.product.findMany({where:{status:"ACTIVE"},select:{slug:true,updatedAt:true}});return ["","/shop","/appointment","/journal","/faq","/privacy"].map((path)=>({url:`${base}${path}`,lastModified:new Date()})).concat(products.map((product)=>({url:`${base}/product/${product.slug}`,lastModified:product.updatedAt}))); }

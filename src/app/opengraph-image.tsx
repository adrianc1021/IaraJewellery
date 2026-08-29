import { ImageResponse } from "next/og";

export const alt = "Iara Jewellery Hong Kong fine jewellery";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", padding: "76px 88px", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f3f1ed", color: "#182126" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 22, letterSpacing: 0 }}><span>IARA JEWELLERY</span><span style={{ color: "#746e67", fontSize: 16, letterSpacing: 0 }}>HONG KONG</span></div><div style={{ display: "flex", flexDirection: "column", gap: 22 }}><div style={{ width: 78, height: 2, background: "#b59a70" }} /><div style={{ fontSize: 76, lineHeight: 1.08, maxWidth: 900 }}>Jewels shaped by light.</div><div style={{ fontSize: 25, color: "#536069" }}>Contemporary fine jewellery, private service and Hong Kong craftsmanship.</div></div></div>, size);
}

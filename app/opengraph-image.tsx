import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { personIdentity, studioBrand } from "@/data/identity";

export const alt = `${personIdentity.name} · ${studioBrand.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const portrait = await readFile(join(process.cwd(), "public/images/edrisa-portrait.jpg"));
  const src = `data:image/jpeg;base64,${portrait.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#fffbf3",
          color: "#1c120e",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "42%",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <img src={src} alt="" width={504} height={630} style={{ objectFit: "cover", objectPosition: "center top" }} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 52px",
            width: "58%",
          }}
        >
          <div style={{ fontSize: 22, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.62 }}>
            {studioBrand.name}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 64, lineHeight: 1.05, fontWeight: 800 }}>{personIdentity.name}</div>
            <div style={{ fontSize: 28, lineHeight: 1.3, opacity: 0.78 }}>{personIdentity.jobTitle}</div>
          </div>
          <div style={{ fontSize: 22, opacity: 0.7 }}>edrisastudio.com</div>
        </div>
      </div>
    ),
    { ...size },
  );
}

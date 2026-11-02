import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";

export async function GET() {
  const [portrait, bold, semibold] = await Promise.all([
    readFile(join(process.cwd(), "public/images/social/kasibante-edrisa-portrait.jpg")),
    readFile(join(process.cwd(), "fonts/LufgaExtraBold.ttf")),
    readFile(join(process.cwd(), "fonts/LufgaSemiBold.ttf")),
  ]);

  const response = new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#fffbf3",
          color: "#1c120e",
          fontFamily: "Lufga",
        }}
      >
        <img
          src={`data:image/jpeg;base64,${portrait.toString("base64")}`}
          alt=""
          width={520}
          height={630}
          style={{ objectFit: "cover", objectPosition: "center 18%" }}
        />
        <div
          style={{
            display: "flex",
            width: 14,
            height: "100%",
            background: "linear-gradient(180deg,#5446DF 0%,#3566f2 48%,#20D1C0 100%)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 666,
            padding: "58px 56px 52px",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.55 }}>
            Edrisa Studio
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 0.98, letterSpacing: "-0.03em" }}>Kasibante</div>
            <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 0.98, letterSpacing: "-0.03em" }}>Edrisa</div>
            <div style={{ marginTop: 22, fontSize: 28, fontWeight: 600, lineHeight: 1.25, maxWidth: 500 }}>
              Multidisciplinary Designer & Software Developer
            </div>
          </div>
          <div style={{ fontSize: 54, fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1 }}>edrisa</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Lufga", data: bold, weight: 800, style: "normal" },
        { name: "Lufga", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );

  response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return response;
}

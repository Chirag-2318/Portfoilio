import { ImageResponse } from "next/og";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const frauncesData = await fs.readFile(
    path.join(
      process.cwd(),
      "node_modules/@fontsource/fraunces/files/fraunces-latin-500-normal.woff"
    )
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F3F0E8",
          padding: 16,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FAF8F3",
            borderRadius: "50%",
            border: "4px solid #15140F",
            position: "relative",
            fontFamily: "Fraunces, serif",
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 500,
              color: "#15140F",
              lineHeight: 1,
              letterSpacing: "-0.04em",
              display: "flex",
              alignItems: "center",
              marginTop: -4,
            }}
          >
            CP
          </span>
          <div
            style={{
              position: "absolute",
              bottom: 24,
              right: 24,
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: "#B82D17",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Fraunces",
          data: frauncesData,
          weight: 500,
          style: "normal",
        },
      ],
    }
  );
}


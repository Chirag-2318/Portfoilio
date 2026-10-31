import { ImageResponse } from "next/og";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-static";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
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
          borderRadius: "50%",
          border: "1.5px solid #15140F",
          position: "relative",
          fontFamily: "Fraunces, serif",
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#15140F",
            lineHeight: 1,
            letterSpacing: "-0.04em",
            display: "flex",
            alignItems: "center",
            marginTop: -1,
          }}
        >
          CP
        </span>
        <div
          style={{
            position: "absolute",
            bottom: 4,
            right: 4,
            width: 3.5,
            height: 3.5,
            borderRadius: "50%",
            backgroundColor: "#B82D17",
          }}
        />
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

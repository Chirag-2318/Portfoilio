import { ImageResponse } from "next/og";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Chirag Patil — Developer in Pune";

export default async function OpenGraphImage() {
  const [frauncesData, monoData] = await Promise.all([
    fs.readFile(
      path.join(
        process.cwd(),
        "node_modules/@fontsource/fraunces/files/fraunces-latin-500-normal.woff"
      )
    ),
    fs.readFile(
      path.join(
        process.cwd(),
        "node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff"
      )
    ),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#F3F0E8",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Fraunces, serif",
        }}
      >
        {/* Inner border inset 32px */}
        <div
          style={{
            position: "absolute",
            top: 32,
            left: 32,
            right: 32,
            bottom: 32,
            border: "1px solid #D8D3C6",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "48px 56px",
          }}
        >
          {/* Top-left mono label */}
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 14,
              letterSpacing: "0.14em",
              color: "#55514A",
              textTransform: "uppercase",
            }}
          >
            ENGINEERING STUDENT & DEVELOPER — PUNE, INDIA
          </div>

          {/* Center / Bottom content area */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            {/* Name */}
            <div
              style={{
                fontSize: 144,
                lineHeight: 0.9,
                fontWeight: 500,
                color: "#15140F",
                letterSpacing: "-0.03em",
                display: "flex",
                alignItems: "baseline",
              }}
            >
              <span>Chirag Patil</span>
              <span style={{ color: "#B82D17" }}>.</span>
            </div>

            {/* Tagline */}
            <div
              style={{
                fontSize: 38,
                lineHeight: 1.2,
                color: "#55514A",
                marginTop: 28,
                letterSpacing: "-0.01em",
              }}
            >
              I do the task. Then I take it further.
            </div>
          </div>
        </div>

        {/* Four corner crop marks (in #7A756B) */}
        {/* Top-left */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            width: 16,
            height: 1,
            backgroundColor: "#7A756B",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            width: 1,
            height: 16,
            backgroundColor: "#7A756B",
          }}
        />

        {/* Top-right */}
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            width: 16,
            height: 1,
            backgroundColor: "#7A756B",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            width: 1,
            height: 16,
            backgroundColor: "#7A756B",
          }}
        />

        {/* Bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 24,
            width: 16,
            height: 1,
            backgroundColor: "#7A756B",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 24,
            width: 1,
            height: 16,
            backgroundColor: "#7A756B",
          }}
        />

        {/* Bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            width: 16,
            height: 1,
            backgroundColor: "#7A756B",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            width: 1,
            height: 16,
            backgroundColor: "#7A756B",
          }}
        />

        {/* Accent circle "lens" (~220px) partly overlapping the name at right */}
        <div
          style={{
            position: "absolute",
            right: 120,
            top: 200,
            width: 220,
            height: 220,
            borderRadius: "50%",
            border: "1px solid #B82D17",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Outward ticks (N, S, E, W) */}
          <div
            style={{
              position: "absolute",
              top: -6,
              left: 109,
              width: 1,
              height: 6,
              backgroundColor: "#B82D17",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -6,
              left: 109,
              width: 1,
              height: 6,
              backgroundColor: "#B82D17",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -6,
              top: 109,
              width: 6,
              height: 1,
              backgroundColor: "#B82D17",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: -6,
              top: 109,
              width: 6,
              height: 1,
              backgroundColor: "#B82D17",
            }}
          />
          {/* Label under the lens */}
          <div
            style={{
              position: "absolute",
              bottom: -28,
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 12,
              letterSpacing: "0.1em",
              color: "#B82D17",
              textTransform: "uppercase",
            }}
          >
            1st pass
          </div>
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
        {
          name: "JetBrains Mono",
          data: monoData,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );
}


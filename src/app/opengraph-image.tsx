import { ImageResponse } from "next/og";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Chirag Patil — Developer in Pune";

export default async function OpenGraphImage() {
  const [geistSansData, geistMonoData] = await Promise.all([
    fs.readFile(
      path.join(
        process.cwd(),
        "node_modules/geist/dist/fonts/geist-sans/Geist-Bold.ttf"
      )
    ),
    fs.readFile(
      path.join(
        process.cwd(),
        "node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf"
      )
    ),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#09090b",
          display: "flex",
          position: "relative",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          fontFamily: "GeistSans, sans-serif",
          color: "#fafafa",
        }}
      >
        {/* Full height hairlines at x=60 and x=1140 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 60,
            width: 1,
            backgroundColor: "#27272a",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 60,
            width: 1,
            backgroundColor: "#27272a",
          }}
        />

        {/* Full width hairlines at y=60 and y=570 */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 60,
            height: 1,
            backgroundColor: "#27272a",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 60,
            height: 1,
            backgroundColor: "#27272a",
          }}
        />

        {/* Registration crosshairs at hairline intersections */}
        <div style={{ position: "absolute", top: 56, left: 56, width: 9, height: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", width: 9, height: 1, backgroundColor: "#ff5a2c" }} />
          <div style={{ position: "absolute", width: 1, height: 9, backgroundColor: "#ff5a2c" }} />
        </div>
        <div style={{ position: "absolute", top: 56, right: 56, width: 9, height: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", width: 9, height: 1, backgroundColor: "#ff5a2c" }} />
          <div style={{ position: "absolute", width: 1, height: 9, backgroundColor: "#ff5a2c" }} />
        </div>
        <div style={{ position: "absolute", bottom: 56, left: 56, width: 9, height: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", width: 9, height: 1, backgroundColor: "#ff5a2c" }} />
          <div style={{ position: "absolute", width: 1, height: 9, backgroundColor: "#ff5a2c" }} />
        </div>
        <div style={{ position: "absolute", bottom: 56, right: 56, width: 9, height: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", width: 9, height: 1, backgroundColor: "#ff5a2c" }} />
          <div style={{ position: "absolute", width: 1, height: 9, backgroundColor: "#ff5a2c" }} />
        </div>

        {/* Top bar with dimensions and drawing metadata */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "GeistMono, monospace",
            fontSize: 13,
            color: "#71717a",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: "#fafafa", fontWeight: 700 }}>CP // 01</span>
            <span>·</span>
            <span>BLUEPRINT GRID SPEC</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span>DIM: 1200 × 630</span>
            <span>·</span>
            <span>SCALE 1:1</span>
          </div>
        </div>

        {/* Center / Body Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 16,
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              fontFamily: "GeistMono, monospace",
              fontSize: 16,
              color: "#a1a1aa",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            DEVELOPER · PUNE, INDIA
          </div>

          {/* Name */}
          <div
            style={{
              fontSize: 88,
              lineHeight: 1.0,
              fontWeight: 800,
              color: "#fafafa",
              letterSpacing: "-0.04em",
              display: "flex",
              alignItems: "baseline",
            }}
          >
            CHIRAG PATIL
          </div>

          {/* Discipline / summary */}
          <div
            style={{
              fontSize: 24,
              color: "#a1a1aa",
              maxWidth: 820,
              lineHeight: 1.4,
              display: "flex",
              gap: 12,
            }}
          >
            Backends, Android apps and hackathon builds.
          </div>
        </div>

        {/* Bottom bar with technical notations */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "GeistMono, monospace",
            fontSize: 13,
            color: "#71717a",
            borderTop: "1px dashed #27272a",
            paddingTop: 16,
          }}
        >
          <div style={{ display: "flex", gap: 24 }}>
            <span>COL: 768px</span>
            <span>AVATAR: Ø160</span>
            <span>STRIPE: 32px</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#ff5a2c",
              }}
            />
            <span style={{ color: "#a1a1aa" }}>ACTIVE // 2026</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "GeistSans",
          data: geistSansData,
          weight: 700,
          style: "normal",
        },
        {
          name: "GeistMono",
          data: geistMonoData,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );
}

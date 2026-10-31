import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          position: "relative",
        }}
      >
        <svg
          width="110"
          height="110"
          viewBox="0 0 28 28"
          fill="#fafafa"
        >
          {/* C */}
          <rect x="2" y="4" width="4" height="4" />
          <rect x="6" y="4" width="4" height="4" />
          <rect x="10" y="4" width="4" height="4" />
          <rect x="2" y="8" width="4" height="4" />
          <rect x="2" y="12" width="4" height="4" />
          <rect x="2" y="16" width="4" height="4" />
          <rect x="2" y="20" width="4" height="4" />
          <rect x="6" y="20" width="4" height="4" />
          <rect x="10" y="20" width="4" height="4" />
          {/* P */}
          <rect x="16" y="4" width="4" height="4" />
          <rect x="16" y="8" width="4" height="4" />
          <rect x="16" y="12" width="4" height="4" />
          <rect x="16" y="16" width="4" height="4" />
          <rect x="16" y="20" width="4" height="4" />
          <rect x="20" y="4" width="4" height="4" />
          <rect x="24" y="4" width="4" height="4" />
          <rect x="24" y="8" width="4" height="4" />
          <rect x="20" y="12" width="4" height="4" />
          <rect x="24" y="12" width="4" height="4" />
        </svg>

        {/* Small accent registration crosshair circle */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            width: 16,
            height: 16,
            borderRadius: "50%",
            border: "2px solid #ff5a2c",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#ff5a2c",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

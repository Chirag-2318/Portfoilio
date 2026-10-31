import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 6,
          position: "relative",
        }}
      >
        <svg
          width="22"
          height="22"
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

        {/* Small accent registration mark */}
        <div
          style={{
            position: "absolute",
            bottom: 3,
            right: 3,
            width: 4,
            height: 4,
            borderRadius: "50%",
            backgroundColor: "#ff5a2c",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}

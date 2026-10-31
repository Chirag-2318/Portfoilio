import { preload } from "react-dom";
import { site } from "@/content/site";
import { getAssets } from "@/lib/assets";
import { HomeStage } from "@/components/home/HomeStage";

export default function HomePage() {
  const assets = getAssets();
  if (assets.hasPhoto) {
    preload(site.assets.photo, { as: "image" });
  }

  return <HomeStage />;
}

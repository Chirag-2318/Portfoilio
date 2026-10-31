import { site, isPlaceholder } from "@/content/site";

export type SocialKey = "github" | "linkedin";

export type SocialItem = {
  key: SocialKey;
  label: string;
  url: string;
  placeholder: boolean;
  visible: boolean;
};

export function getSocials(): SocialItem[] {
  const isProd = process.env.NODE_ENV === "production";
  const keys: SocialKey[] = ["github", "linkedin"];

  return keys.map((key) => {
    const item = site.socials[key];
    const placeholder = isPlaceholder(item.url);
    const visible = !placeholder || !isProd;
    return {
      key,
      label: item.label,
      url: item.url,
      placeholder,
      visible,
    };
  });
}

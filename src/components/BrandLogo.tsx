import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/hn-logo.png.asset.json";

type Lang = "en" | "fr" | "ar";

export function BrandLogo({
  lang,
  size = 44,
  withText = true,
  textClass = "",
}: {
  lang: Lang;
  size?: number;
  withText?: boolean;
  textClass?: string;
}) {
  return (
    <Link
      to="/$lang"
      params={{ lang }}
      className="inline-flex items-center gap-2.5 transition-transform duration-200 hover:scale-[1.04] active:scale-95"
      aria-label="HN RentCar — home"
    >
      <img
        src={logoAsset.url}
        alt="HN RentCar"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="rounded-xl object-cover shadow-lg shadow-black/10 ring-1 ring-border"
      />
      {withText && (
        <span className={`font-display text-2xl font-black leading-none ${textClass}`}>
          HN <span className="text-primary">RentCar</span>
        </span>
      )}
    </Link>
  );
}

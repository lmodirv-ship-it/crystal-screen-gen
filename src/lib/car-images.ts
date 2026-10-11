import economy from "@/assets/car-economy.png";
import compact from "@/assets/car-compact.png";
import suv from "@/assets/car-suv.png";
import sedan from "@/assets/car-sedan.png";
import premium from "@/assets/car-premium.png";

const MAP: Record<string, string> = { economy, compact, suv, sedan, premium };
export const carImage = (category: string) => MAP[category] ?? economy;
export const CATEGORIES = ["economy", "compact", "sedan", "suv", "premium"];

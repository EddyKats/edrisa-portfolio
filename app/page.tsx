import type { Metadata } from "next";
import { HomeStage } from "@/components/home/HomeStage";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return <HomeStage />;
}

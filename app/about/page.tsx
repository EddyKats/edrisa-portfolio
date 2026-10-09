import type { Metadata } from "next";
import { AboutPage } from "@/components/about/AboutPage";
import { aboutMeta } from "@/data/about";
import "./about.css";

export const metadata: Metadata = {
  title: { absolute: aboutMeta.title },
  description: aboutMeta.description,
  alternates: {
    canonical: "/about",
  },
};

export default function AboutRoute() {
  return <AboutPage />;
}

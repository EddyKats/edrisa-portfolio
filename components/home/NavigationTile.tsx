"use client";

import Link from "next/link";
import { ViewTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Mail } from "lucide-react";
import type { NavItem } from "@/data/navigation";
import { NavIcon } from "@/components/icons/NavIcon";
import { HomeStageMedia } from "@/components/home/HomeStageMedia";
import type { HomeSectionMedia } from "@/lib/content/site-shape";

const MotionLink = motion.create(Link);
const ease = [0.22, 1, 0.36, 1] as const;

type NavigationTileProps = {
  item: NavItem;
  label: string;
  index: number;
  surfaceClass?: string;
  eyebrow?: string;
  artwork: string;
  media?: HomeSectionMedia;
};

export function NavigationTile({
  item,
  label,
  index,
  surfaceClass = item.surfaceClass,
  eyebrow,
  artwork,
  media,
}: NavigationTileProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="nav-tile h-full min-h-0"
      data-tile={item.id}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: reduce ? 0 : 0.16 + index * 0.06,
        ease,
      }}
    >
      <ViewTransition name={item.transitionName}>
        <MotionLink
          href={item.href}
          aria-label={label}
          whileTap={reduce ? undefined : { scale: 0.985 }}
          transition={{ duration: 0.28, ease }}
          className="group relative flex h-full min-h-0 w-full overflow-hidden text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none focus-visible:ring-inset"
        >
          <span
            aria-hidden="true"
            className={`absolute inset-0 origin-center transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:transform-none ${surfaceClass}`}
          >
            {media && media.frames.length > 0 ? (
              <>
                <HomeStageMedia
                  frames={media.frames}
                  mode={media.mode}
                  alt=""
                  sizes="(min-width: 960px) 25vw, 50vw"
                />
                <span className="absolute inset-0 bg-black/28" />
              </>
            ) : null}
          </span>
          <span aria-hidden="true" className="nav-mark" data-tile={item.id}>
            <span className="nav-mark-core" />
            <span className="nav-mark-ring" />
          </span>
          {eyebrow ? <span className="nav-tile-kicker">{eyebrow}</span> : null}
          <span className="nav-tile-copy">
            <span className="transition-transform duration-500 ease-out group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:transform-none">
              {item.id === "contact" ? (
                <Mail className="nav-tile-icon" strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <NavIcon name={item.icon} className="nav-tile-icon" />
              )}
            </span>
            <span
              aria-hidden="true"
              className="nav-tile-art transition-transform duration-500 ease-out group-hover:-translate-y-1.5 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
              dangerouslySetInnerHTML={{ __html: artwork }}
            />
          </span>
        </MotionLink>
      </ViewTransition>
    </motion.div>
  );
}

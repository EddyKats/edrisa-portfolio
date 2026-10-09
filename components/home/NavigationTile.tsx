"use client";

import Link from "next/link";
import { ViewTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { NavItem } from "@/data/navigation";
import { NavIcon } from "@/components/icons/NavIcon";

const MotionLink = motion.create(Link);
const ease = [0.22, 1, 0.36, 1] as const;

type NavigationTileProps = {
  item: NavItem;
  index: number;
};

export function NavigationTile({ item, index }: NavigationTileProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="h-full min-h-0"
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
          whileTap={reduce ? undefined : { scale: 0.985 }}
          transition={{ duration: 0.28, ease }}
          className="group relative flex h-full min-h-0 w-full overflow-hidden text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none focus-visible:ring-inset"
        >
          <span
            aria-hidden="true"
            className={`absolute inset-0 origin-center transition-transform duration-500 ease-out group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:group-hover:transform-none ${item.surfaceClass}`}
          />
          <span aria-hidden="true" className="nav-mark" data-tile={item.id}>
            <span className="nav-mark-core" />
            <span className="nav-mark-ring" />
          </span>
          <span className="nav-tile-copy">
            <span className="transition-transform duration-500 ease-out group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:transform-none">
              <NavIcon name={item.icon} className="nav-tile-icon" />
            </span>
            <span className="nav-tile-title transition-transform duration-500 ease-out group-hover:-translate-y-[3px] motion-reduce:transition-none motion-reduce:group-hover:transform-none">
              {item.title}
            </span>
          </span>
        </MotionLink>
      </ViewTransition>
    </motion.div>
  );
}

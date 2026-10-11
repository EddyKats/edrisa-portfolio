"use client";

import Link from "next/link";
import { ViewTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Mail } from "lucide-react";
import type { NavItem } from "@/data/navigation";
import { NavIcon } from "@/components/icons/NavIcon";

const MotionLink = motion.create(Link);
const ease = [0.22, 1, 0.36, 1] as const;

type NavigationTileProps = {
  item: NavItem;
  label: string;
  index: number;
  surfaceClass?: string;
  eyebrow?: string;
};

function titleLines(label: string) {
  const words = label.trim().split(/\s+/);
  const first = words[0] ?? label;
  const rest = words.slice(1).join(" ");
  return rest ? [first, rest] : [first];
}

export function NavigationTile({
  item,
  label,
  index,
  surfaceClass = item.surfaceClass,
  eyebrow,
}: NavigationTileProps) {
  const reduce = useReducedMotion();
  const lines = titleLines(label);

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
          />
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
            <span className="nav-tile-title transition-transform duration-500 ease-out group-hover:-translate-y-1.5 motion-reduce:transition-none motion-reduce:group-hover:transform-none">
              {lines.map((line, lineIndex) => (
                <span key={`${item.id}-${lineIndex}`} className="nav-tile-line">
                  {line.toLocaleUpperCase("en-US")}
                </span>
              ))}
            </span>
          </span>
        </MotionLink>
      </ViewTransition>
    </motion.div>
  );
}

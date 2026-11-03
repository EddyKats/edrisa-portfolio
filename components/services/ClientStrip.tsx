"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { serviceClientRows } from "@/data/clients";

const VISIBLE_SLOTS = 8;
const FADE_MS = 560;

type ClientLogo = { id: string; name: string; src: string };

// Presentation-only. Keeps wide wordmarks from filling the stage and lets compact marks use its height.
const logoScaleByName: Record<string, number> = {
  "hima cement": 0.92,
  prudential: 0.9,
  sumz: 1,
  hero: 0.78,
  totalenergies: 1,
  "kyogaro products": 0.84,
  kiboko: 0.72,
  welthungerhilfe: 0.96,
  lycamobile: 0.84,
  "idental care": 1,
  "cbs fm": 0.9,
};

function logoScale(name: string) {
  return logoScaleByName[name.trim().toLowerCase()] ?? 0.92;
}

function rotationPool(clients?: ClientLogo[]) {
  const listed =
    clients && clients.length > 0
      ? clients
      : serviceClientRows.flat().map((client) => ({ id: client.id, name: client.name, src: client.src }));
  const seen = new Set<string>();
  return listed.filter((client) => {
    const key = client.name.trim().toLowerCase();
    if (!key || key === "jotform" || seen.has(key)) return false;
    seen.add(key);
    return Boolean(client.src);
  });
}

function shuffle<T>(items: T[]) {
  const copy = items.slice();
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swap] as T;
    copy[swap] = current as T;
  }
  return copy;
}

export function ClientStrip({
  heading,
  clients,
}: {
  heading: string;
  clients?: ClientLogo[];
}) {
  const pool = useMemo(() => rotationPool(clients), [clients]);
  const slotCount = Math.min(VISIBLE_SLOTS, pool.length);
  const [slots, setSlots] = useState<string[]>(() => pool.slice(0, slotCount).map((client) => client.id));
  const [leaving, setLeaving] = useState<number[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const slotsRef = useRef(slots);
  const byId = useMemo(() => new Map(pool.map((client) => [client.id, client])), [pool]);

  useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);

  useEffect(() => {
    const node = sectionRef.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!node || motion.matches || pool.length <= slotCount) return;

    let cancelled = false;
    let running = false;
    let inView = false;
    let started = false;
    const timers = new Set<number>();

    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        if (!cancelled) fn();
      }, ms);
      timers.add(id);
    };

    const clearTimers = () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
    };

    const stop = () => {
      running = false;
      clearTimers();
      setLeaving([]);
    };

    const cycle = (first: boolean) => {
      if (cancelled || !running) return;
      const wait = first ? 1500 + Math.random() * 1000 : 2500 + Math.random() * 2000;
      later(() => {
        if (cancelled || !running) return;
        const current = slotsRef.current;
        const hidden = shuffle(pool.filter((client) => !current.includes(client.id)));
        const count = Math.min(hidden.length, current.length, 2 + Math.floor(Math.random() * 2));
        if (count === 0) {
          cycle(false);
          return;
        }
        const indexes = shuffle(current.map((_, index) => index)).slice(0, count);
        indexes.forEach((index, order) => {
          const next = hidden[order];
          if (!next) return;
          const delay = order * (100 + Math.random() * 100);
          later(() => {
            if (!running) return;
            setLeaving((previous) => (previous.includes(index) ? previous : [...previous, index]));
            later(() => {
              if (!running) return;
              setSlots((latest) => {
                if (latest.includes(next.id) || latest[index] === next.id) return latest;
                const copy = latest.slice();
                copy[index] = next.id;
                return copy;
              });
              setLeaving((previous) => previous.filter((item) => item !== index));
            }, FADE_MS);
          }, delay);
        });
        later(() => cycle(false), (count - 1) * 180 + FADE_MS);
      }, wait);
    };

    const sync = () => {
      const active = inView && document.visibilityState === "visible" && !motion.matches;
      if (active && !running) {
        running = true;
        const first = !started;
        started = true;
        cycle(first);
        return;
      }
      if (!active && running) stop();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.isIntersecting);
        sync();
      },
      { rootMargin: "160px 0px" },
    );
    observer.observe(node);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);

    return () => {
      cancelled = true;
      running = false;
      clearTimers();
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
    };
  }, [pool, slotCount]);

  return (
    <section ref={sectionRef} aria-labelledby="services-places-title" className="services-block">
      <h2 id="services-places-title" className="about-chapter-title">
        {heading}
      </h2>
      <ul className="client-wall">
        {slots.map((id, index) => {
          const client = byId.get(id);
          if (!client) return null;
          return (
            <li key={index}>
              <span className="client-wall-frame">
                <Image
                  key={client.id}
                  src={client.src}
                  alt={client.name}
                  width={240}
                  height={96}
                  sizes="(min-width: 64rem) 200px, 160px"
                  style={{ "--logo-scale": logoScale(client.name) } as CSSProperties}
                  className={leaving.includes(index) ? "client-wall-img is-leaving" : "client-wall-img"}
                />
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

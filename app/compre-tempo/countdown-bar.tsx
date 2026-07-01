"use client";

import { useEffect, useState } from "react";

type Remaining = {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function diff(target: number): Remaining {
  const total = Math.max(0, target - Date.now());
  const seconds = Math.floor(total / 1000) % 60;
  const minutes = Math.floor(total / (1000 * 60)) % 60;
  const hours = Math.floor(total / (1000 * 60 * 60)) % 24;
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { total, days, hours, minutes, seconds };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function Segment({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-serif text-2xl font-semibold leading-none text-[#FAF6EE] [font-variant-numeric:tabular-nums_lining-nums] sm:text-3xl">
        {pad(value)}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#9A7B4E]">
        {label}
      </span>
    </div>
  );
}

/**
 * Cronômetro regressivo até o prazo POR PESSOA (epoch ms), resolvido no
 * servidor a partir do token do link (48h do 1º acesso). Renderiza zeros até
 * montar (evita mismatch de hidratação) e avisa o pai quando expira via onExpire.
 */
export function CountdownBar({
  deadlineMs,
  onExpire,
}: {
  deadlineMs: number;
  onExpire: (expired: boolean) => void;
}) {
  const target = deadlineMs;
  const [remaining, setRemaining] = useState<Remaining>(() => ({
    total: 1,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  }));

  useEffect(() => {
    const tick = () => {
      const next = diff(target);
      setRemaining(next);
      onExpire(next.total <= 0);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target, onExpire]);

  // Estado inicial tem days:0 → server e 1º render do client batem (sem mismatch).
  const showDays = remaining.days > 0;

  return (
    <div className="sticky top-0 z-50 w-full border-b border-[#9A7B4E]/25 bg-[#0A0A0B]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0A0A0B]/80">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-1.5 px-4 py-3 sm:flex-row sm:justify-center sm:gap-4">
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#C9A877] sm:text-xs">
          Esta oportunidade expira em
        </span>
        <div
          className="flex items-start gap-5 sm:gap-7"
          aria-live="off"
          suppressHydrationWarning
        >
          {showDays && <Segment value={remaining.days} label="dias" />}
          <Segment value={remaining.hours} label="horas" />
          <Segment value={remaining.minutes} label="min" />
          <Segment value={remaining.seconds} label="seg" />
        </div>
      </div>
    </div>
  );
}

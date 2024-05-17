"use client";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Label } from "./ui/label";

export function Selector({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 pt-4">
      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label className="text-white whitespace-normal">{label}</Label>
            </div>
            <div className="grid gap-4">{children}</div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent
          align="start"
          className="w-[260px] text-sm whitespace-normal text-black"
          side="left"
        >
          {description}
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}

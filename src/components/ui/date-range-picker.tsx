"use client";

import * as React from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import "react-day-picker/style.css";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
  disabledBefore?: Date;
}

export function DateRangePicker({
  value,
  onChange,
  className,
  disabledBefore,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value?.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 text-slate-400" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "dd MMM yyyy")} – {format(value.to, "dd MMM yyyy")}
              </>
            ) : (
              format(value.from, "dd MMM yyyy")
            )
          ) : (
            <span>Select date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <DayPicker
          mode="range"
          selected={value}
          onSelect={(range) => {
            onChange(range);
            if (range?.from && range?.to) setOpen(false);
          }}
          numberOfMonths={2}
          disabled={disabledBefore ? { before: disabledBefore } : undefined}
          className="[--rdp-accent-color:theme(colors.primary.DEFAULT)]"
        />
      </PopoverContent>
    </Popover>
  );
}

"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "./utils";

const ChartContext = React.createContext<any>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: any;
    children: React.ReactNode;
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <div
      data-chart={chartId}
      ref={ref}
      className={cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-curve-recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle-recharts-tooltip-cursor]:stroke-border [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
        className
      )}
      {...props}
    >
      <ChartContext.Provider value={{ config }}>
        {children}
      </ChartContext.Provider>
    </div>
  );
});
ChartContainer.displayName = "ChartContainer";

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean;
    payload?: any[];
    className?: string;
    indicator?: "line" | "dot" | "dashed";
    hideLabel?: boolean;
    hideIndicator?: boolean;
    label?: string;
    labelFormatter?: (value: any) => string;
    labelClassName?: string;
    formatter?: (value: any, name: any) => React.ReactNode;
    color?: string;
    nameKey?: string;
    labelKey?: string;
  }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart();

    if (!active || !payload?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!hideLabel && (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter ? labelFormatter(label) : label}
          </div>
        )}
        <div className="grid gap-1.5">
          {payload.map((value: any, index: number) => (
            <div
              key={index}
              className={cn(
                "flex w-full flex-wrap items-center gap-2 [&>[svg]]:h-2.5 [&>[svg]]:w-2.5 [&>[svg]]:rounded-none",
                indicator === "dot" && "[&>[svg]]:rounded-full"
              )}
            >
              {formatter && typeof formatter(value.value, value.name) !== "string" ? (
                formatter(value.value, value.name)
              ) : (
                <>
                  {value.name && (
                    <span
                      className={cn("text-muted-foreground", {
                        "mr-2": !hideIndicator,
                      })}
                    >
                      {value.name}
                    </span>
                  )}
                  <span className="font-mono font-medium">
                    {value.value.toLocaleString()}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

export { ChartContainer, ChartTooltip, ChartTooltipContent, useChart };

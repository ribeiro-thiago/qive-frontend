"use client";

import * as React from "react";
import { Tabs, type Tab } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ProductPageProps = {
  title?: string;
  tabs: Tab[];
  defaultTab?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  className?: string;
  contentClassName?: string;
  toolbar?: React.ReactNode; // rendered below tabs, above content card
  render: (activeTab: string) => React.ReactNode;
};

export function ProductPage({
  title,
  tabs,
  defaultTab,
  value,
  onValueChange,
  className,
  contentClassName,
  toolbar,
  render,
}: ProductPageProps) {
  const [internal, setInternal] = React.useState<string>(defaultTab ?? tabs[0]?.id ?? "");
  const active = value ?? internal;
  const set = (v: string) => {
    onValueChange?.(v);
    if (value === undefined) setInternal(v);
  };

  return (
    <div className={cn(className)}>
      <div className="px-1 mt-5 mb-6">
        <Tabs tabs={tabs} value={active} onValueChange={set} variant="product" />
      </div>
      {toolbar && (
        <div className="px-1 mb-4">
          {toolbar}
        </div>
      )}
      <Card className="rounded-xl bg-white border border-border">
        {title && (
          <CardHeader>
            <CardTitle className="card-title">{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent className={contentClassName}>{render(active)}</CardContent>
      </Card>
    </div>
  );
}

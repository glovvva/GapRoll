"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function PayGapPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">
            Pay Gap Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
          <p className="text-muted-foreground">
            Fair Pay Line chart będzie tutaj
          </p>
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-8 py-12">
            <BarChart3 className="size-12 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">No data yet</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

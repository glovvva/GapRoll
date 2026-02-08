"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ReportPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">
            Art. 16 Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Quartile analysis będzie tutaj
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

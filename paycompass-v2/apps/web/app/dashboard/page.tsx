"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Scale, TrendingDown, Users } from "lucide-react";

const metrics = [
  { label: "Total Employees", value: "247", icon: Users },
  { label: "Pay Gap", value: "8.5%", icon: TrendingDown, destructive: true },
  { label: "EVG Groups", value: "12", icon: Scale },
  { label: "Reports", value: "3", icon: FileText },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">
            Welcome to PayCompass
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {metrics.map(({ label, value, icon: Icon, destructive }) => (
              <div
                key={label}
                className="rounded-lg bg-secondary p-4 transition-colors duration-200"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="size-5 shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <p
                  className={`mt-2 text-2xl font-semibold ${
                    destructive ? "text-destructive" : "text-foreground"
                  }`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

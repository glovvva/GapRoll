"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function EVGPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">
            EVG Job Scoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            AI Scoring interface będzie tutaj
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ApiStatus = {
  message: string;
  status: string;
  environment: string;
};

export default function Home() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    message: "-",
    status: "-",
    environment: "-",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApiStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rootRes, healthRes] = await Promise.all([
        fetch("/api/"),
        fetch("/api/health/"),
      ]);

      if (!rootRes.ok) throw new Error(`Root: ${rootRes.status}`);
      if (!healthRes.ok) throw new Error(`Health: ${healthRes.status}`);

      const root = (await rootRes.json()) as { message: string };
      const health = (await healthRes.json()) as {
        status: string;
        environment: string;
      };

      setApiStatus({
        message: root.message,
        status: health.status,
        environment: health.environment,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiStatus();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest-deep p-8">
      <Card className="max-w-2xl p-6">
        <CardHeader>
          <CardTitle className="text-text-primary">
            GapRoll - Full Stack Test
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-text-primary">
            Backend Status
          </h2>

          <div className="rounded border bg-forest-card p-4">
            <p className="font-mono text-primary">
              Root endpoint: {apiStatus.message}
            </p>
            <p className="font-mono text-green-500">
              Health status: {apiStatus.status}
            </p>
            <p className="font-mono text-text-secondary">
              Environment: {apiStatus.environment}
            </p>
          </div>

          {loading && (
            <p className="text-sm text-text-secondary">Loading...</p>
          )}

          {error && (
            <p className="text-destructive">{error}</p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="button" onClick={fetchApiStatus}>
            Refresh
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

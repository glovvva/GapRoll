"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function DataPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Data Upload</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground">
            CSV Upload będzie tutaj (migracja z Streamlit)
          </p>
          <Button disabled size="default">
            <Upload className="size-4" />
            Select File
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

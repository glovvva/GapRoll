import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

interface ExplainerCardProps {
  title: string;
  children: React.ReactNode;
  variant?: "default" | "info" | "warning";
}

export function ExplainerCard({
  title,
  children,
  variant = "default",
}: ExplainerCardProps) {
  const bgColors = {
    default: "bg-secondary/30",
    info: "bg-teal-primary/10 border-teal-primary/50",
    warning: "bg-yellow-500/10 border-yellow-500/50",
  };

  return (
    <Card className={bgColors[variant]}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">{children}</CardContent>
    </Card>
  );
}

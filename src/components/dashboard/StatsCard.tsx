import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning";
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = "default",
  className 
}: StatsCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "border-pastel-blue bg-pastel-blue-light";
      case "success":
        return "border-pastel-green bg-pastel-green-light";
      case "warning":
        return "border-pastel-orange bg-pastel-orange-light";
      default:
        return "border-pastel-purple bg-pastel-purple-light";
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case "primary":
        return "text-primary bg-primary/10";
      case "success":
        return "text-success bg-success/10";
      case "warning":
        return "text-warning bg-warning/10";
      default:
        return "text-muted-foreground bg-muted/50";
    }
  };

  return (
    <Card className={cn("shadow-medical hover:shadow-lg transition-all duration-200", getVariantStyles(), className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", getIconStyles())}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-foreground">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              <span className={cn(
                "font-medium",
                trend.isPositive ? "text-success" : "text-destructive"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
              <span className="text-muted-foreground">
                rispetto al mese scorso
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
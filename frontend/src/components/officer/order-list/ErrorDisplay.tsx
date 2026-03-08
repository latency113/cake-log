import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorDisplayProps {
  error: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-96">
        <CardContent className="pt-6">
          <div className="text-center text-red-500 mb-2">
            ⚠️ เกิดข้อผิดพลาด
          </div>
          <p className="text-center text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorDisplay;

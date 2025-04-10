import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface ContentCardProps {
  header: ReactNode;
  content: ReactNode;
}

export function ContentCard({ header, content }: ContentCardProps) {
  return (
    <Card className="h-full flex flex-col border-0 sm:border gap-2 py-0 md:py-4 overflow-hidden w-full">
      {header}
      <CardContent className="p-0 flex-1 min-h-0">{content}</CardContent>
    </Card>
  );
}

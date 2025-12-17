import type { IconType } from "react-icons";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ShapeToolProps {
  onClick: () => void;
  icon: LucideIcon | IconType;
  iconClassName?: string;
};

export const ShapeTool = ({
  onClick,
  icon: Icon,
  iconClassName
}: ShapeToolProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className="aspect-square h-20 w-full p-5"
    >
      <Icon className={cn("h-full w-full", iconClassName)} />
    </Button>
  );
};

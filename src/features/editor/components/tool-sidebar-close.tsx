import { ChevronsLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ToolSidebarCloseProps {
  onClick: () => void;
};

export const ToolSidebarClose = ({
  onClick,
}: ToolSidebarCloseProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={onClick}
      className="absolute -right-4 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-card shadow-sm"
    >
      <ChevronsLeft className="size-4" />
    </Button>
  );
};

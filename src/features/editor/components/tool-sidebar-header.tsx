import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ToolSidebarHeaderProps {
  title: string;
  description?: string;
};

export const ToolSidebarHeader = ({
  title,
  description
}: ToolSidebarHeaderProps) => {
  return (
    <CardHeader className="p-4 border-b space-y-1 h-[68px]">
      <CardTitle className="text-sm font-medium">
        {title}
      </CardTitle>
      {description && (
        <CardDescription className="text-xs">
          {description}
        </CardDescription>
      )}
    </CardHeader>
  );
};

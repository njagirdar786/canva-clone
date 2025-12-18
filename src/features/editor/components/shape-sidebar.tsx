import { Circle, Diamond, Square, SquareDashedBottom, Triangle } from "lucide-react";

import { ActiveTool, Editor } from "@/features/editor/types";
import { ShapeTool } from "@/features/editor/components/shape-tool";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ShapeSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const ShapeSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: ShapeSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-card relative z-[40] w-[360px] h-full flex flex-col rounded-md border shadow-sm",
        activeTool === "shapes" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Shapes"
        description="Add shapes to your canvas"
      />
      <ScrollArea>
        <div className="grid grid-cols-3 gap-4 p-4">
          <ShapeTool
            onClick={() => editor?.addCircle()}
            icon={Circle}
          />
          <ShapeTool
            onClick={() => editor?.addSoftRectangle()}
            icon={SquareDashedBottom}
          />
          <ShapeTool
            onClick={() => editor?.addRectangle()}
            icon={Square}
          />
          <ShapeTool
            onClick={() => editor?.addTriangle()}
            icon={Triangle}
          />
          <ShapeTool
            onClick={() => editor?.addInverseTriangle()}
            icon={Triangle}
            iconClassName="rotate-180"
          />
          <ShapeTool
            onClick={() => editor?.addDiamond()}
            icon={Diamond}
          />
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};

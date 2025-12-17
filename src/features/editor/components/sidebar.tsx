"use client";

import { 
  LayoutTemplate,
  ImageIcon,
  Pencil,
  Settings,
  Shapes,
  Type,
} from "lucide-react";

import { ActiveTool } from "@/features/editor/types";
import { SidebarItem } from "@/features/editor/components/sidebar-item";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const Sidebar = ({
  activeTool,
  onChangeActiveTool,
}: SidebarProps) => {
  return (
    <Card className="h-full w-[96px] shrink-0 rounded-md border bg-card shadow-sm">
      <CardContent className="h-full p-0">
        <ScrollArea className="h-full">
          <aside className="flex flex-col">
            <ul className="flex flex-col gap-2 p-2">
              <SidebarItem
                icon={LayoutTemplate}
                label="Design"
                isActive={activeTool === "templates"}
                onClick={() => onChangeActiveTool("templates")}
              />
              <SidebarItem
                icon={ImageIcon}
                label="Image"
                isActive={activeTool === "images"}
                onClick={() => onChangeActiveTool("images")}
              />
              <SidebarItem
                icon={Type}
                label="Text"
                isActive={activeTool === "text"}
                onClick={() => onChangeActiveTool("text")}
              />
              <SidebarItem
                icon={Shapes}
                label="Shapes"
                isActive={activeTool === "shapes"}
                onClick={() => onChangeActiveTool("shapes")}
              />
              <SidebarItem
                icon={Pencil}
                label="Draw"
                isActive={activeTool === "draw"}
                onClick={() => onChangeActiveTool("draw")}
              />
              <SidebarItem
                icon={Settings}
                label="Settings"
                isActive={activeTool === "settings"}
                onClick={() => onChangeActiveTool("settings")}
              />
            </ul>
          </aside>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

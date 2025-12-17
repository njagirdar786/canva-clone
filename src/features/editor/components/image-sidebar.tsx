import { useRef, type ChangeEvent } from "react";
import { Upload } from "lucide-react";

import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const ImageSidebar = ({ editor, activeTool, onChangeActiveTool }: ImageSidebarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onPickFile = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        editor?.addImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <aside
      className={cn(
        "bg-card relative z-[40] w-[360px] h-full flex flex-col rounded-md border shadow-sm",
        activeTool === "images" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader title="Images" description="Add images to your canvas" />
      <div className="p-4 border-b">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />
        <Button
          type="button"
          className="w-full text-sm font-medium"
          onClick={onPickFile}
        >
          <Upload className="mr-2 size-4" />
          Upload Image
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Images stay in your browser and are not uploaded.
        </p>
      </div>
      <div className="flex-1" />
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};

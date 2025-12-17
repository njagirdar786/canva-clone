import Image from "next/image";
import { Loader } from "lucide-react";
import { useState } from "react";

import { 
  ActiveTool, 
  Editor,
} from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConfirm } from "@/hooks/use-confirm";
import { EditorTemplate, editorTemplates } from "@/data/editor-templates";

interface TemplateSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const TemplateSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: TemplateSidebarProps) => {
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to replace the current project with this template."
  );
  const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const loadTemplate = async (template: EditorTemplate) => {
    const ok = await confirm();

    if (!ok) {
      return;
    }

    setLoadingTemplateId(template.id);
    setLoadError(false);

    try {
      const response = await fetch(template.jsonUrl);

      if (!response.ok) {
        throw new Error("Failed to load template");
      }

      const json = await response.text();
      editor?.loadJson(json);
    } catch (error) {
      console.error(error);
      setLoadError(true);
    } finally {
      setLoadingTemplateId(null);
    }
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "templates" ? "visible" : "hidden",
      )}
    >
      <ConfirmDialog />
      <ToolSidebarHeader
        title="Templates"
        description="Choose from a variety of templates to get started"
      />
      {loadError && (
        <p className="px-4 pt-2 text-xs text-red-500">
          Failed to load template. Please try again.
        </p>
      )}
      <ScrollArea>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {editorTemplates.map((template) => {
              const isLoading = loadingTemplateId === template.id;

              return (
                <button
                  style={{ 
                    aspectRatio: `${template.width}/${template.height}`
                  }}
                  onClick={() => loadTemplate(template)}
                  key={template.id}
                  disabled={isLoading}
                  className="relative w-full group hover:opacity-75 transition bg-muted rounded-sm overflow-hidden border disabled:opacity-60"
                >
                  <Image
                    fill
                    src={template.thumbnailUrl}
                    alt={template.name}
                    className="object-cover"
                  />
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader className="size-4 text-white animate-spin" />
                    </div>
                  )}
                  <div
                    className="opacity-0 group-hover:opacity-100 absolute left-0 bottom-0 w-full text-[10px] truncate text-white p-1 bg-black/50 text-left"
                  >
                    {template.name}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};

"use client";

import { fabric } from "fabric";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  ActiveTool,
  selectionDependentTools,
} from "@/features/editor/types";
import { Navbar } from "@/features/editor/components/navbar";
import { Footer } from "@/features/editor/components/footer";
import { useEditor } from "@/features/editor/hooks/use-editor";
import { Sidebar } from "@/features/editor/components/sidebar";
import { Toolbar } from "@/features/editor/components/toolbar";
import { ShapeSidebar } from "@/features/editor/components/shape-sidebar";
import { FillColorSidebar } from "@/features/editor/components/fill-color-sidebar";
import { StrokeColorSidebar } from "@/features/editor/components/stroke-color-sidebar";
import { StrokeWidthSidebar } from "@/features/editor/components/stroke-width-sidebar";
import { OpacitySidebar } from "@/features/editor/components/opacity-sidebar";
import { TextSidebar } from "@/features/editor/components/text-sidebar";
import { FontSidebar } from "@/features/editor/components/font-sidebar";
import { ImageSidebar } from "@/features/editor/components/image-sidebar";
import { FilterSidebar } from "@/features/editor/components/filter-sidebar";
import { DrawSidebar } from "@/features/editor/components/draw-sidebar";
import { TemplateSidebar } from "@/features/editor/components/template-sidebar";
import { SettingsSidebar } from "@/features/editor/components/settings-sidebar";
import { Rulers } from "@/features/editor/components/rulers";
import { useGuidelines } from "@/features/editor/hooks/use-guidelines";

interface EditorInitialData {
  json?: string;
  width: number;
  height: number;
}

interface EditorProps {
  initialData: EditorInitialData;
};

export const Editor = ({ initialData }: EditorProps) => {
  const [activeTool, setActiveTool] = useState<ActiveTool>("text");
  const [showRulers, setShowRulers] = useState(false);

  const onClearSelection = useCallback(() => {
    if (selectionDependentTools.includes(activeTool)) {
      setActiveTool("select");
    }
  }, [activeTool]);

  const { init, editor } = useEditor({
    defaultState: initialData.json,
    defaultWidth: initialData.width,
    defaultHeight: initialData.height,
    clearSelectionCallback: onClearSelection,
  });

  const onChangeActiveTool = useCallback((tool: ActiveTool) => {
    if (tool === "draw") {
      editor?.enableDrawingMode();
    }

    if (activeTool === "draw") {
      editor?.disableDrawingMode();
    }

    if (tool === activeTool) {
      return setActiveTool("select");
    }

    setActiveTool(tool);
  }, [activeTool, editor]);

  const canvasRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGuidelines({
    canvas: editor?.canvas ?? null,
    enabled: showRulers,
  });

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      controlsAboveOverlay: true,
      preserveObjectStacking: true,
    });

    init({
      initialCanvas: canvas,
      initialContainer: containerRef.current!,
    });

    return () => {
      canvas.dispose();
    };
  }, [init]);

  return (
    <div className="h-full w-full bg-muted/40">
      <div className="flex h-full flex-col gap-2 p-4">
        <Navbar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
          showRulers={showRulers}
          onToggleRulers={() => setShowRulers((v) => !v)}
        />
        <div className="flex flex-1 gap-2 overflow-hidden min-h-0">
          <Sidebar
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
          />
          <ShapeSidebar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
          />
          <FillColorSidebar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
          />
          <StrokeColorSidebar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
          />
          <StrokeWidthSidebar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
          />
          <OpacitySidebar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
          />
          <TextSidebar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
          />
          <FontSidebar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
          />
          <ImageSidebar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
          />
          <TemplateSidebar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
          />
          <FilterSidebar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
          />
          <DrawSidebar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
          />
          <SettingsSidebar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
            showRulers={showRulers}
            onToggleRulers={() => setShowRulers((v) => !v)}
          />
          <main className="flex flex-1 flex-col gap-4 overflow-hidden min-h-0">
            <Toolbar
              editor={editor}
              activeTool={activeTool}
              onChangeActiveTool={onChangeActiveTool}
              key={JSON.stringify(editor?.canvas.getActiveObject())}
            />
            <div className="flex-1 min-h-0 overflow-hidden ">
              <div
                className="h-full w-full grid grid-cols-[var(--ruler-size),1fr] grid-rows-[var(--ruler-size),1fr]"
                style={{ "--ruler-size": showRulers ? "24px" : "0px" } as React.CSSProperties}
              >
                <div
                  className="col-start-1 row-start-1 bg-card border-b border-r border-border"
                  style={{ visibility: showRulers ? "visible" : "hidden" }}
                />
                <Rulers
                  canvas={editor?.canvas ?? null}
                  containerRef={containerRef}
                  thickness={showRulers ? 24 : 0}
                />
                <div className="col-start-2 row-start-2 h-full w-full relative" ref={containerRef}>
                  <canvas ref={canvasRef} />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Footer editor={editor} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

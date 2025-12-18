import { fabric } from "fabric";
import { useEffect } from "react";

type UseGuidelinesProps = {
  canvas: fabric.Canvas | null;
  enabled: boolean;
};

type VerticalLine = { x: number; y1: number; y2: number };
type HorizontalLine = { y: number; x1: number; x2: number };

type CandidateV = { x: number; rect: { left: number; top: number; width: number; height: number } };
type CandidateH = { y: number; rect: { left: number; top: number; width: number; height: number } };

const getWorkspaceObject = (canvas: fabric.Canvas) =>
  canvas.getObjects().find((o) => o.name === "clip");

const getObjectRect = (object: fabric.Object) => {
  try {
    return object.getBoundingRect(true);
  } catch {
    return object.getBoundingRect();
  }
};

const isInRange = (value1: number, value2: number, margin: number) => {
  return Math.abs(value1 - value2) <= margin;
};

export const useGuidelines = ({ canvas, enabled }: UseGuidelinesProps) => {
  useEffect(() => {
    if (!canvas || !enabled) return;

    const ctx = canvas.getSelectionContext();
    const aligningLineOffsetPx = 6;
    const aligningLineMarginPx = 5;
    const aligningLineWidth = 1;
    const aligningLineColor = "rgba(239, 68, 68, 0.95)";

    let viewportTransform: number[] | undefined;
    const verticalLines: VerticalLine[] = [];
    const horizontalLines: HorizontalLine[] = [];

    const clearTop = () => {
      const topCtx = (canvas as any).contextTop as CanvasRenderingContext2D | undefined;
      if (!topCtx) return;
      (canvas as any).clearContext(topCtx);
    };

    const toScreenX = (x: number) => {
      if (!viewportTransform) return x;
      return x * viewportTransform[0] + viewportTransform[4];
    };

    const toScreenY = (y: number) => {
      if (!viewportTransform) return y;
      return y * viewportTransform[3] + viewportTransform[5];
    };

    const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
      ctx.save();
      ctx.lineWidth = aligningLineWidth;
      ctx.strokeStyle = aligningLineColor;
      ctx.beginPath();
      ctx.moveTo(toScreenX(x1) + 0.5, toScreenY(y1) + 0.5);
      ctx.lineTo(toScreenX(x2) + 0.5, toScreenY(y2) + 0.5);
      ctx.stroke();
      ctx.restore();
    };

    const onMouseDown = () => {
      viewportTransform = canvas.viewportTransform?.slice() as unknown as number[] | undefined;
    };

    const onBeforeRender = () => {
      clearTop();
    };

    const onAfterRender = () => {
      for (let i = verticalLines.length - 1; i >= 0; i--) {
        const line = verticalLines[i];
        drawLine(line.x, line.y1, line.x, line.y2);
      }
      for (let i = horizontalLines.length - 1; i >= 0; i--) {
        const line = horizontalLines[i];
        drawLine(line.x1, line.y, line.x2, line.y);
      }

      verticalLines.length = 0;
      horizontalLines.length = 0;
    };

    const onObjectMoving = (e: fabric.IEvent<Event>) => {
      const activeObject = e.target;
      if (!activeObject) return;
      if (!activeObject.selectable) return;
      if (activeObject.name === "clip") return;

      const transform = (canvas as any)._currentTransform;
      if (!transform) return;

      const localVpt = canvas.viewportTransform;
      if (!localVpt) return;
      viewportTransform = localVpt;

      const localZoom = canvas.getZoom() || 1;

      // Hold Alt to temporarily bypass snapping (escape hatch)
      const nativeEvent = (e as any).e as MouseEvent | undefined;
      if (nativeEvent?.altKey) {
        verticalLines.length = 0;
        horizontalLines.length = 0;
        return;
      }

      const margin = aligningLineMarginPx / localZoom;
      const offset = aligningLineOffsetPx / localZoom;

      const workspace = getWorkspaceObject(canvas);
      const workspaceRect = workspace ? getObjectRect(workspace) : null;

      const activeRect = getObjectRect(activeObject);
      const activeCenter = activeObject.getCenterPoint();

      const activeLeft = activeRect.left;
      const activeRight = activeRect.left + activeRect.width;
      const activeTop = activeRect.top;
      const activeBottom = activeRect.top + activeRect.height;

      const workspaceXPoints = [
        { value: activeLeft, delta: (x: number) => x - activeLeft },
        { value: activeCenter.x, delta: (x: number) => x - activeCenter.x },
        { value: activeRight, delta: (x: number) => x - activeRight },
      ];
      const workspaceYPoints = [
        { value: activeTop, delta: (y: number) => y - activeTop },
        { value: activeCenter.y, delta: (y: number) => y - activeCenter.y },
        { value: activeBottom, delta: (y: number) => y - activeBottom },
      ];

      // For object-to-object alignment, prefer center-to-center only.
      const objectXPoints = [{ value: activeCenter.x, delta: (x: number) => x - activeCenter.x }];
      const objectYPoints = [{ value: activeCenter.y, delta: (y: number) => y - activeCenter.y }];

      const candidatesV: Array<CandidateV & { kind: "workspace" | "object" }> = [];
      const candidatesH: Array<CandidateH & { kind: "workspace" | "object" }> = [];

      if (workspaceRect) {
        candidatesV.push(
          { kind: "workspace", x: workspaceRect.left, rect: workspaceRect },
          { kind: "workspace", x: workspaceRect.left + workspaceRect.width / 2, rect: workspaceRect },
          { kind: "workspace", x: workspaceRect.left + workspaceRect.width, rect: workspaceRect },
        );
        candidatesH.push(
          { kind: "workspace", y: workspaceRect.top, rect: workspaceRect },
          { kind: "workspace", y: workspaceRect.top + workspaceRect.height / 2, rect: workspaceRect },
          { kind: "workspace", y: workspaceRect.top + workspaceRect.height, rect: workspaceRect },
        );
      }

      const canvasObjects = canvas.getObjects();
      for (let i = 0; i < canvasObjects.length; i++) {
        const object = canvasObjects[i];
        if (object === activeObject) continue;
        if (!object.selectable) continue;
        if (!object.visible) continue;
        if (object.name === "clip") continue;

        const rect = getObjectRect(object);
        const center = object.getCenterPoint();

        // Object-to-object alignment uses center lines (not edges) to avoid "top edge" snapping.
        candidatesV.push({ kind: "object", x: center.x, rect });
        candidatesH.push({ kind: "object", y: center.y, rect });
      }

      let bestX: { dx: number; x: number; rect: CandidateV["rect"] } | null = null;
      for (let i = 0; i < candidatesV.length; i++) {
        const candidate = candidatesV[i];
        const points = candidate.kind === "object" ? objectXPoints : workspaceXPoints;
        for (let j = 0; j < points.length; j++) {
          const dx = points[j].delta(candidate.x);
          if (!isInRange(candidate.x, points[j].value, margin)) continue;
          if (!bestX || Math.abs(dx) < Math.abs(bestX.dx)) {
            bestX = { dx, x: candidate.x, rect: candidate.rect };
          }
        }
      }

      let bestY: { dy: number; y: number; rect: CandidateH["rect"] } | null = null;
      for (let i = 0; i < candidatesH.length; i++) {
        const candidate = candidatesH[i];
        const points = candidate.kind === "object" ? objectYPoints : workspaceYPoints;
        for (let j = 0; j < points.length; j++) {
          const dy = points[j].delta(candidate.y);
          if (!isInRange(candidate.y, points[j].value, margin)) continue;
          if (!bestY || Math.abs(dy) < Math.abs(bestY.dy)) {
            bestY = { dy, y: candidate.y, rect: candidate.rect };
          }
        }
      }

      verticalLines.length = 0;
      horizontalLines.length = 0;

      const nextCenterX = bestX ? activeCenter.x + bestX.dx : activeCenter.x;
      const nextCenterY = bestY ? activeCenter.y + bestY.dy : activeCenter.y;

      if (bestX || bestY) {
        activeObject.setPositionByOrigin(new fabric.Point(nextCenterX, nextCenterY), "center", "center");
        activeObject.setCoords();
      }

      if (bestX) {
        const activeRectAfter = getObjectRect(activeObject);
        const y1 = Math.min(bestX.rect.top, activeRectAfter.top) - offset;
        const y2 = Math.max(bestX.rect.top + bestX.rect.height, activeRectAfter.top + activeRectAfter.height) + offset;
        verticalLines.push({ x: bestX.x, y1, y2 });
      }

      if (bestY) {
        const activeRectAfter = getObjectRect(activeObject);
        const x1 = Math.min(bestY.rect.left, activeRectAfter.left) - offset;
        const x2 = Math.max(bestY.rect.left + bestY.rect.width, activeRectAfter.left + activeRectAfter.width) + offset;
        horizontalLines.push({ y: bestY.y, x1, x2 });
      }
    };

    const onMouseUp = () => {
      verticalLines.length = 0;
      horizontalLines.length = 0;
      clearTop();
      canvas.requestRenderAll();
    };

    canvas.on("mouse:down", onMouseDown);
    canvas.on("before:render", onBeforeRender);
    canvas.on("after:render", onAfterRender);
    canvas.on("object:moving", onObjectMoving);
    canvas.on("mouse:up", onMouseUp);

    return () => {
      canvas.off("mouse:down", onMouseDown);
      canvas.off("before:render", onBeforeRender);
      canvas.off("after:render", onAfterRender);
      canvas.off("object:moving", onObjectMoving);
      canvas.off("mouse:up", onMouseUp);
      verticalLines.length = 0;
      horizontalLines.length = 0;
      clearTop();
      canvas.requestRenderAll();
    };
  }, [canvas, enabled]);
};

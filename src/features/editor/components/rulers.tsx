"use client";

import { fabric } from "fabric";
import type { RefObject } from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";

type RulersProps = {
  canvas: fabric.Canvas | null;
  containerRef: RefObject<HTMLDivElement | null>;
  thickness?: number;
};

const EPSILON = 1e-6;

const niceStep = (raw: number) => {
  if (!isFinite(raw) || raw <= 0) return 1;

  const exponent = Math.floor(Math.log10(raw));
  const fraction = raw / Math.pow(10, exponent);

  let niceFraction = 1;
  if (fraction < 1.5) niceFraction = 1;
  else if (fraction < 3) niceFraction = 2;
  else if (fraction < 7) niceFraction = 5;
  else niceFraction = 10;

  return niceFraction * Math.pow(10, exponent);
};

const isMultiple = (value: number, step: number) => {
  if (step === 0) return false;
  const ratio = value / step;
  return Math.abs(ratio - Math.round(ratio)) < 1e-4;
};

const setupHiDPICanvas = (
  el: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number,
) => {
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.floor(cssWidth * dpr));
  const height = Math.max(1, Math.floor(cssHeight * dpr));

  if (el.width !== width) el.width = width;
  if (el.height !== height) el.height = height;

  el.style.width = `${cssWidth}px`;
  el.style.height = `${cssHeight}px`;

  const ctx = el.getContext("2d");
  if (!ctx) return null;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
};

export const Rulers = ({ canvas, containerRef, thickness = 24 }: RulersProps) => {
  const topRef = useRef<HTMLCanvasElement | null>(null);
  const leftRef = useRef<HTMLCanvasElement | null>(null);

  const getWorkspaceRect = useCallback(() => {
    if (!canvas) return null;
    const workspace = canvas.getObjects().find((o) => o.name === "clip");
    if (!workspace) return null;

    try {
      return workspace.getBoundingRect(true);
    } catch {
      return workspace.getBoundingRect();
    }
  }, [canvas]);

  const draw = useCallback(() => {
    if (!canvas) return;
    const container = containerRef.current;
    if (!container) return;

    const vpt = canvas.viewportTransform;
    if (!vpt) return;

    const scaleX = vpt[0] || 1;
    const scaleY = vpt[3] || 1;
    const offsetX = vpt[4] || 0;
    const offsetY = vpt[5] || 0;

    const workspaceRect = getWorkspaceRect();
    if (!workspaceRect) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const topEl = topRef.current;
    const leftEl = leftRef.current;
    if (!topEl || !leftEl) return;

    const topCtx = setupHiDPICanvas(topEl, width, thickness);
    const leftCtx = setupHiDPICanvas(leftEl, thickness, height);
    if (!topCtx || !leftCtx) return;

    const tickColor = "rgba(100, 116, 139, 0.9)";
    const textColor = "rgba(100, 116, 139, 0.9)";
    const minorColor = "rgba(100, 116, 139, 0.55)";

    const worldPerPxX = 1 / Math.max(EPSILON, scaleX);
    const worldPerPxY = 1 / Math.max(EPSILON, scaleY);

    const majorStepX = niceStep(worldPerPxX * 80);
    const minorStepX = majorStepX / 10;
    const majorStepY = niceStep(worldPerPxY * 80);
    const minorStepY = majorStepY / 10;

    // Horizontal ruler
    {
      topCtx.clearRect(0, 0, width, thickness);
      topCtx.font = "11px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
      topCtx.textBaseline = "top";

      const startWorld = (0 - offsetX) * worldPerPxX;
      const endWorld = (width - offsetX) * worldPerPxX;

      const startRel = startWorld - workspaceRect.left;
      const endRel = endWorld - workspaceRect.left;

      const tickStart = Math.floor(startRel / minorStepX) * minorStepX;
      const tickEnd = Math.ceil(endRel / minorStepX) * minorStepX;

      for (let value = tickStart; value <= tickEnd + EPSILON; value += minorStepX) {
        const worldX = workspaceRect.left + value;
        const screenX = worldX * scaleX + offsetX;
        if (screenX < -1 || screenX > width + 1) continue;

        const isMajor = isMultiple(value, majorStepX);
        const isMid = !isMajor && isMultiple(value, majorStepX / 2);
        const tickLen = isMajor ? thickness * 0.55 : isMid ? thickness * 0.4 : thickness * 0.25;

        topCtx.beginPath();
        topCtx.strokeStyle = isMajor ? tickColor : minorColor;
        topCtx.moveTo(Math.round(screenX) + 0.5, thickness);
        topCtx.lineTo(Math.round(screenX) + 0.5, thickness - tickLen);
        topCtx.stroke();

        if (isMajor) {
          topCtx.fillStyle = textColor;
          const label = `${Math.round(value)}`;
          topCtx.fillText(label, Math.round(screenX) + 2, 2);
        }
      }
    }

    // Vertical ruler
    {
      leftCtx.clearRect(0, 0, thickness, height);
      leftCtx.font = "11px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
      leftCtx.textBaseline = "top";

      const startWorld = (0 - offsetY) * worldPerPxY;
      const endWorld = (height - offsetY) * worldPerPxY;

      const startRel = startWorld - workspaceRect.top;
      const endRel = endWorld - workspaceRect.top;

      const tickStart = Math.floor(startRel / minorStepY) * minorStepY;
      const tickEnd = Math.ceil(endRel / minorStepY) * minorStepY;

      for (let value = tickStart; value <= tickEnd + EPSILON; value += minorStepY) {
        const worldY = workspaceRect.top + value;
        const screenY = worldY * scaleY + offsetY;
        if (screenY < -1 || screenY > height + 1) continue;

        const isMajor = isMultiple(value, majorStepY);
        const isMid = !isMajor && isMultiple(value, majorStepY / 2);
        const tickLen = isMajor ? thickness * 0.55 : isMid ? thickness * 0.4 : thickness * 0.25;

        leftCtx.beginPath();
        leftCtx.strokeStyle = isMajor ? tickColor : minorColor;
        leftCtx.moveTo(thickness, Math.round(screenY) + 0.5);
        leftCtx.lineTo(thickness - tickLen, Math.round(screenY) + 0.5);
        leftCtx.stroke();

        if (isMajor) {
          leftCtx.save();
          leftCtx.fillStyle = textColor;
          leftCtx.translate(2, Math.round(screenY) + 2);
          leftCtx.rotate(-Math.PI / 2);
          const label = `${Math.round(value)}`;
          leftCtx.fillText(label, 0, 0);
          leftCtx.restore();
        }
      }
    }
  }, [canvas, containerRef, getWorkspaceRect, thickness]);

  const handlers = useMemo(() => {
    return {
      onAfterRender: () => draw(),
    };
  }, [draw]);

  useEffect(() => {
    if (!canvas) return;
    canvas.on("after:render", handlers.onAfterRender);
    draw();
    return () => {
      canvas.off("after:render", handlers.onAfterRender);
    };
  }, [canvas, draw, handlers]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => draw());
    observer.observe(container);

    return () => observer.disconnect();
  }, [containerRef, draw]);

  return (
    <>
      <canvas
        ref={topRef}
        className="col-start-2 row-start-1 bg-card border-b border-border"
        aria-hidden="true"
      />
      <canvas
        ref={leftRef}
        className="col-start-1 row-start-2 bg-card border-r border-border"
        aria-hidden="true"
      />
    </>
  );
};

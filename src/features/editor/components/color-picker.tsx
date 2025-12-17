import { RgbaColorPicker } from "react-colorful";
import type { RgbaColor } from "react-colorful";

import { colors } from "@/features/editor/types";
import { rgbaObjectToString } from "@/features/editor/utils";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
};

export const ColorPicker = ({
  value,
  onChange,
}: ColorPickerProps) => {
  const toRgba = (input: string): RgbaColor => {
    const safeDefault = { r: 0, g: 0, b: 0, a: 1 };

    if (!input) {
      return safeDefault;
    }

    if (input === "transparent") {
      return { r: 0, g: 0, b: 0, a: 0 };
    }

    if (input.startsWith("#")) {
      const hex = input.replace("#", "");
      const isShort = hex.length === 3 || hex.length === 4;
      const normalized = isShort
        ? hex.split("").map((char) => `${char}${char}`).join("")
        : hex;

      if (normalized.length !== 6 && normalized.length !== 8) {
        return safeDefault;
      }

      const r = parseInt(normalized.slice(0, 2), 16);
      const g = parseInt(normalized.slice(2, 4), 16);
      const b = parseInt(normalized.slice(4, 6), 16);
      const a = normalized.length === 8
        ? parseInt(normalized.slice(6, 8), 16) / 255
        : 1;

      return { r, g, b, a };
    }

    const match = input.match(/rgba?\(([^)]+)\)/i);
    if (!match) {
      return safeDefault;
    }

    const parts = match[1].split(",").map((part) => part.trim());
    const [r, g, b, a] = parts;

    const parsed = {
      r: Number(r),
      g: Number(g),
      b: Number(b),
      a: a === undefined ? 1 : Number(a),
    };

    if ([parsed.r, parsed.g, parsed.b, parsed.a].some(Number.isNaN)) {
      return safeDefault;
    }

    return parsed;
  };

  const onColorChange = (color: RgbaColor) => {
    onChange(rgbaObjectToString(color));
  };

  return (
    <div className="w-full space-y-4">
      <RgbaColorPicker
        color={toRgba(value)}
        onChange={onColorChange}
        className="w-full"
      />
      <div className="grid grid-cols-6 gap-2">
        {colors.map((color) => {
          const isTransparent = color === "transparent";

          return (
            <button
              key={color}
              type="button"
              onClick={() => onChange(rgbaObjectToString(toRgba(color)))}
              className={cn(
                "h-7 w-7 rounded-full border transition hover:scale-105",
                isTransparent && "border-dashed"
              )}
              style={{
                backgroundColor: isTransparent ? "transparent" : color,
                backgroundImage: isTransparent
                  ? "linear-gradient(45deg, #cbd5f5 25%, transparent 25%, transparent 75%, #cbd5f5 75%, #cbd5f5), linear-gradient(45deg, #cbd5f5 25%, transparent 25%, transparent 75%, #cbd5f5 75%, #cbd5f5)"
                  : undefined,
                backgroundSize: isTransparent ? "8px 8px" : undefined,
                backgroundPosition: isTransparent ? "0 0, 4px 4px" : undefined,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

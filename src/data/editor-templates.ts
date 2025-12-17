export type EditorTemplate = {
  id: string;
  name: string;
  width: number;
  height: number;
  thumbnailUrl: string;
  jsonUrl: string;
};

export const DEFAULT_CANVAS_SIZE = {
  width: 1920,
  height: 1080,
};

export const editorTemplates: EditorTemplate[] = [
  {
    id: "car-sale",
    name: "Car Sale",
    width: 900,
    height: 1200,
    thumbnailUrl: "/car_sale.png",
    jsonUrl: "/car_sale.json",
  },
  {
    id: "coming-soon",
    name: "Coming Soon",
    width: 900,
    height: 1200,
    thumbnailUrl: "/coming_soon.png",
    jsonUrl: "/coming_soon.json",
  },
  {
    id: "flash-sale",
    name: "Flash Sale",
    width: 900,
    height: 1200,
    thumbnailUrl: "/flash_sale.png",
    jsonUrl: "/flash_sale.json",
  },
  {
    id: "travel",
    name: "Travel",
    width: 900,
    height: 1200,
    thumbnailUrl: "/travel.png",
    jsonUrl: "/travel.json",
  },
];

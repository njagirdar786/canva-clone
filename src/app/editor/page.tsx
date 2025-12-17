import { Editor } from "@/features/editor/components/editor";
import { DEFAULT_CANVAS_SIZE } from "@/data/editor-templates";

export default function EditorPage() {
  return (
    <Editor
      initialData={{
        width: DEFAULT_CANVAS_SIZE.width,
        height: DEFAULT_CANVAS_SIZE.height,
      }}
    />
  );
}

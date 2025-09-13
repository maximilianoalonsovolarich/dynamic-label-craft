import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Rect, Textbox, Image as FabricImage } from "fabric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Type, 
  Square, 
  Image, 
  Download, 
  RotateCcw,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight
} from "lucide-react";
import { toast } from "sonner";

interface LabelEditorProps {
  data: Record<string, any>[];
  selectedRow: number;
  onVariablesChange: (variables: string[]) => void;
}

export const LabelEditor = ({ data, selectedRow, onVariablesChange }: LabelEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#000000");
  const [variables, setVariables] = useState<string[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 600,
      height: 400,
      backgroundColor: "#ffffff",
    });

    // Add grid background
    const gridSize = 20;
    for (let i = 0; i < canvas.width! / gridSize; i++) {
      canvas.add(new Rect({
        left: i * gridSize,
        top: 0,
        width: 1,
        height: canvas.height!,
        fill: '#f0f0f0',
        selectable: false,
        evented: false,
      }));
    }

    for (let i = 0; i < canvas.height! / gridSize; i++) {
      canvas.add(new Rect({
        left: 0,
        top: i * gridSize,
        width: canvas.width!,
        height: 1,
        fill: '#f0f0f0',
        selectable: false,
        evented: false,
      }));
    }

    setFabricCanvas(canvas);
    toast("Editor listo para crear etiquetas!");

    return () => {
      canvas.dispose();
    };
  }, []);

  const addText = () => {
    if (!fabricCanvas) return;

    const text = new Textbox("{{texto}}", {
      left: 50,
      top: 50,
      fill: activeColor,
      fontSize: 20,
      fontFamily: 'Arial',
      width: 200,
    });

    fabricCanvas.add(text);
    updateVariables();
    toast("Texto agregado!");
  };

  const addRectangle = () => {
    if (!fabricCanvas) return;

    const rect = new Rect({
      left: 100,
      top: 100,
      fill: activeColor,
      width: 100,
      height: 80,
    });

    fabricCanvas.add(rect);
    toast("Rectángulo agregado!");
  };

  const addVariable = (varName: string) => {
    if (!fabricCanvas) return;

    const text = new Textbox(`{{${varName}}}`, {
      left: 50,
      top: 50,
      fill: activeColor,
      fontSize: 16,
      fontFamily: 'Arial',
      width: 150,
    });

    fabricCanvas.add(text);
    updateVariables();
    toast(`Variable {{${varName}}} agregada!`);
  };

  const updateVariables = () => {
    if (!fabricCanvas) return;

    const foundVariables: string[] = [];
    fabricCanvas.getObjects().forEach((obj) => {
      if (obj.type === 'textbox') {
        const textObj = obj as Textbox;
        const text = textObj.text || '';
        const matches = text.match(/\{\{([^}]+)\}\}/g);
        if (matches) {
          matches.forEach(match => {
            const varName = match.replace(/[{}]/g, '');
            if (!foundVariables.includes(varName)) {
              foundVariables.push(varName);
            }
          });
        }
      }
    });

    setVariables(foundVariables);
    onVariablesChange(foundVariables);
  };

  const clearCanvas = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();
    setVariables([]);
    onVariablesChange([]);
    toast("Canvas limpiado!");
  };

  const previewWithData = () => {
    if (!fabricCanvas || !data[selectedRow]) return;

    const objects = fabricCanvas.getObjects();
    objects.forEach((obj) => {
      if (obj.type === 'textbox') {
        const textObj = obj as Textbox;
        let text = textObj.text || '';
        
        // Replace variables with actual data
        variables.forEach(variable => {
          const value = data[selectedRow][variable] || `{{${variable}}}`;
          text = text.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), String(value));
        });
        
        textObj.set('text', text);
      }
    });

    fabricCanvas.renderAll();
    toast("Vista previa actualizada!");
  };

  return (
    <div className="flex flex-col h-full bg-editor-bg">
      {/* Toolbar */}
      <Card className="p-4 m-4 bg-toolbar-bg border-canvas-border">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Button onClick={addText} variant="outline" size="sm">
              <Type className="w-4 h-4 mr-2" />
              Texto
            </Button>
            <Button onClick={addRectangle} variant="outline" size="sm">
              <Square className="w-4 h-4 mr-2" />
              Rectángulo
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-2">
            <label htmlFor="color" className="text-sm font-medium">Color:</label>
            <Input
              id="color"
              type="color"
              value={activeColor}
              onChange={(e) => setActiveColor(e.target.value)}
              className="w-12 h-8 p-1 cursor-pointer"
            />
          </div>

          <Separator orientation="vertical" className="h-6" />

          <Button onClick={previewWithData} variant="default" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Vista Previa
          </Button>

          <Button onClick={clearCanvas} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Limpiar
          </Button>
        </div>
      </Card>

      <div className="flex flex-1 gap-4 p-4 pt-0">
        {/* Variables Panel */}
        <Card className="w-64 p-4 bg-card border-canvas-border">
          <h3 className="font-semibold mb-4">Variables Disponibles</h3>
          
          {data.length > 0 && (
            <div className="space-y-2 mb-4">
              <p className="text-sm text-muted-foreground">Columnas de datos:</p>
              {Object.keys(data[0]).map((key) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => addVariable(key)}
                  className="w-full justify-start text-xs"
                >
                  {key}
                </Button>
              ))}
            </div>
          )}

          {variables.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Variables en uso:</p>
              {variables.map((variable) => (
                <Badge key={variable} variant="secondary">
                  {`{{${variable}}}`}
                </Badge>
              ))}
            </div>
          )}
        </Card>

        {/* Canvas */}
        <Card className="flex-1 p-4 bg-canvas-bg border-canvas-border">
          <div className="border border-canvas-border rounded-lg overflow-hidden bg-white">
            <canvas ref={canvasRef} className="max-w-full" />
          </div>
        </Card>
      </div>
    </div>
  );
};
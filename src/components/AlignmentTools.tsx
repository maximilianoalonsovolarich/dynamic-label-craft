import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  AlignHorizontalSpaceAround,
  AlignVerticalSpaceAround,
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignLeft,
  AlignRight,
  AlignStartVertical,
  AlignEndVertical,
  FlipHorizontal2,
  FlipVertical2,
  RotateCw,
  Move3D
} from "lucide-react";
import { Canvas as FabricCanvas } from "fabric";

interface AlignmentToolsProps {
  fabricCanvas: FabricCanvas | null;
}

export const AlignmentTools = ({ fabricCanvas }: AlignmentToolsProps) => {
  
  const centerHorizontally = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    const canvasCenter = fabricCanvas.width! / 2;
    activeObjects.forEach(obj => {
      obj.set('left', canvasCenter - (obj.width! * obj.scaleX!) / 2);
    });
    fabricCanvas.renderAll();
  };

  const centerVertically = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    const canvasCenter = fabricCanvas.height! / 2;
    activeObjects.forEach(obj => {
      obj.set('top', canvasCenter - (obj.height! * obj.scaleY!) / 2);
    });
    fabricCanvas.renderAll();
  };

  const centerBoth = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    const canvasCenterX = fabricCanvas.width! / 2;
    const canvasCenterY = fabricCanvas.height! / 2;
    
    activeObjects.forEach(obj => {
      obj.set({
        left: canvasCenterX - (obj.width! * obj.scaleX!) / 2,
        top: canvasCenterY - (obj.height! * obj.scaleY!) / 2
      });
    });
    fabricCanvas.renderAll();
  };

  const alignLeft = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach(obj => obj.set('left', 10));
    fabricCanvas.renderAll();
  };

  const alignRight = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach(obj => {
      obj.set('left', fabricCanvas.width! - (obj.width! * obj.scaleX!) - 10);
    });
    fabricCanvas.renderAll();
  };

  const alignTop = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach(obj => obj.set('top', 10));
    fabricCanvas.renderAll();
  };

  const alignBottom = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach(obj => {
      obj.set('top', fabricCanvas.height! - (obj.height! * obj.scaleY!) - 10);
    });
    fabricCanvas.renderAll();
  };

  const flipHorizontal = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach(obj => {
      obj.set('flipX', !obj.flipX);
    });
    fabricCanvas.renderAll();
  };

  const flipVertical = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach(obj => {
      obj.set('flipY', !obj.flipY);
    });
    fabricCanvas.renderAll();
  };

  const rotateObject = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach(obj => {
      obj.set('angle', (obj.angle || 0) + 90);
    });
    fabricCanvas.renderAll();
  };

  return (
    <Card className="p-4 bg-card border-canvas-border">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Move3D className="w-4 h-4" />
        Alineación y Posición
      </h3>
      
      <div className="space-y-4">
        {/* Centrado */}
        <div>
          <Label className="text-xs mb-2 block">Centrar Elementos</Label>
          <div className="grid grid-cols-3 gap-1">
            <Button onClick={centerHorizontally} variant="outline" size="sm" className="p-2">
              <AlignCenterHorizontal className="w-4 h-4" />
            </Button>
            <Button onClick={centerBoth} variant="outline" size="sm" className="p-2">
              <AlignHorizontalSpaceAround className="w-4 h-4" />
            </Button>
            <Button onClick={centerVertically} variant="outline" size="sm" className="p-2">
              <AlignCenterVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Alineación a bordes */}
        <div>
          <Label className="text-xs mb-2 block">Alinear a Bordes</Label>
          <div className="grid grid-cols-2 gap-1">
            <Button onClick={alignLeft} variant="outline" size="sm">
              <AlignLeft className="w-4 h-4 mr-1" />
              Izq
            </Button>
            <Button onClick={alignRight} variant="outline" size="sm">
              <AlignRight className="w-4 h-4 mr-1" />
              Der
            </Button>
            <Button onClick={alignTop} variant="outline" size="sm">
              <AlignStartVertical className="w-4 h-4 mr-1" />
              Arr
            </Button>
            <Button onClick={alignBottom} variant="outline" size="sm">
              <AlignEndVertical className="w-4 h-4 mr-1" />
              Abj
            </Button>
          </div>
        </div>

        <Separator />

        {/* Transformaciones */}
        <div>
          <Label className="text-xs mb-2 block">Transformar</Label>
          <div className="grid grid-cols-3 gap-1">
            <Button onClick={flipHorizontal} variant="outline" size="sm" className="p-2">
              <FlipHorizontal2 className="w-4 h-4" />
            </Button>
            <Button onClick={flipVertical} variant="outline" size="sm" className="p-2">
              <FlipVertical2 className="w-4 h-4" />
            </Button>
            <Button onClick={rotateObject} variant="outline" size="sm" className="p-2">
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
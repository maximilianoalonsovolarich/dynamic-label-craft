import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Rect, Textbox, Image as FabricImage, Circle, Triangle, Polygon, Line } from "fabric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Download, 
  RotateCcw,
  Save,
  Eye,
  Printer,
  Upload,
  Link as LinkIcon,
  Trash2,
  Copy,
  Layers,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  MousePointer,
  Move
} from "lucide-react";
import { toast } from "sonner";
import { AdvancedToolbar } from "./AdvancedToolbar";
import { LabelSizeSelector } from "./LabelSizeSelector";
import { QRCodeDialog } from "./QRCodeDialog";
import { generateQRCode } from "@/lib/qrGenerator";
import { loadImageFromFile } from "@/lib/imageUtils";
import { LabelSize, STANDARD_LABEL_SIZES } from "@/lib/labelSizes";

interface LabelEditorProps {
  data: Record<string, any>[];
  selectedRow: number;
  onVariablesChange: (variables: string[]) => void;
}

export const LabelEditor = ({ data, selectedRow, onVariablesChange }: LabelEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [variables, setVariables] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<LabelSize>(STANDARD_LABEL_SIZES[0]);
  const [canvasScale, setCanvasScale] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [activeTool, setActiveTool] = useState<'select' | 'move'>('select');
  const [canvasBackground, setCanvasBackground] = useState("#ffffff");
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  // Convert mm to pixels (assuming 96 DPI)
  const mmToPx = (mm: number) => (mm * 96) / 25.4;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvasWidth = mmToPx(selectedSize.width);
    const canvasHeight = mmToPx(selectedSize.height);

    const canvas = new FabricCanvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: canvasBackground,
    });

    // Add grid if enabled
    if (showGrid) {
      addGridToCanvas(canvas, canvasWidth, canvasHeight);
    }

    // Add selection events
    canvas.on('selection:created', updateVariables);
    canvas.on('selection:updated', updateVariables);
    canvas.on('object:modified', updateVariables);

    setFabricCanvas(canvas);
    toast("Editor profesional listo!");

    return () => {
      canvas.dispose();
    };
  }, [selectedSize, showGrid, canvasBackground]);

  const addGridToCanvas = (canvas: FabricCanvas, width: number, height: number) => {
    const gridSize = 20;
    const gridColor = '#e5e5e5';
    
    // Vertical lines
    for (let i = 0; i <= width / gridSize; i++) {
      const line = new Line([i * gridSize, 0, i * gridSize, height], {
        stroke: gridColor,
        strokeWidth: 0.5,
        selectable: false,
        evented: false,
        excludeFromExport: true,
      });
      canvas.add(line);
    }

    // Horizontal lines
    for (let i = 0; i <= height / gridSize; i++) {
      const line = new Line([0, i * gridSize, width, i * gridSize], {
        stroke: gridColor,
        strokeWidth: 0.5,
        selectable: false,
        evented: false,
        excludeFromExport: true,
      });
      canvas.add(line);
    }
  };

  const addText = () => {
    if (!fabricCanvas) return;

    const text = new Textbox("{{texto}}", {
      left: 50,
      top: 50,
      fill: activeColor,
      fontSize: fontSize,
      fontFamily: fontFamily,
      width: 200,
    });

    fabricCanvas.add(text);
    updateVariables();
    toast("Texto agregado!");
  };

  const addShape = (shapeType: string) => {
    if (!fabricCanvas) return;

    let shape;
    
    switch (shapeType) {
      case 'rectangle':
        shape = new Rect({
          left: 100,
          top: 100,
          fill: activeColor,
          width: 100,
          height: 80,
        });
        break;
      case 'circle':
        shape = new Circle({
          left: 100,
          top: 100,
          fill: activeColor,
          radius: 50,
        });
        break;
      case 'triangle':
        shape = new Triangle({
          left: 100,
          top: 100,
          fill: activeColor,
          width: 100,
          height: 100,
        });
        break;
      case 'star':
        const starPoints = [];
        const outerRadius = 50;
        const innerRadius = 25;
        for (let i = 0; i < 10; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / 5;
          starPoints.push({
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius
          });
        }
        shape = new Polygon(starPoints, {
          left: 100,
          top: 100,
          fill: activeColor,
        });
        break;
      case 'line':
        shape = new Line([100, 100, 200, 100], {
          stroke: activeColor,
          strokeWidth: 3,
        });
        break;
      default:
        return;
    }

    fabricCanvas.add(shape);
    toast(`${shapeType} agregado!`);
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const onImageSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !fabricCanvas) return;

    try {
      const img = await loadImageFromFile(file);
      
      const fabricImage = new FabricImage(img, {
        left: 50,
        top: 50,
        scaleX: 0.5,
        scaleY: 0.5,
      });

      fabricCanvas.add(fabricImage);
      toast("Imagen agregada exitosamente!");
    } catch (error) {
      console.error('Error loading image:', error);
      toast("Error al cargar la imagen");
    }
  };

  const handleQRCodeGenerate = async (text: string, size: number, options: any) => {
    if (!fabricCanvas) return;

    try {
      const qrDataURL = await generateQRCode({
        text,
        size,
        errorCorrectionLevel: options.errorCorrectionLevel,
        foregroundColor: options.foregroundColor,
        backgroundColor: options.backgroundColor,
        margin: options.margin,
      });

      const img = new Image();
      img.onload = () => {
        const fabricImage = new FabricImage(img, {
          left: 50,
          top: 50,
          scaleX: 0.8,
          scaleY: 0.8,
        });
        fabricCanvas.add(fabricImage);
        toast("Código QR agregado!");
      };
      img.src = qrDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast("Error al generar código QR");
    }
  };

  const addLink = () => {
    if (!fabricCanvas) return;

    const linkElement = new Textbox(linkText || linkUrl, {
      left: 50,
      top: 50,
      fill: '#0066cc',
      fontSize: fontSize,
      fontFamily: fontFamily,
      underline: true,
      width: 200,
    });

    // Store URL as custom property
    linkElement.set('linkUrl', linkUrl);
    
    fabricCanvas.add(linkElement);
    setLinkDialogOpen(false);
    setLinkUrl("");
    setLinkText("");
    toast("Enlace agregado!");
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

  const previewWithData = () => {
    if (!fabricCanvas || !data[selectedRow]) return;

    const objects = fabricCanvas.getObjects();
    objects.forEach((obj) => {
      if (obj.type === 'textbox') {
        const textObj = obj as Textbox;
        let text = textObj.text || '';
        
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

  const clearCanvas = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = canvasBackground;
    
    if (showGrid) {
      addGridToCanvas(fabricCanvas, mmToPx(selectedSize.width), mmToPx(selectedSize.height));
    }
    
    fabricCanvas.renderAll();
    setVariables([]);
    onVariablesChange([]);
    toast("Canvas limpiado!");
  };

  const duplicateSelected = () => {
    if (!fabricCanvas) return;
    
    const activeObject = fabricCanvas.getActiveObject();
    if (!activeObject) {
      toast("Selecciona un elemento para duplicar");
      return;
    }

    activeObject.clone().then((cloned: any) => {
      cloned.set({
        left: cloned.left + 10,
        top: cloned.top + 10,
      });
      fabricCanvas.add(cloned);
      fabricCanvas.setActiveObject(cloned);
      fabricCanvas.renderAll();
      toast("Elemento duplicado!");
    });
  };

  const deleteSelected = () => {
    if (!fabricCanvas) return;
    
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length === 0) {
      toast("Selecciona elementos para eliminar");
      return;
    }

    activeObjects.forEach(obj => fabricCanvas.remove(obj));
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
    updateVariables();
    toast("Elementos eliminados!");
  };

  const zoomIn = () => {
    const newScale = Math.min(canvasScale * 1.2, 3);
    setCanvasScale(newScale);
    if (fabricCanvas) {
      fabricCanvas.setZoom(newScale);
      fabricCanvas.renderAll();
    }
  };

  const zoomOut = () => {
    const newScale = Math.max(canvasScale / 1.2, 0.1);
    setCanvasScale(newScale);
    if (fabricCanvas) {
      fabricCanvas.setZoom(newScale);
      fabricCanvas.renderAll();
    }
  };

  const exportCanvas = () => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });
    
    const link = document.createElement('a');
    link.download = `etiqueta_${selectedSize.name.replace(/\s+/g, '_')}.png`;
    link.href = dataURL;
    link.click();
    
    toast("Etiqueta exportada como imagen!");
  };

  return (
    <div className="flex flex-col h-full bg-editor-bg">
      {/* Main Toolbar */}
      <AdvancedToolbar
        activeColor={activeColor}
        onColorChange={setActiveColor}
        onAddText={addText}
        onAddShape={addShape}
        onAddImage={handleImageUpload}
        onAddQRCode={() => {}}
        onAddLink={() => setLinkDialogOpen(true)}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        fontFamily={fontFamily}
        onFontFamilyChange={setFontFamily}
        onAlignText={(alignment) => {
          const activeObj = fabricCanvas?.getActiveObject();
          if (activeObj && activeObj.type === 'textbox') {
            (activeObj as Textbox).set('textAlign', alignment);
            fabricCanvas?.renderAll();
          }
        }}
        onTextStyle={(style) => {
          const activeObj = fabricCanvas?.getActiveObject();
          if (activeObj && activeObj.type === 'textbox') {
            const textObj = activeObj as Textbox;
            switch (style) {
              case 'bold':
                textObj.set('fontWeight', textObj.fontWeight === 'bold' ? 'normal' : 'bold');
                break;
              case 'italic':
                textObj.set('fontStyle', textObj.fontStyle === 'italic' ? 'normal' : 'italic');
                break;
              case 'underline':
                textObj.set('underline', !textObj.underline);
                break;
            }
            fabricCanvas?.renderAll();
          }
        }}
      />

      <div className="flex flex-1 gap-4 p-4 pt-0">
        {/* Left Panel */}
        <div className="w-80 space-y-4">
          {/* Label Size Selector */}
          <LabelSizeSelector
            selectedSize={selectedSize}
            onSizeChange={setSelectedSize}
            onCustomSizeChange={(width, height) => {
              // Canvas will be recreated with new size
            }}
          />

          {/* Variables Panel */}
          <Card className="p-4 bg-card border-canvas-border">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Variables y Elementos
            </h3>
            
            {data.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-sm text-muted-foreground">Columnas de datos:</p>
                {Object.keys(data[0]).map((key) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (fabricCanvas) {
                        const text = new Textbox(`{{${key}}}`, {
                          left: 50,
                          top: 50,
                          fill: activeColor,
                          fontSize: fontSize,
                          fontFamily: fontFamily,
                          width: 150,
                        });
                        fabricCanvas.add(text);
                        updateVariables();
                      }
                    }}
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

          {/* Canvas Controls */}
          <Card className="p-4 bg-card border-canvas-border">
            <h3 className="font-semibold mb-4">Controles del Canvas</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Button onClick={zoomIn} variant="outline" size="sm">
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button onClick={zoomOut} variant="outline" size="sm">
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Badge variant="outline">{Math.round(canvasScale * 100)}%</Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setShowGrid(!showGrid)} 
                  variant={showGrid ? "default" : "outline"} 
                  size="sm"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <span className="text-sm">Cuadrícula</span>
              </div>

              <div>
                <Label className="text-xs">Color de fondo:</Label>
                <Input
                  type="color"
                  value={canvasBackground}
                  onChange={(e) => setCanvasBackground(e.target.value)}
                  className="w-full h-8 p-1 mt-1"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Canvas Area */}
        <Card className="flex-1 p-4 bg-canvas-bg border-canvas-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedSize.name}
              </Badge>
              <Badge variant="outline">
                {selectedSize.width} × {selectedSize.height} mm
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={duplicateSelected} variant="outline" size="sm">
                <Copy className="w-4 h-4" />
              </Button>
              <Button onClick={deleteSelected} variant="outline" size="sm">
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button onClick={previewWithData} variant="default" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Vista Previa
              </Button>
              <Button onClick={exportCanvas} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button onClick={clearCanvas} variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>

          <div className="border border-canvas-border rounded-lg overflow-auto bg-white p-4">
            <canvas ref={canvasRef} className="shadow-lg" />
          </div>
        </Card>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onImageSelected}
        className="hidden"
      />

      {/* QR Code Dialog */}
      <QRCodeDialog onGenerate={handleQRCodeGenerate}>
        <Button variant="outline" size="sm" className="hidden" />
      </QRCodeDialog>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Agregar Enlace
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="link-url">URL del enlace</Label>
              <Input
                id="link-url"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://ejemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="link-text">Texto a mostrar (opcional)</Label>
              <Input
                id="link-text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Texto del enlace"
              />
            </div>
            <Button onClick={addLink} className="w-full">
              Agregar Enlace
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
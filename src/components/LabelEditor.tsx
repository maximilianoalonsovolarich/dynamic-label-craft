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
import { ImageUrlDialog } from "./ImageUrlDialog";
import { AlignmentTools } from "./AlignmentTools";
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

  const handleImageFromUrl = async (imageUrl: string) => {
    if (!fabricCanvas) return;

    try {
      const img = document.createElement('img');
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        const fabricImage = new FabricImage(img, {
          left: 50,
          top: 50,
          scaleX: Math.min(200 / img.width, 200 / img.height), // Auto-scale to reasonable size
          scaleY: Math.min(200 / img.width, 200 / img.height),
        });

        fabricCanvas.add(fabricImage);
        fabricCanvas.setActiveObject(fabricImage);
        fabricCanvas.renderAll();
        toast("¡Imagen agregada desde URL!");
      };
      
      img.onerror = () => {
        toast("Error al cargar imagen desde URL");
      };
      
      img.src = imageUrl;
    } catch (error) {
      console.error('Error loading image from URL:', error);
      toast("Error al procesar la imagen");
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
        onAddImage={() => {}} // Removed file upload
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

      <div className="flex flex-col lg:flex-row flex-1 gap-4 p-4 pt-0">
        {/* Left Panel - Responsive */}
        <div className="w-full lg:w-80 xl:w-96 space-y-4">
          {/* Label Size Selector */}
          <LabelSizeSelector
            selectedSize={selectedSize}
            onSizeChange={setSelectedSize}
            onCustomSizeChange={(width, height) => {
              // Canvas will be recreated with new size
            }}
          />

          {/* Variables Panel */}
          <Card className="overflow-hidden">
            <div className="p-4 bg-primary/5 border-b">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Variables y Datos
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {data.length > 0 && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Columnas disponibles:
                    </p>
                    <div className="grid grid-cols-1 gap-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                      {Object.keys(data[0]).map((key) => (
                        <Button
                          key={key}
                          variant="ghost"
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
                          className="w-full justify-start text-xs h-7 px-2 bg-secondary/30 hover:bg-secondary/60"
                        >
                          + {key}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {variables.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Variables activas:</p>
                  <div className="flex flex-wrap gap-1">
                    {variables.map((variable) => (
                      <Badge key={variable} variant="secondary" className="text-xs">
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Alignment Tools */}
          <AlignmentTools fabricCanvas={fabricCanvas} />

          {/* Canvas Controls */}
          <Card className="overflow-hidden">
            <div className="p-4 bg-primary/5 border-b">
              <h3 className="font-semibold text-sm">Controles del Canvas</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Button onClick={zoomIn} variant="outline" size="sm" className="flex-1">
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button onClick={zoomOut} variant="outline" size="sm" className="flex-1">
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Badge variant="outline" className="text-xs">{Math.round(canvasScale * 100)}%</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs">Cuadrícula</span>
                <Button 
                  onClick={() => setShowGrid(!showGrid)} 
                  variant={showGrid ? "default" : "outline"} 
                  size="sm"
                  className="h-7"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Color de fondo:</Label>
                <Input
                  type="color"
                  value={canvasBackground}
                  onChange={(e) => setCanvasBackground(e.target.value)}
                  className="w-full h-8 p-1"
                />
              </div>

              {/* Image URL Input */}
              <div className="space-y-2">
                <Label className="text-xs">Agregar imagen por URL:</Label>
                <ImageUrlDialog onImageLoad={handleImageFromUrl}>
                  <Button variant="outline" size="sm" className="w-full h-8">
                    <Upload className="w-4 h-4 mr-2" />
                    Imagen URL
                  </Button>
                </ImageUrlDialog>
              </div>
            </div>
          </Card>
        </div>

        {/* Canvas Area - Responsive */}
        <Card className="flex-1 overflow-hidden bg-canvas-bg border-canvas-border">
          {/* Canvas Header - Responsive */}
          <div className="p-4 bg-primary/5 border-b">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {selectedSize.name}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {selectedSize.width} × {selectedSize.height} mm
                </Badge>
              </div>
              
              <div className="flex items-center gap-1 flex-wrap">
                <Button onClick={duplicateSelected} variant="outline" size="sm" className="h-7">
                  <Copy className="w-3 h-3" />
                </Button>
                <Button onClick={deleteSelected} variant="outline" size="sm" className="h-7">
                  <Trash2 className="w-3 h-3" />
                </Button>
                <Button onClick={previewWithData} variant="default" size="sm" className="h-7">
                  <Eye className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Vista Previa</span>
                </Button>
                <Button onClick={exportCanvas} variant="outline" size="sm" className="h-7">
                  <Download className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Exportar</span>
                </Button>
                <Button onClick={clearCanvas} variant="outline" size="sm" className="h-7">
                  <RotateCcw className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Limpiar</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Canvas Container - Centrado y responsive */}
          <div className="p-4 h-full">
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 overflow-auto">
              <div className="flex items-center justify-center p-4">
                <div 
                  className="shadow-xl rounded-lg overflow-hidden bg-white"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                  }}
                >
                  <canvas 
                    ref={canvasRef} 
                    className="block max-w-full max-h-full"
                    style={{
                      transform: `scale(${Math.min(1, canvasScale)})`,
                      transformOrigin: 'center center'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>


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
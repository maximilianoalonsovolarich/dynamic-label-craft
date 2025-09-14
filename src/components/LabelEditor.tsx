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
    <>
      <div className="flex h-full bg-editor-bg">
        {/* Left Sidebar - Fixed width, always visible */}
        <div className="w-80 min-w-80 border-r border-border bg-background flex flex-col">
          {/* Toolbar Section - Compact */}
          <div className="p-3 border-b border-border bg-muted/30">
            <div className="flex flex-wrap gap-1">
              <Button onClick={addText} variant="outline" size="sm" className="h-8 px-2">
                T
              </Button>
              <div className="flex border rounded-md">
                <Button onClick={() => addShape('rectangle')} variant="ghost" size="sm" className="h-8 px-2 rounded-none border-r">
                  □
                </Button>
                <Button onClick={() => addShape('circle')} variant="ghost" size="sm" className="h-8 px-2 rounded-none border-r">
                  ○
                </Button>
                <Button onClick={() => addShape('triangle')} variant="ghost" size="sm" className="h-8 px-2 rounded-none border-r">
                  △
                </Button>
                <Button onClick={() => addShape('star')} variant="ghost" size="sm" className="h-8 px-2 rounded-none border-r">
                  ★
                </Button>
                <Button onClick={() => addShape('line')} variant="ghost" size="sm" className="h-8 px-2 rounded-none">
                  ―
                </Button>
              </div>
              <Input
                type="color"
                value={activeColor}
                onChange={(e) => setActiveColor(e.target.value)}
                className="w-8 h-8 p-0 border-0"
              />
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-3 space-y-3">
              {/* Quick Font Controls */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <select 
                    value={fontFamily} 
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full h-8 text-xs bg-background border rounded px-2"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times</option>
                    <option value="Courier New">Courier</option>
                  </select>
                </div>
                <Input
                  type="number"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-16 h-8 text-xs"
                  min="8"
                  max="72"
                />
              </div>

              {/* Text Style Controls */}
              <div className="flex gap-1">
                <Button 
                  onClick={() => {
                    const activeObj = fabricCanvas?.getActiveObject();
                    if (activeObj && activeObj.type === 'textbox') {
                      (activeObj as Textbox).set('fontWeight', (activeObj as Textbox).fontWeight === 'bold' ? 'normal' : 'bold');
                      fabricCanvas?.renderAll();
                    }
                  }}
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-2 font-bold"
                >
                  B
                </Button>
                <Button 
                  onClick={() => {
                    const activeObj = fabricCanvas?.getActiveObject();
                    if (activeObj && activeObj.type === 'textbox') {
                      (activeObj as Textbox).set('fontStyle', (activeObj as Textbox).fontStyle === 'italic' ? 'normal' : 'italic');
                      fabricCanvas?.renderAll();
                    }
                  }}
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-2 italic"
                >
                  I
                </Button>
                <Button 
                  onClick={() => {
                    const activeObj = fabricCanvas?.getActiveObject();
                    if (activeObj && activeObj.type === 'textbox') {
                      (activeObj as Textbox).set('underline', !(activeObj as Textbox).underline);
                      fabricCanvas?.renderAll();
                    }
                  }}
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-2 underline"
                >
                  U
                </Button>
              </div>

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
                <div className="p-3 bg-primary/5 border-b">
                  <h3 className="font-medium text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Variables
                  </h3>
                </div>
                <div className="p-3 space-y-3">
                  {data.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Columnas disponibles:
                      </p>
                      <div className="grid grid-cols-1 gap-1 max-h-24 overflow-y-auto custom-scrollbar">
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
                            className="w-full justify-start text-xs h-6 px-2 bg-secondary/30 hover:bg-secondary/60"
                          >
                            + {key}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {variables.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Variables activas:</p>
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
                <div className="p-3 bg-primary/5 border-b">
                  <h3 className="font-medium text-sm">Controles</h3>
                </div>
                <div className="p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <Button onClick={zoomIn} variant="outline" size="sm" className="flex-1 h-7">
                      <ZoomIn className="w-3 h-3" />
                    </Button>
                    <Button onClick={zoomOut} variant="outline" size="sm" className="flex-1 h-7">
                      <ZoomOut className="w-3 h-3" />
                    </Button>
                    <Badge variant="outline" className="text-xs px-2">{Math.round(canvasScale * 100)}%</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Cuadrícula</span>
                    <Button 
                      onClick={() => setShowGrid(!showGrid)} 
                      variant={showGrid ? "default" : "outline"} 
                      size="sm"
                      className="h-6"
                    >
                      <Grid3X3 className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Color de fondo:</Label>
                    <Input
                      type="color"
                      value={canvasBackground}
                      onChange={(e) => setCanvasBackground(e.target.value)}
                      className="w-full h-7 p-1"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Imagen URL:</Label>
                    <ImageUrlDialog onImageLoad={handleImageFromUrl}>
                      <Button variant="outline" size="sm" className="w-full h-7 text-xs">
                        <Upload className="w-3 h-3 mr-1" />
                        Agregar
                      </Button>
                    </ImageUrlDialog>
                  </div>

                  <div className="space-y-1">
                    <Button onClick={() => setLinkDialogOpen(true)} variant="outline" size="sm" className="w-full h-7 text-xs">
                      <LinkIcon className="w-3 h-3 mr-1" />
                      Enlace
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Canvas Area - Always visible and prominent */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Canvas Header - Compact */}
          <div className="h-12 px-4 bg-primary/5 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {selectedSize.name}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {selectedSize.width} × {selectedSize.height} mm
              </Badge>
            </div>
            
            <div className="flex items-center gap-1">
              <Button onClick={duplicateSelected} variant="outline" size="sm" className="h-7 px-2">
                <Copy className="w-3 h-3" />
              </Button>
              <Button onClick={deleteSelected} variant="outline" size="sm" className="h-7 px-2">
                <Trash2 className="w-3 h-3" />
              </Button>
              <Button onClick={previewWithData} variant="default" size="sm" className="h-7 px-2">
                <Eye className="w-3 h-3" />
              </Button>
              <Button onClick={exportCanvas} variant="outline" size="sm" className="h-7 px-2">
                <Download className="w-3 h-3" />
              </Button>
              <Button onClick={clearCanvas} variant="outline" size="sm" className="h-7 px-2">
                <RotateCcw className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Canvas Container - Full height, always visible */}
          <div className="flex-1 p-4 bg-canvas-bg">
            <div className="w-full h-full flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed border-border/50">
              <div className="flex items-center justify-center">
                <div 
                  className="shadow-2xl rounded-lg overflow-hidden bg-background border"
                  style={{
                    maxWidth: 'calc(100% - 2rem)',
                    maxHeight: 'calc(100% - 2rem)',
                  }}
                >
                  <canvas 
                    ref={canvasRef} 
                    className="block"
                    style={{
                      transform: `scale(${Math.min(1, canvasScale)})`,
                      transformOrigin: 'center center'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
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
    </>
  );
};
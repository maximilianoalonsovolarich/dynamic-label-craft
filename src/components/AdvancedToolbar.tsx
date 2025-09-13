import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Type, 
  Square, 
  Circle, 
  Image, 
  QrCode,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Palette,
  Upload,
  Shapes,
  Triangle,
  Hexagon,
  Star,
  Heart,
  ArrowRight,
  Minus
} from "lucide-react";

interface AdvancedToolbarProps {
  activeColor: string;
  onColorChange: (color: string) => void;
  onAddText: () => void;
  onAddShape: (shape: string) => void;
  onAddImage: () => void;
  onAddQRCode: () => void;
  onAddLink: () => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  fontFamily: string;
  onFontFamilyChange: (family: string) => void;
  onAlignText: (alignment: string) => void;
  onTextStyle: (style: string) => void;
}

const fonts = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 
  'Courier New', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Tahoma'
];

const shapes = [
  { id: 'rectangle', name: 'Rectángulo', icon: Square },
  { id: 'circle', name: 'Círculo', icon: Circle },
  { id: 'triangle', name: 'Triángulo', icon: Triangle },
  { id: 'hexagon', name: 'Hexágono', icon: Hexagon },
  { id: 'star', name: 'Estrella', icon: Star },
  { id: 'heart', name: 'Corazón', icon: Heart },
  { id: 'arrow', name: 'Flecha', icon: ArrowRight },
  { id: 'line', name: 'Línea', icon: Minus }
];

const colorPalette = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A',
  '#808080', '#008000', '#000080', '#800000', '#FFE4E1', '#E6E6FA',
  '#F0F8FF', '#F5F5DC', '#FFEFD5', '#FFEBCD'
];

export const AdvancedToolbar = ({
  activeColor,
  onColorChange,
  onAddText,
  onAddShape,
  onAddImage,
  onAddQRCode,
  onAddLink,
  fontSize,
  onFontSizeChange,
  fontFamily,
  onFontFamilyChange,
  onAlignText,
  onTextStyle
}: AdvancedToolbarProps) => {
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showShapes, setShowShapes] = useState(false);

  return (
    <Card className="p-4 bg-toolbar-bg border-canvas-border">
      <div className="space-y-4">
        {/* Basic Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={onAddText} variant="outline" size="sm">
            <Type className="w-4 h-4 mr-2" />
            Texto
          </Button>
          
          <div className="relative">
            <Button 
              onClick={() => setShowShapes(!showShapes)} 
              variant="outline" 
              size="sm"
            >
              <Shapes className="w-4 h-4 mr-2" />
              Formas
            </Button>
            {showShapes && (
              <Card className="absolute top-full mt-1 p-2 z-10 bg-background border shadow-lg">
                <div className="grid grid-cols-4 gap-1 w-48">
                  {shapes.map((shape) => {
                    const Icon = shape.icon;
                    return (
                      <Button
                        key={shape.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onAddShape(shape.id);
                          setShowShapes(false);
                        }}
                        className="flex flex-col items-center p-2 h-auto"
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span className="text-xs">{shape.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>

          <Button onClick={onAddImage} variant="outline" size="sm">
            <Image className="w-4 h-4 mr-2" />
            Imagen
          </Button>

          <Button onClick={onAddQRCode} variant="outline" size="sm">
            <QrCode className="w-4 h-4 mr-2" />
            QR Code
          </Button>

          <Button onClick={onAddLink} variant="outline" size="sm">
            <Link className="w-4 h-4 mr-2" />
            Enlace
          </Button>
        </div>

        <Separator />

        {/* Text Formatting */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <Label className="text-xs">Fuente:</Label>
              <Select value={fontFamily} onValueChange={onFontFamilyChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fonts.map((font) => (
                    <SelectItem key={font} value={font}>
                      <span style={{ fontFamily: font }}>{font}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Label className="text-xs">Tamaño:</Label>
              <Input
                type="number"
                min="8"
                max="200"
                value={fontSize}
                onChange={(e) => onFontSizeChange(parseInt(e.target.value) || 12)}
                className="w-16"
              />
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-1">
              <Button 
                onClick={() => onTextStyle('bold')} 
                variant="outline" 
                size="sm"
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button 
                onClick={() => onTextStyle('italic')} 
                variant="outline" 
                size="sm"
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button 
                onClick={() => onTextStyle('underline')} 
                variant="outline" 
                size="sm"
              >
                <Underline className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-1">
              <Button 
                onClick={() => onAlignText('left')} 
                variant="outline" 
                size="sm"
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button 
                onClick={() => onAlignText('center')} 
                variant="outline" 
                size="sm"
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button 
                onClick={() => onAlignText('right')} 
                variant="outline" 
                size="sm"
              >
                <AlignRight className="w-4 h-4" />
              </Button>
              <Button 
                onClick={() => onAlignText('justify')} 
                variant="outline" 
                size="sm"
              >
                <AlignJustify className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Color Tools */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Label className="text-xs">Color:</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={activeColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-12 h-8 p-1 cursor-pointer"
              />
              <Button
                onClick={() => setShowColorPalette(!showColorPalette)}
                variant="outline"
                size="sm"
              >
                <Palette className="w-4 h-4 mr-2" />
                Paleta
              </Button>
              <Badge variant="secondary" className="text-xs">
                {activeColor}
              </Badge>
            </div>
          </div>

          {showColorPalette && (
            <Card className="p-3 border shadow-lg">
              <div className="grid grid-cols-11 gap-1">
                {colorPalette.map((color) => (
                  <Button
                    key={color}
                    className="w-6 h-6 p-0 border-2"
                    style={{ 
                      backgroundColor: color,
                      borderColor: activeColor === color ? '#000' : 'transparent'
                    }}
                    onClick={() => {
                      onColorChange(color);
                      setShowColorPalette(false);
                    }}
                  />
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Font Size Slider */}
        <div className="space-y-2">
          <Label className="text-xs">Tamaño de fuente: {fontSize}px</Label>
          <Slider
            value={[fontSize]}
            onValueChange={(values) => onFontSizeChange(values[0])}
            min={8}
            max={120}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    </Card>
  );
};
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { STANDARD_LABEL_SIZES, getLabelsByCategory, LabelSize } from "@/lib/labelSizes";
import { Ruler, Package, Truck, User, Home, Grid } from "lucide-react";

interface LabelSizeSelectorProps {
  selectedSize: LabelSize;
  onSizeChange: (size: LabelSize) => void;
  onCustomSizeChange: (width: number, height: number) => void;
}

const categoryIcons = {
  standard: Grid,
  shipping: Truck,
  product: Package,
  name: User,
  address: Home,
  custom: Ruler
};

export const LabelSizeSelector = ({ 
  selectedSize, 
  onSizeChange, 
  onCustomSizeChange 
}: LabelSizeSelectorProps) => {
  const [customWidth, setCustomWidth] = useState(selectedSize.width);
  const [customHeight, setCustomHeight] = useState(selectedSize.height);
  const [selectedCategory, setSelectedCategory] = useState('standard');

  const categories = ['standard', 'shipping', 'product', 'name', 'address'];

  const handleCustomSizeApply = () => {
    const customSize: LabelSize = {
      id: 'custom',
      name: 'Custom Size',
      width: customWidth,
      height: customHeight,
      category: 'custom',
      description: `${customWidth}mm x ${customHeight}mm`
    };
    onSizeChange(customSize);
    onCustomSizeChange(customWidth, customHeight);
  };

  return (
    <div className="space-y-4">
      {/* Header compacto */}
      <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border">
        <Ruler className="w-5 h-5 text-primary" />
        <div>
          <h3 className="font-semibold text-sm">Tamaño de Etiqueta</h3>
          <p className="text-xs text-muted-foreground">
            {selectedSize.name} - {selectedSize.width} × {selectedSize.height} mm
          </p>
        </div>
      </div>

      {/* Contenido responsivo */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Tabs defaultValue="standard" className="w-full">
            <div className="p-4 bg-muted/30 border-b">
              <TabsList className="grid w-full grid-cols-2 h-8">
                <TabsTrigger value="standard" className="text-xs">Estándar</TabsTrigger>
                <TabsTrigger value="custom" className="text-xs">Personalizado</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="standard" className="p-4 space-y-4 m-0">
              {/* Selector de categoría más compacto */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Categoría</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50">
                    {categories.map((category) => {
                      const Icon = categoryIcons[category as keyof typeof categoryIcons];
                      return (
                        <SelectItem key={category} value={category}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-3 h-3" />
                            <span className="text-xs">
                              {category === 'standard' && 'Estándar'}
                              {category === 'shipping' && 'Envío'}
                              {category === 'product' && 'Producto'}
                              {category === 'name' && 'Nombre'}
                              {category === 'address' && 'Dirección'}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Grid de tamaños optimizado */}
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {getLabelsByCategory(selectedCategory).map((size) => (
                  <div
                    key={size.id}
                    className={`p-3 rounded-md border cursor-pointer transition-all duration-200 hover:shadow-sm ${
                      selectedSize.id === size.id 
                        ? 'bg-primary/10 border-primary shadow-sm' 
                        : 'bg-card hover:bg-muted/50 border-border'
                    }`}
                    onClick={() => onSizeChange(size)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{size.name}</h4>
                          {size.brand && (
                            <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                              {size.brand}
                            </Badge>
                          )}
                        </div>
                        {size.description && (
                          <p className="text-xs text-muted-foreground truncate">{size.description}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="text-xs font-medium text-primary">
                          {size.width} × {size.height} mm
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(size.width / 25.4).toFixed(1)}" × {(size.height / 25.4).toFixed(1)}"
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="custom" className="p-4 space-y-4 m-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="width" className="text-xs">Ancho (mm)</Label>
                  <Input
                    id="width"
                    type="number"
                    min="1"
                    max="500"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(parseFloat(e.target.value) || 0)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="height" className="text-xs">Alto (mm)</Label>
                  <Input
                    id="height"
                    type="number"
                    min="1"
                    max="500"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(parseFloat(e.target.value) || 0)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              
              <div className="p-3 bg-muted/50 rounded-md">
                <div className="text-xs space-y-1">
                  <div><strong>Tamaño:</strong> {customWidth} × {customHeight} mm</div>
                  <div className="text-muted-foreground">
                    {(customWidth / 25.4).toFixed(2)}" × {(customHeight / 25.4).toFixed(2)}"
                  </div>
                </div>
              </div>
              
              <Button onClick={handleCustomSizeApply} className="w-full h-8 text-sm">
                Aplicar Tamaño
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Información actual - más compacta */}
      <div className="p-3 bg-accent/20 rounded-md border border-accent/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-accent-foreground">Tamaño Activo</div>
            <div className="text-xs text-muted-foreground">{selectedSize.name}</div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {selectedSize.width}×{selectedSize.height}mm
          </Badge>
        </div>
      </div>
    </div>
  );
};
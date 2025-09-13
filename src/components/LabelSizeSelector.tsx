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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="w-5 h-5" />
          Tamaño de Etiqueta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="standard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="standard">Tamaños Estándar</TabsTrigger>
            <TabsTrigger value="custom">Personalizado</TabsTrigger>
          </TabsList>
          
          <TabsContent value="standard" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Categoría</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => {
                      const Icon = categoryIcons[category as keyof typeof categoryIcons];
                      return (
                        <SelectItem key={category} value={category}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {category === 'standard' && 'Estándar'}
                            {category === 'shipping' && 'Envío'}
                            {category === 'product' && 'Producto'}
                            {category === 'name' && 'Nombre'}
                            {category === 'address' && 'Dirección'}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                {getLabelsByCategory(selectedCategory).map((size) => (
                  <Card 
                    key={size.id}
                    className={`cursor-pointer transition-colors ${
                      selectedSize.id === size.id 
                        ? 'bg-primary-light border-primary' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => onSizeChange(size)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{size.name}</h3>
                          {size.brand && (
                            <Badge variant="outline" className="text-xs">
                              {size.brand}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {size.width} × {size.height} mm
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(size.width / 25.4).toFixed(2)}" × {(size.height / 25.4).toFixed(2)}"
                          </div>
                        </div>
                      </div>
                      {size.description && (
                        <p className="text-xs text-muted-foreground">{size.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="width">Ancho (mm)</Label>
                <Input
                  id="width"
                  type="number"
                  min="1"
                  max="500"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="height">Alto (mm)</Label>
                <Input
                  id="height"
                  type="number"
                  min="1"
                  max="500"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Vista previa:</strong> {customWidth} × {customHeight} mm
              </div>
              <div className="text-xs text-muted-foreground">
                {(customWidth / 25.4).toFixed(2)}" × {(customHeight / 25.4).toFixed(2)}" pulgadas
              </div>
            </div>
            
            <Button onClick={handleCustomSizeApply} className="w-full">
              Aplicar Tamaño Personalizado
            </Button>
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="text-sm font-medium mb-1">Tamaño Actual:</div>
          <div className="text-sm">{selectedSize.name}</div>
          <div className="text-xs text-muted-foreground">
            {selectedSize.width} × {selectedSize.height} mm
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Download, 
  Settings, 
  Eye,
  Grid,
  MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface PDFGeneratorProps {
  data: Record<string, any>[];
  variables: string[];
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

export const PDFGenerator = ({ data, variables, canvasRef }: PDFGeneratorProps) => {
  const [pdfSettings, setPdfSettings] = useState({
    format: 'A4' as 'A4' | 'Letter',
    orientation: 'portrait' as 'portrait' | 'landscape',
    labelsPerRow: 2,
    labelsPerColumn: 4,
    marginTop: 10,
    marginLeft: 10,
    labelWidth: 90,
    labelHeight: 50,
  });

  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const generateSinglePDF = async (rowIndex: number) => {
    if (!data[rowIndex]) {
      toast("Error: Fila no encontrada");
      return;
    }

    const pdf = new jsPDF({
      orientation: pdfSettings.orientation,
      unit: 'mm',
      format: pdfSettings.format,
    });

    try {
      // If canvas is available, convert it to image
      if (canvasRef?.current) {
        const canvas = canvasRef.current;
        const imgData = canvas.toDataURL('image/png');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfSettings.labelWidth;
        const imgHeight = pdfSettings.labelHeight;
        
        const x = (pdfWidth - imgWidth) / 2;
        const y = (pdfHeight - imgHeight) / 2;
        
        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      } else {
        // Fallback: Generate text-based label
        const row = data[rowIndex];
        let yPosition = 20;
        
        pdf.setFontSize(16);
        pdf.text('Etiqueta Generada', 20, yPosition);
        yPosition += 15;
        
        pdf.setFontSize(12);
        Object.entries(row).forEach(([key, value]) => {
          pdf.text(`${key}: ${value}`, 20, yPosition);
          yPosition += 8;
        });
      }

      pdf.save(`etiqueta_${rowIndex + 1}.pdf`);
      toast("PDF generado exitosamente!");
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast("Error al generar PDF");
    }
  };

  const generateMultiplePDF = async () => {
    if (selectedRows.length === 0) {
      toast("Selecciona al menos una fila para generar PDF");
      return;
    }

    const pdf = new jsPDF({
      orientation: pdfSettings.orientation,
      unit: 'mm',
      format: pdfSettings.format,
    });

    try {
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      let currentRow = 0;
      let currentCol = 0;
      let currentPage = 1;

      selectedRows.forEach((rowIndex, index) => {
        const row = data[rowIndex];
        
        // Calculate position
        const x = pdfSettings.marginLeft + (currentCol * (pdfSettings.labelWidth + 5));
        const y = pdfSettings.marginTop + (currentRow * (pdfSettings.labelHeight + 5));
        
        // Check if we need a new page
        if (y + pdfSettings.labelHeight > pdfHeight - pdfSettings.marginTop) {
          pdf.addPage();
          currentPage++;
          currentRow = 0;
          currentCol = 0;
        }

        // Add label content
        pdf.setFontSize(10);
        let textY = y + 5;
        
        Object.entries(row).forEach(([key, value]) => {
          if (textY < y + pdfSettings.labelHeight - 5) {
            pdf.text(`${key}: ${value}`, x + 2, textY);
            textY += 4;
          }
        });

        // Draw border
        pdf.rect(x, y, pdfSettings.labelWidth, pdfSettings.labelHeight);

        // Move to next position
        currentCol++;
        if (currentCol >= pdfSettings.labelsPerRow) {
          currentCol = 0;
          currentRow++;
        }
      });

      pdf.save(`etiquetas_multiples.pdf`);
      toast(`PDF con ${selectedRows.length} etiquetas generado!`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast("Error al generar PDF múltiple");
    }
  };

  const toggleRowSelection = (index: number) => {
    setSelectedRows(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const selectAllRows = () => {
    setSelectedRows(data.map((_, index) => index));
  };

  const clearSelection = () => {
    setSelectedRows([]);
  };

  return (
    <div className="space-y-6">
      {/* PDF Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Configuración PDF</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="format">Formato</Label>
            <Select value={pdfSettings.format} onValueChange={(value: 'A4' | 'Letter') => 
              setPdfSettings(prev => ({ ...prev, format: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4</SelectItem>
                <SelectItem value="Letter">Carta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="orientation">Orientación</Label>
            <Select value={pdfSettings.orientation} onValueChange={(value: 'portrait' | 'landscape') => 
              setPdfSettings(prev => ({ ...prev, orientation: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portrait">Vertical</SelectItem>
                <SelectItem value="landscape">Horizontal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="labelsPerRow">Etiquetas por fila</Label>
            <Input
              type="number"
              min="1"
              max="5"
              value={pdfSettings.labelsPerRow}
              onChange={(e) => setPdfSettings(prev => ({ 
                ...prev, 
                labelsPerRow: parseInt(e.target.value) || 1 
              }))}
            />
          </div>

          <div>
            <Label htmlFor="labelsPerColumn">Etiquetas por columna</Label>
            <Input
              type="number"
              min="1"
              max="10"
              value={pdfSettings.labelsPerColumn}
              onChange={(e) => setPdfSettings(prev => ({ 
                ...prev, 
                labelsPerColumn: parseInt(e.target.value) || 1 
              }))}
            />
          </div>
        </div>
      </Card>

      {/* Row Selection */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Grid className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Selección de Datos</h3>
            <Badge variant="secondary">
              {selectedRows.length} seleccionadas
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={selectAllRows} variant="outline" size="sm">
              Seleccionar Todo
            </Button>
            <Button onClick={clearSelection} variant="outline" size="sm">
              Limpiar
            </Button>
          </div>
        </div>

        {data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
            {data.map((row, index) => (
              <div
                key={index}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedRows.includes(index) 
                    ? 'bg-primary-light border-primary' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => toggleRowSelection(index)}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    Fila {index + 1}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      generateSinglePDF(index);
                    }}
                  >
                    <FileText className="w-3 h-3" />
                  </Button>
                </div>
                <div className="text-sm space-y-1">
                  {Object.entries(row).slice(0, 2).map(([key, value]) => (
                    <div key={key} className="truncate">
                      <span className="font-medium">{key}:</span> {value}
                    </div>
                  ))}
                  {Object.keys(row).length > 2 && (
                    <div className="text-muted-foreground flex items-center gap-1">
                      <MoreHorizontal className="w-3 h-3" />
                      {Object.keys(row).length - 2} más...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay datos disponibles para generar PDFs</p>
          </div>
        )}
      </Card>

      {/* Generation Actions */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Generar PDFs</h3>
            <p className="text-sm text-muted-foreground">
              Crea documentos PDF con las etiquetas seleccionadas
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={generateMultiplePDF} 
              disabled={selectedRows.length === 0}
              variant="default"
            >
              <Download className="w-4 h-4 mr-2" />
              Generar PDF Múltiple ({selectedRows.length})
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Upload, 
  Download, 
  Trash2, 
  Edit,
  Save,
  X
} from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";

interface DataTableProps {
  data: Record<string, any>[];
  onDataChange: (data: Record<string, any>[]) => void;
  selectedRow: number;
  onRowSelect: (index: number) => void;
}

export const DataTable = ({ data, onDataChange, selectedRow, onRowSelect }: DataTableProps) => {
  const [editingCell, setEditingCell] = useState<{row: number, col: string} | null>(null);
  const [editValue, setEditValue] = useState("");

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const headers = results.data[0] as string[];
          const rows = results.data.slice(1) as string[][];
          
          const parsedData = rows
            .filter(row => row.some(cell => cell?.trim()))
            .map(row => {
              const obj: Record<string, any> = {};
              headers.forEach((header, index) => {
                obj[header] = row[index] || '';
              });
              return obj;
            });

          onDataChange(parsedData);
          toast(`${parsedData.length} filas importadas exitosamente!`);
        }
      },
      header: false,
      error: (error) => {
        console.error('Error parsing CSV:', error);
        toast("Error al importar CSV: " + error.message);
      }
    });
  };

  const exportToCSV = () => {
    if (data.length === 0) {
      toast("No hay datos para exportar");
      return;
    }

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'datos_etiquetas.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast("CSV exportado exitosamente!");
  };

  const addRow = () => {
    if (columns.length === 0) {
      // Create default columns if no data exists
      const newData = [{
        nombre: '',
        descripcion: '',
        precio: '',
        codigo: ''
      }];
      onDataChange(newData);
    } else {
      const newRow: Record<string, any> = {};
      columns.forEach(col => {
        newRow[col] = '';
      });
      onDataChange([...data, newRow]);
    }
    toast("Nueva fila agregada");
  };

  const addColumn = () => {
    const columnName = prompt("Nombre de la nueva columna:");
    if (!columnName || !columnName.trim()) return;

    const newData = data.map(row => ({
      ...row,
      [columnName]: ''
    }));

    if (newData.length === 0) {
      newData.push({ [columnName]: '' });
    }

    onDataChange(newData);
    toast(`Columna "${columnName}" agregada`);
  };

  const deleteRow = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    onDataChange(newData);
    if (selectedRow >= newData.length && newData.length > 0) {
      onRowSelect(newData.length - 1);
    }
    toast("Fila eliminada");
  };

  const startEdit = (row: number, col: string) => {
    setEditingCell({ row, col });
    setEditValue(data[row][col] || '');
  };

  const saveEdit = () => {
    if (!editingCell) return;

    const newData = [...data];
    newData[editingCell.row][editingCell.col] = editValue;
    onDataChange(newData);
    setEditingCell(null);
    toast("Celda actualizada");
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Gestión de Datos</h2>
        <div className="flex items-center gap-2">
          <Button onClick={addRow} variant="default" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Fila
          </Button>
          <Button onClick={addColumn} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Columna
          </Button>
          <div className="relative">
            <Button variant="outline" size="sm" asChild>
              <label>
                <Upload className="w-4 h-4 mr-2" />
                Importar CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </Button>
          </div>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {data.length} filas
          </Badge>
          <Badge variant="secondary">
            {columns.length} columnas
          </Badge>
          {selectedRow >= 0 && (
            <Badge variant="default">
              Fila seleccionada: {selectedRow + 1}
            </Badge>
          )}
        </div>

        {data.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  {columns.map((column) => (
                    <TableHead key={column}>{column}</TableHead>
                  ))}
                  <TableHead className="w-24">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow 
                    key={index}
                    className={`cursor-pointer ${selectedRow === index ? 'bg-primary-light' : ''}`}
                    onClick={() => onRowSelect(index)}
                  >
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    {columns.map((column) => (
                      <TableCell key={column}>
                        {editingCell?.row === index && editingCell?.col === column ? (
                          <div className="flex items-center gap-1">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit();
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              className="h-8 text-sm"
                              autoFocus
                            />
                            <Button size="sm" variant="outline" onClick={saveEdit}>
                              <Save className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div 
                            className="min-h-[2rem] flex items-center cursor-pointer hover:bg-muted rounded px-2 py-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(index, column);
                            }}
                          >
                            {row[column] || <span className="text-muted-foreground">-</span>}
                          </div>
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRow(index);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-4">No hay datos disponibles</p>
            <Button onClick={addRow} variant="default">
              <Plus className="w-4 h-4 mr-2" />
              Agregar primera fila
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
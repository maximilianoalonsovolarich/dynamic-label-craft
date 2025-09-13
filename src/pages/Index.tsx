import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LabelEditor } from "@/components/LabelEditor";
import { DataTable } from "@/components/DataTable";
import { PDFGenerator } from "@/components/PDFGenerator";
import { 
  Layout, 
  Database, 
  FileText, 
  Tag,
  Zap,
  Sparkles,
  Crown,
  Settings
} from "lucide-react";

const Index = () => {
  const [data, setData] = useState<Record<string, any>[]>([
    {
      nombre: "MacBook Pro 16",
      descripcion: "Laptop profesional Apple M2",
      precio: "$2,499.00",
      codigo: "MBP16-M2-001",
      categoria: "Electrónicos",
      stock: "15",
      ubicacion: "A1-B2-C3"
    },
    {
      nombre: "iPhone 15 Pro", 
      descripcion: "Smartphone Apple con titanio",
      precio: "$999.00",
      codigo: "IP15P-TIT-002",
      categoria: "Móviles",
      stock: "42",
      ubicacion: "A2-B1-C4"
    },
    {
      nombre: "AirPods Pro 2",
      descripcion: "Auriculares inalámbricos con cancelación",
      precio: "$249.00",
      codigo: "APP2-CNC-003",
      categoria: "Audio",
      stock: "88",
      ubicacion: "A3-B3-C1"
    }
  ]);
  
  const [selectedRow, setSelectedRow] = useState(0);
  const [variables, setVariables] = useState<string[]>([]);

  const handleDataChange = (newData: Record<string, any>[]) => {
    setData(newData);
    if (selectedRow >= newData.length && newData.length > 0) {
      setSelectedRow(newData.length - 1);
    } else if (newData.length === 0) {
      setSelectedRow(-1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Header */}
      <header className="border-b bg-gradient-to-r from-primary to-primary-hover">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur">
                <Tag className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">LabelPro</h1>
                <p className="text-primary-foreground/80">
                  Sistema Profesional de Etiquetas Dinámicas
                </p>
              </div>
              <Badge className="bg-warning text-warning-foreground">
                <Crown className="w-3 h-3 mr-1" />
                Professional
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-1 bg-white/10 text-white border-white/20">
                <Database className="w-3 h-3" />
                {data.length} registros
              </Badge>
              <Badge variant="secondary" className="gap-1 bg-white/10 text-white border-white/20">
                <Zap className="w-3 h-3" />
                {variables.length} variables
              </Badge>
              <Badge variant="secondary" className="gap-1 bg-white/10 text-white border-white/20">
                <Sparkles className="w-3 h-3" />
                QR + PDF
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-card border shadow-sm">
            <TabsTrigger value="editor" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Layout className="w-4 h-4" />
              Editor Profesional
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Database className="w-4 h-4" />
              Gestión de Datos
            </TabsTrigger>
            <TabsTrigger value="pdf" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4" />
              Generador PDF
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6">
            <Card className="p-1 shadow-lg border-canvas-border">
              <LabelEditor 
                data={data}
                selectedRow={selectedRow}
                onVariablesChange={setVariables}
              />
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <DataTable 
              data={data}
              onDataChange={handleDataChange}
              selectedRow={selectedRow}
              onRowSelect={setSelectedRow}
            />
          </TabsContent>

          <TabsContent value="pdf" className="space-y-6">
            <PDFGenerator 
              data={data}
              variables={variables}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Professional Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              <span className="font-medium">© 2024 LabelPro</span>
              <span className="text-muted-foreground">Sistema profesional de etiquetas dinámicas</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1">
                <Settings className="w-3 h-3" />
                Fabric.js v6
              </Badge>
              <Badge variant="outline">jsPDF</Badge>
              <Badge variant="outline">QR Codes</Badge>
              <Badge variant="outline">CSV Import/Export</Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
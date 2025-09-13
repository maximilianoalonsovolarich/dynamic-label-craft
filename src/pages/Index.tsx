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
  Zap
} from "lucide-react";

const Index = () => {
  const [data, setData] = useState<Record<string, any>[]>([
    {
      nombre: "Producto A",
      descripcion: "Descripción del producto A",
      precio: "$19.99",
      codigo: "PA001",
      categoria: "Electrónicos"
    },
    {
      nombre: "Producto B", 
      descripcion: "Descripción del producto B",
      precio: "$29.99",
      codigo: "PB002",
      categoria: "Hogar"
    },
    {
      nombre: "Producto C",
      descripcion: "Descripción del producto C", 
      precio: "$39.99",
      codigo: "PC003",
      categoria: "Deportes"
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
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Tag className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">LabelPro</h1>
                <p className="text-sm text-muted-foreground">
                  Sistema de etiquetas dinámicas profesional
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Database className="w-3 h-3" />
                {data.length} registros
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Zap className="w-3 h-3" />
                {variables.length} variables
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Editor de Etiquetas
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Gestión de Datos
            </TabsTrigger>
            <TabsTrigger value="pdf" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Generador PDF
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6">
            <Card className="p-1">
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

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2024 LabelPro. Sistema de etiquetas dinámicas.</p>
            <div className="flex items-center gap-4">
              <Badge variant="outline">Fabric.js</Badge>
              <Badge variant="outline">jsPDF</Badge>
              <Badge variant="outline">Papa Parse</Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
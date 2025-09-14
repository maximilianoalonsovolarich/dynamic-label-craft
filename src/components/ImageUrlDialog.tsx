import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Image, ExternalLink, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ImageUrlDialogProps {
  onImageLoad: (imageUrl: string) => void;
  children: React.ReactNode;
}

export const ImageUrlDialog = ({ onImageLoad, children }: ImageUrlDialogProps) => {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const handlePreview = () => {
    if (!imageUrl) return;
    
    setIsLoading(true);
    const img = document.createElement('img');
    
    img.onload = () => {
      setPreviewUrl(imageUrl);
      setIsLoading(false);
      toast("¡Imagen cargada correctamente!");
    };
    
    img.onerror = () => {
      setIsLoading(false);
      toast("Error al cargar la imagen. Verifica la URL.");
    };
    
    img.src = imageUrl;
  };

  const handleAddImage = () => {
    if (!previewUrl) {
      toast("Primero previsualiza la imagen");
      return;
    }
    
    onImageLoad(previewUrl);
    setOpen(false);
    setImageUrl("");
    setPreviewUrl("");
    toast("¡Imagen agregada al canvas!");
  };

  const resetDialog = () => {
    setImageUrl("");
    setPreviewUrl("");
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetDialog();
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Agregar Imagen por URL
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-url">URL de la imagen</Label>
            <div className="flex gap-2">
              <Input
                id="image-url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="flex-1"
              />
              <Button 
                onClick={handlePreview}
                disabled={!imageUrl || isLoading}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="w-3 h-3" />
              Formatos soportados: JPG, PNG, GIF, WebP, SVG
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center p-8 border rounded-lg bg-muted">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {previewUrl && !isLoading && (
            <div className="space-y-3">
              <div className="border rounded-lg overflow-hidden bg-white">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-32 object-contain"
                  onError={() => {
                    setPreviewUrl("");
                    toast("Error al mostrar la imagen");
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Vista previa cargada
                </Badge>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleAddImage}
              disabled={!previewUrl}
              className="flex-1"
            >
              Agregar al Canvas
            </Button>
            <Button 
              onClick={resetDialog}
              variant="outline"
            >
              Limpiar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
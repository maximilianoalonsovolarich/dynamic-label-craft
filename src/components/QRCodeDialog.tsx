import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QrCode, Link, Mail, Phone, Wifi, MapPin } from "lucide-react";
import { toast } from "sonner";

interface QRCodeDialogProps {
  onGenerate: (text: string, size: number, options: any) => void;
  children: React.ReactNode;
}

export const QRCodeDialog = ({ onGenerate, children }: QRCodeDialogProps) => {
  const [qrType, setQrType] = useState('text');
  const [qrText, setQrText] = useState('');
  const [qrSize, setQrSize] = useState(200);
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#FFFFFF');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  
  // Form data for different QR types
  const [urlData, setUrlData] = useState('https://');
  const [emailData, setEmailData] = useState({ email: '', subject: '', body: '' });
  const [phoneData, setPhoneData] = useState('');
  const [wifiData, setWifiData] = useState({ ssid: '', password: '', security: 'WPA' });
  const [locationData, setLocationData] = useState({ lat: '', lng: '', query: '' });
  const [vCardData, setVCardData] = useState({
    name: '', phone: '', email: '', organization: '', website: ''
  });

  const qrTypes = [
    { id: 'text', name: 'Texto', icon: QrCode },
    { id: 'url', name: 'URL/Sitio Web', icon: Link },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'phone', name: 'Teléfono', icon: Phone },
    { id: 'wifi', name: 'WiFi', icon: Wifi },
    { id: 'location', name: 'Ubicación', icon: MapPin },
    { id: 'vcard', name: 'Contacto (vCard)', icon: QrCode }
  ];

  const generateQRText = () => {
    let text = '';
    
    switch (qrType) {
      case 'text':
        text = qrText;
        break;
      case 'url':
        text = urlData;
        break;
      case 'email':
        text = `mailto:${emailData.email}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
        break;
      case 'phone':
        text = `tel:${phoneData}`;
        break;
      case 'wifi':
        text = `WIFI:T:${wifiData.security};S:${wifiData.ssid};P:${wifiData.password};;`;
        break;
      case 'location':
        if (locationData.lat && locationData.lng) {
          text = `geo:${locationData.lat},${locationData.lng}`;
        } else if (locationData.query) {
          text = `geo:0,0?q=${encodeURIComponent(locationData.query)}`;
        }
        break;
      case 'vcard':
        text = `BEGIN:VCARD\nVERSION:3.0\nFN:${vCardData.name}\nTEL:${vCardData.phone}\nEMAIL:${vCardData.email}\nORG:${vCardData.organization}\nURL:${vCardData.website}\nEND:VCARD`;
        break;
    }
    
    return text;
  };

  const handleGenerate = () => {
    const text = generateQRText();
    if (!text.trim()) {
      toast("Por favor ingresa el contenido para el código QR");
      return;
    }

    const options = {
      size: qrSize,
      errorCorrectionLevel: errorLevel,
      foregroundColor: qrColor,
      backgroundColor: qrBgColor,
      margin: 1
    };

    onGenerate(text, qrSize, options);
    toast("Código QR generado exitosamente!");
  };

  const renderQRForm = () => {
    switch (qrType) {
      case 'text':
        return (
          <div>
            <Label htmlFor="qr-text">Texto</Label>
            <Textarea
              id="qr-text"
              value={qrText}
              onChange={(e) => setQrText(e.target.value)}
              placeholder="Ingresa el texto para el código QR..."
              rows={3}
            />
          </div>
        );
      
      case 'url':
        return (
          <div>
            <Label htmlFor="qr-url">URL del sitio web</Label>
            <Input
              id="qr-url"
              type="url"
              value={urlData}
              onChange={(e) => setUrlData(e.target.value)}
              placeholder="https://ejemplo.com"
            />
          </div>
        );
      
      case 'email':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={emailData.email}
                onChange={(e) => setEmailData({...emailData, email: e.target.value})}
                placeholder="ejemplo@correo.com"
              />
            </div>
            <div>
              <Label htmlFor="subject">Asunto</Label>
              <Input
                id="subject"
                value={emailData.subject}
                onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                placeholder="Asunto del email"
              />
            </div>
            <div>
              <Label htmlFor="body">Mensaje</Label>
              <Textarea
                id="body"
                value={emailData.body}
                onChange={(e) => setEmailData({...emailData, body: e.target.value})}
                placeholder="Mensaje del email..."
                rows={2}
              />
            </div>
          </div>
        );
      
      case 'phone':
        return (
          <div>
            <Label htmlFor="phone">Número de teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={phoneData}
              onChange={(e) => setPhoneData(e.target.value)}
              placeholder="+1234567890"
            />
          </div>
        );
      
      case 'wifi':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="ssid">Nombre de red (SSID)</Label>
              <Input
                id="ssid"
                value={wifiData.ssid}
                onChange={(e) => setWifiData({...wifiData, ssid: e.target.value})}
                placeholder="Mi WiFi"
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={wifiData.password}
                onChange={(e) => setWifiData({...wifiData, password: e.target.value})}
                placeholder="Contraseña WiFi"
              />
            </div>
            <div>
              <Label htmlFor="security">Seguridad</Label>
              <Select value={wifiData.security} onValueChange={(value) => setWifiData({...wifiData, security: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">WPA/WPA2</SelectItem>
                  <SelectItem value="WEP">WEP</SelectItem>
                  <SelectItem value="nopass">Sin contraseña</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 'location':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="lat">Latitud</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  value={locationData.lat}
                  onChange={(e) => setLocationData({...locationData, lat: e.target.value})}
                  placeholder="40.7128"
                />
              </div>
              <div>
                <Label htmlFor="lng">Longitud</Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  value={locationData.lng}
                  onChange={(e) => setLocationData({...locationData, lng: e.target.value})}
                  placeholder="-74.0060"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="query">O buscar ubicación</Label>
              <Input
                id="query"
                value={locationData.query}
                onChange={(e) => setLocationData({...locationData, query: e.target.value})}
                placeholder="Nombre del lugar o dirección"
              />
            </div>
          </div>
        );
      
      case 'vcard':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={vCardData.name}
                onChange={(e) => setVCardData({...vCardData, name: e.target.value})}
                placeholder="Juan Pérez"
              />
            </div>
            <div>
              <Label htmlFor="vcard-phone">Teléfono</Label>
              <Input
                id="vcard-phone"
                value={vCardData.phone}
                onChange={(e) => setVCardData({...vCardData, phone: e.target.value})}
                placeholder="+1234567890"
              />
            </div>
            <div>
              <Label htmlFor="vcard-email">Email</Label>
              <Input
                id="vcard-email"
                type="email"
                value={vCardData.email}
                onChange={(e) => setVCardData({...vCardData, email: e.target.value})}
                placeholder="juan@ejemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="organization">Organización</Label>
              <Input
                id="organization"
                value={vCardData.organization}
                onChange={(e) => setVCardData({...vCardData, organization: e.target.value})}
                placeholder="Mi Empresa"
              />
            </div>
            <div>
              <Label htmlFor="website">Sitio web</Label>
              <Input
                id="website"
                type="url"
                value={vCardData.website}
                onChange={(e) => setVCardData({...vCardData, website: e.target.value})}
                placeholder="https://miempresa.com"
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Generar Código QR
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* QR Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tipo de código QR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {qrTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.id}
                      variant={qrType === type.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setQrType(type.id)}
                      className="flex flex-col items-center p-3 h-auto"
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-xs text-center">{type.name}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* QR Content Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Contenido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderQRForm()}
            </CardContent>
          </Card>

          {/* QR Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="qr-size">Tamaño (px)</Label>
                  <Input
                    id="qr-size"
                    type="number"
                    min="50"
                    max="500"
                    value={qrSize}
                    onChange={(e) => setQrSize(parseInt(e.target.value) || 200)}
                  />
                </div>
                <div>
                  <Label htmlFor="error-level">Corrección de errores</Label>
                  <Select value={errorLevel} onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => setErrorLevel(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Bajo (7%)</SelectItem>
                      <SelectItem value="M">Medio (15%)</SelectItem>
                      <SelectItem value="Q">Alto (25%)</SelectItem>
                      <SelectItem value="H">Muy alto (30%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="qr-color">Color del código</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="qr-color"
                      type="color"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="w-12 h-8 p-1"
                    />
                    <Badge variant="outline">{qrColor}</Badge>
                  </div>
                </div>
                <div>
                  <Label htmlFor="qr-bg-color">Color de fondo</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="qr-bg-color"
                      type="color"
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                      className="w-12 h-8 p-1"
                    />
                    <Badge variant="outline">{qrBgColor}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button onClick={handleGenerate} className="w-full">
              <QrCode className="w-4 h-4 mr-2" />
              Generar y Agregar QR Code
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
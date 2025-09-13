import QRCode from 'qrcode';

export interface QRCodeOptions {
  text: string;
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  foregroundColor: string;
  backgroundColor: string;
  margin: number;
}

export const generateQRCode = async (options: QRCodeOptions): Promise<string> => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(options.text, {
      width: options.size,
      margin: options.margin,
      color: {
        dark: options.foregroundColor,
        light: options.backgroundColor,
      },
      errorCorrectionLevel: options.errorCorrectionLevel,
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const generateQRCodeWithVariable = async (
  template: string, 
  data: Record<string, any>, 
  options: Omit<QRCodeOptions, 'text'>
): Promise<string> => {
  let text = template;
  
  // Replace variables in the template
  Object.entries(data).forEach(([key, value]) => {
    text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
  });
  
  return generateQRCode({ ...options, text });
};
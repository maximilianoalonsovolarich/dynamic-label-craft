export interface LabelSize {
  id: string;
  name: string;
  brand?: string;
  width: number;
  height: number;
  category: 'standard' | 'shipping' | 'product' | 'name' | 'address' | 'custom';
  description?: string;
}

export const STANDARD_LABEL_SIZES: LabelSize[] = [
  // Avery Labels
  {
    id: 'avery-5160',
    name: 'Avery 5160',
    brand: 'Avery',
    width: 66.04,
    height: 25.4,
    category: 'address',
    description: 'Address labels (30 per sheet)'
  },
  {
    id: 'avery-5161',
    name: 'Avery 5161',
    brand: 'Avery',
    width: 101.6,
    height: 25.4,
    category: 'address',
    description: 'Address labels (20 per sheet)'
  },
  {
    id: 'avery-5162',
    name: 'Avery 5162',
    brand: 'Avery',
    width: 101.6,
    height: 33.87,
    category: 'address',
    description: 'Address labels (14 per sheet)'
  },
  {
    id: 'avery-5163',
    name: 'Avery 5163',
    brand: 'Avery',
    width: 101.6,
    height: 50.8,
    category: 'shipping',
    description: 'Shipping labels (10 per sheet)'
  },
  {
    id: 'avery-5164',
    name: 'Avery 5164',
    brand: 'Avery',
    width: 101.6,
    height: 84.67,
    category: 'shipping',
    description: 'Shipping labels (6 per sheet)'
  },
  {
    id: 'avery-5167',
    name: 'Avery 5167',
    brand: 'Avery',
    width: 19.05,
    height: 12.7,
    category: 'product',
    description: 'Return address labels (80 per sheet)'
  },
  {
    id: 'avery-22805',
    name: 'Avery 22805',
    brand: 'Avery',
    width: 63.5,
    height: 33.87,
    category: 'name',
    description: 'Name badges (24 per sheet)'
  },
  
  // Brother Labels
  {
    id: 'brother-dk1201',
    name: 'Brother DK-1201',
    brand: 'Brother',
    width: 29,
    height: 90,
    category: 'address',
    description: 'Standard address labels'
  },
  {
    id: 'brother-dk1202',
    name: 'Brother DK-1202',
    brand: 'Brother',
    width: 62,
    height: 100,
    category: 'shipping',
    description: 'Shipping labels'
  },
  {
    id: 'brother-dk1208',
    name: 'Brother DK-1208',
    brand: 'Brother',
    width: 38,
    height: 90,
    category: 'address',
    description: 'Large address labels'
  },
  
  // Standard sizes
  {
    id: 'standard-small',
    name: 'Small Product',
    width: 25,
    height: 15,
    category: 'product',
    description: 'Small product labels'
  },
  {
    id: 'standard-medium',
    name: 'Medium Product',
    width: 50,
    height: 30,
    category: 'product',
    description: 'Medium product labels'
  },
  {
    id: 'standard-large',
    name: 'Large Product',
    width: 75,
    height: 50,
    category: 'product',
    description: 'Large product labels'
  },
  {
    id: 'business-card',
    name: 'Business Card',
    width: 85,
    height: 55,
    category: 'standard',
    description: 'Standard business card size'
  },
  {
    id: 'postcard',
    name: 'Postcard',
    width: 148,
    height: 105,
    category: 'standard',
    description: 'Standard postcard size'
  }
];

export const PDF_FORMATS = [
  { id: 'A4', name: 'A4', width: 210, height: 297 },
  { id: 'A3', name: 'A3', width: 297, height: 420 },
  { id: 'A5', name: 'A5', width: 148, height: 210 },
  { id: 'Letter', name: 'Letter', width: 215.9, height: 279.4 },
  { id: 'Legal', name: 'Legal', width: 215.9, height: 355.6 },
  { id: 'Tabloid', name: 'Tabloid', width: 279.4, height: 431.8 }
];

export const getLabelsByCategory = (category: string) => {
  return STANDARD_LABEL_SIZES.filter(label => label.category === category);
};

export const getLabelById = (id: string) => {
  return STANDARD_LABEL_SIZES.find(label => label.id === id);
};
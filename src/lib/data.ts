import placeholderData from './placeholder-images.json';

const { placeholderImages } = placeholderData;

const findImage = (id: string) => placeholderImages.find(img => img.id === id) || { imageUrl: '', imageHint: '' };

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  imageHint: string;
  category: string;
  stock: number;
};

export type Category = {
  id: string;
  name: string;
};

export const categories: Category[] = [
  { id: 'three-piece', name: 'Three-Piece' },
  { id: 'hijab', name: 'Hijab' },
  { id: 'bedsheet', name: 'Bedsheet' },
];

export const products: Product[] = [
  { 
    id: '1', 
    name: 'Elegant Floral Three-Piece', 
    price: 3200, 
    image: findImage('three-piece-1').imageUrl,
    imageHint: findImage('three-piece-1').imageHint,
    category: 'three-piece',
    stock: 10,
  },
  { 
    id: '2', 
    name: 'Modern Silk Three-Piece', 
    price: 4500, 
    image: findImage('three-piece-2').imageUrl,
    imageHint: findImage('three-piece-2').imageHint,
    category: 'three-piece',
    stock: 5,
  },
  { 
    id: '3', 
    name: 'Classic Cotton Three-Piece', 
    price: 2800, 
    image: findImage('three-piece-3').imageUrl,
    imageHint: findImage('three-piece-3').imageHint,
    category: 'three-piece',
    stock: 15,
  },
  {
    id: '9',
    name: 'Chic Summer Three-Piece',
    price: 3800,
    image: findImage('three-piece-4').imageUrl,
    imageHint: findImage('three-piece-4').imageHint,
    category: 'three-piece',
    stock: 8,
  },
  { 
    id: '4', 
    name: 'Premium Silk Hijab', 
    price: 1200, 
    image: findImage('hijab-1').imageUrl,
    imageHint: findImage('hijab-1').imageHint,
    category: 'hijab',
    stock: 0,
  },
  { 
    id: '5', 
    name: 'Soft Cotton Hijab', 
    price: 800, 
    image: findImage('hijab-2').imageUrl,
    imageHint: findImage('hijab-2').imageHint,
    category: 'hijab',
    stock: 20,
  },
  { 
    id: '6', 
    name: 'Georgette Patterned Hijab', 
    price: 950, 
    image: findImage('hijab-3').imageUrl,
    imageHint: findImage('hijab-3').imageHint,
    category: 'hijab',
    stock: 12,
  },
  { 
    id: '7', 
    name: 'Luxury King Size Bedsheet', 
    price: 5500, 
    image: findImage('bedsheet-1').imageUrl,
    imageHint: findImage('bedsheet-1').imageHint,
    category: 'bedsheet',
    stock: 7,
  },
  { 
    id: '8', 
    name: 'Floral Print Bedsheet', 
    price: 3500, 
    image: findImage('bedsheet-2').imageUrl,
    imageHint: findImage('bedsheet-2').imageHint,
    category: 'bedsheet',
    stock: 9,
  },
];

export const faqs = [
    {
        question: "What are the delivery charges?",
        answer: "Inside Rajshahi city, the delivery charge is 60 Taka. For the rest of Bangladesh, it is 120 Taka."
    },
    {
        question: "How long does delivery take?",
        answer: "Deliveries inside Rajshahi are typically completed within 24-48 hours. For other locations in Bangladesh, it may take 3-5 business days."
    },
    {
        question: "What is your return policy?",
        answer: "We offer a 7-day return policy for unused and undamaged products. Please contact our customer service to initiate a return."
    },
    {
        question: "Is Cash on Delivery (COD) available?",
        answer: "Yes, Cash on Delivery is available for all orders across Bangladesh."
    }
];

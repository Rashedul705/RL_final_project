

import placeholderData from './placeholder-images.json';

const { placeholderImages } = placeholderData;

const findImage = (id: string) => placeholderImages.find(img => img.id === id) || { imageUrl: '', imageHint: '' };

export type Product = {
  id: string;
  name: string;
  description: string;
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

export type Order = {
    id: string;
    customer: string;
    phone: string;
    address: string;
    amount: string;
    status: 'Delivered' | 'Shipped' | 'Processing' | 'Pending' | 'Cancelled';
    products: { name: string; quantity: number; price: number }[];
    date: string;
};

export const bangladeshDistricts = [
  'Bagerhat', 'Bandarban', 'Barguna', 'Barishal', 'Bhola', 'Bogra',
  'Brahmanbaria', 'Chandpur', 'Chapainawabganj', 'Chattogram', 'Chuadanga',
  'Comilla', 'Cox\'s Bazar', 'Dhaka', 'Dinajpur', 'Faridpur', 'Feni',
  'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur', 'Jashore',
  'Jhalokati', 'Jhenaidah', 'Joypurhat', 'Khagrachhari', 'Khulna',
  'Kishoreganj', 'Kurigram', 'Kushtia', 'Lakshmipur', 'Lalmonirhat',
  'Madaripur', 'Magura', 'Manikganj', 'Meherpur', 'Moulvibazar',
  'Munshiganj', 'Mymensingh', 'Naogaon', 'Narail', 'Narayanganj',
  'Narsingdi', 'Natore', 'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna',
  'Panchagarh', 'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi',
  'Rangamati', 'Rangpur', 'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj',
  'Sunamganj', 'Sylhet', 'Tangail', 'Thakurgaon'
].sort();


export const categories: Category[] = [
  { id: 'three-piece', name: 'Three-Piece' },
  { id: 'hijab', name: 'Hijab' },
  { id: 'bedsheet', name: 'Bedsheet' },
];

export const products: Product[] = [
  { 
    id: '1', 
    name: 'Elegant Floral Three-Piece', 
    description: 'A beautifully crafted three-piece suit with an elegant floral design. Made from high-quality fabric for a comfortable and stylish fit, perfect for any occasion.',
    price: 3200, 
    image: findImage('three-piece-1').imageUrl,
    imageHint: findImage('three-piece-1').imageHint,
    category: 'three-piece',
    stock: 10,
  },
  { 
    id: '2', 
    name: 'Modern Silk Three-Piece', 
    description: 'Experience luxury with our modern silk three-piece. The smooth texture and contemporary design make it a standout choice for formal events and celebrations.',
    price: 4500, 
    image: findImage('three-piece-2').imageUrl,
    imageHint: findImage('three-piece-2').imageHint,
    category: 'three-piece',
    stock: 5,
  },
  { 
    id: '3', 
    name: 'Classic Cotton Three-Piece', 
    description: 'Our classic cotton three-piece offers timeless style and unbeatable comfort. Ideal for daily wear, it combines traditional aesthetics with modern tailoring.',
    price: 2800, 
    image: findImage('three-piece-3').imageUrl,
    imageHint: findImage('three-piece-3').imageHint,
    category: 'three-piece',
    stock: 15,
  },
  {
    id: '9',
    name: 'Chic Summer Three-Piece',
    description: 'Stay cool and chic with our summer collection. This lightweight and breathable three-piece is perfect for warm weather, featuring a vibrant and breezy design.',
    price: 3800,
    image: findImage('three-piece-4').imageUrl,
    imageHint: findImage('three-piece-4').imageHint,
    category: 'three-piece',
    stock: 8,
  },
  { 
    id: '4', 
    name: 'Premium Silk Hijab', 
    description: 'Drape yourself in elegance with our premium silk hijab. Its soft, lustrous finish adds a touch of sophistication to any outfit.',
    price: 1200, 
    image: findImage('hijab-1').imageUrl,
    imageHint: findImage('hijab-1').imageHint,
    category: 'hijab',
    stock: 0,
  },
  { 
    id: '5', 
    name: 'Soft Cotton Hijab', 
    description: 'Comfortable and versatile, our soft cotton hijab is a wardrobe essential. Available in a variety of colors to match your style.',
    price: 800, 
    image: findImage('hijab-2').imageUrl,
    imageHint: findImage('hijab-2').imageHint,
    category: 'hijab',
    stock: 20,
  },
  { 
    id: '6', 
    name: 'Georgette Patterned Hijab', 
    description: 'Make a statement with this beautiful georgette hijab, featuring a unique pattern that adds a fashionable touch to your look.',
    price: 950, 
    image: findImage('hijab-3').imageUrl,
    imageHint: findImage('hijab-3').imageHint,
    category: 'hijab',
    stock: 12,
  },
  { 
    id: '7', 
    name: 'Luxury King Size Bedsheet', 
    description: 'Transform your bedroom into a sanctuary with our luxury king-size bedsheet set. Made from premium materials for a soft and comfortable night\'s sleep.',
    price: 5500, 
    image: findImage('bedsheet-1').imageUrl,
    imageHint: findImage('bedsheet-1').imageHint,
    category: 'bedsheet',
    stock: 7,
  },
  { 
    id: '8', 
    name: 'Floral Print Bedsheet', 
    description: 'Brighten up your bedroom with our beautiful floral print bedsheet. The vibrant design and soft fabric create a cheerful and inviting atmosphere.',
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

const generateSeededRandom = (seed: number) => {
    let state = seed;
    return () => {
        state = (state * 16807) % 2147483647;
        return state / 2147483647;
    };
};

const generateOrder = (index: number): Order => {
  const seededRandom = generateSeededRandom(index + 1);
  
  const customerNames = ['Sadia Islam', 'Karim Ahmed', 'Nusrat Jahan', 'Rahim Sheikh', 'Farhana Begum', 'Liam Smith', 'Olivia Jones', 'Noah Williams', 'Emma Brown', 'Oliver Taylor'];
  const phones = ['01712345678', '01823456789', '01934567890', '01645678901', '01556789012', '01345678901', '01456789012', '01567890123', '01678901234', '01789012345'];
  const addresses = ['Rajshahi', 'Dhaka', 'Chittagong', 'Sylhet', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh', 'Comilla', 'Gazipur'];
  const statuses: Order['status'][] = ['Delivered', 'Shipped', 'Processing', 'Pending', 'Cancelled'];
  
  const product1Index = Math.floor(seededRandom() * products.length);
  let product2Index = Math.floor(seededRandom() * products.length);
  while (product1Index === product2Index) {
    product2Index = Math.floor(seededRandom() * products.length);
  }
  const product1 = products[product1Index];
  const product2 = products[product2Index];


  const orderProducts = [{ name: product1.name, quantity: 1, price: product1.price }];
  let amount = product1.price;

  if (seededRandom() > 0.5) {
      orderProducts.push({ name: product2.name, quantity: 1, price: product2.price });
      amount += product2.price;
  }
  
  // Deterministic date generation
  const startDate = new Date(2024, 0, 1).getTime();
  const endDate = new Date().getTime();
  const randomDate = new Date(startDate + seededRandom() * (endDate - startDate));

  return {
    id: `ORD${String(index + 1).padStart(3, '0')}`,
    customer: customerNames[Math.floor(seededRandom() * customerNames.length)],
    phone: phones[Math.floor(seededRandom() * phones.length)],
    address: addresses[Math.floor(seededRandom() * addresses.length)],
    amount: String(amount),
    status: statuses[Math.floor(seededRandom() * statuses.length)],
    products: orderProducts,
    date: randomDate.toISOString().split('T')[0],
  };
};


export const recentOrders: Order[] = Array.from({ length: 50 }, (_, i) => generateOrder(i));

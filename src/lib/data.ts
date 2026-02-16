

import placeholderData from './placeholder-images.json';

const { placeholderImages } = placeholderData;

const findImage = (id: string) => placeholderImages.find(img => img.id === id) || { imageUrl: '', imageHint: '' };

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  imageHint: string;
  category: string;
  stock: number;
  sizeGuide?: string;
  size?: string;
  highlights?: string;
  slug?: string;
  attributes?: { name: string; options: string[] }[];
  variants?: any[];
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  image?: string;
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
  { id: 'plazo-khimar-set', name: 'Plazo Khimar Set' },
  { id: 'Men', name: 'Men' },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Elegant Floral Three-Piece',
    description: 'A beautifully crafted three-piece suit with an elegant floral design. Made from high-quality fabric for a comfortable and stylish fit, perfect for any occasion.',
    price: 3200,
    image: '/images/products/three-piece-1-new.png',
    images: [
      '/images/products/three-piece-1-new.png',
      '/images/products/three-piece-5-new.jpg',
      '/images/products/three-piece-6-new.png',
      '/images/products/three-piece-2-new.jpg',
    ],
    imageHint: 'Woman in grey floral three piece',
    category: 'three-piece',
    stock: 10,
    sizeGuide: "Small: Chest 36, Length 40\nMedium: Chest 38, Length 42\nLarge: Chest 40, Length 44",
    size: "Medium",
  },
  {
    id: '2',
    name: 'Modern Silk Three-Piece',
    description: 'Experience luxury with our modern silk three-piece. The smooth texture and contemporary design make it a standout choice for formal events and celebrations.',
    price: 4500,
    image: '/images/products/three-piece-2-new.jpg',
    images: [
      '/images/products/three-piece-2-new.jpg',
      '/images/products/three-piece-3-new.jpg',
      '/images/products/three-piece-7-new.jpg',
      '/images/products/three-piece-8-new.jpg',
    ],
    imageHint: 'Woman in grey floral three piece side view',
    category: 'three-piece',
    stock: 5,
    size: "Large",
  },
  {
    id: '3',
    name: 'Classic Cotton Three-Piece',
    description: 'Our classic cotton three-piece offers timeless style and unbeatable comfort. Ideal for daily wear, it combines traditional aesthetics with modern tailoring.',
    price: 2800,
    image: '/images/products/three-piece-3-new.jpg',
    images: [
      '/images/products/three-piece-3-new.jpg',
      '/images/products/three-piece-4-new.jpg',
      '/images/products/three-piece-9-new.jpg',
      '/images/products/three-piece-10-new.jpg',
    ],
    imageHint: 'Woman in grey floral three piece sitting',
    category: 'three-piece',
    stock: 15,
    size: "Small",
  },
  {
    id: '9',
    name: 'Chic Summer Three-Piece',
    description: 'Stay cool and chic with our summer collection. This lightweight and breathable three-piece is perfect for warm weather, featuring a vibrant and breezy design.',
    price: 3800,
    image: '/images/products/three-piece-4-new.jpg',
    images: [
      '/images/products/three-piece-4-new.jpg',
      '/images/products/three-piece-1-new.png',
      '/images/products/three-piece-8-new.jpg',
      '/images/products/three-piece-5-new.jpg',
    ],
    imageHint: 'Woman in cream floral three piece',
    category: 'three-piece',
    stock: 8,
    size: "Medium",
  },
  {
    id: '10',
    name: 'Plazo Khimar Set 1',
    description: 'A stylish and comfortable Plazo Khimar set.',
    price: 2500,
    image: '/images/products/khimar-set-1.jpg',
    images: [
      '/images/products/khimar-set-1.jpg',
      '/images/products/khimar-set-2.jpg',
      '/images/products/khimar-set-3.jpg',
      '/images/products/khimar-set-4.jpg',
    ],
    imageHint: 'Woman in black floral khimar',
    category: 'plazo-khimar-set',
    stock: 10,
    size: "Free Size",
  },
  {
    id: '11',
    name: 'Plazo Khimar Set 2',
    description: 'Elegant blue floral Plazo Khimar set with intricate design.',
    price: 2500,
    image: '/images/products/khimar-set-2.jpg',
    images: [
      '/images/products/khimar-set-2.jpg',
      '/images/products/khimar-set-3.jpg',
      '/images/products/khimar-set-4.jpg',
      '/images/products/khimar-set-5.jpg',
    ],
    imageHint: 'Woman in blue floral khimar',
    category: 'plazo-khimar-set',
    stock: 10,
    size: "Free Size",
  },
  {
    id: '12',
    name: 'Plazo Khimar Set 3',
    description: 'Contemporary abstract pattern Plazo Khimar set.',
    price: 2500,
    image: '/images/products/khimar-set-3.jpg',
    images: [
      '/images/products/khimar-set-3.jpg',
      '/images/products/khimar-set-4.jpg',
      '/images/products/khimar-set-5.jpg',
      '/images/products/khimar-set-1.jpg',
    ],
    imageHint: 'Woman in black and brown abstract khimar',
    category: 'plazo-khimar-set',
    stock: 10,
    size: "Free Size",
  },
  {
    id: '13',
    name: 'Plazo Khimar Set 4',
    description: 'Classic black and yellow floral Plazo Khimar set.',
    price: 2500,
    image: '/images/products/khimar-set-4.jpg',
    images: [
      '/images/products/khimar-set-4.jpg',
      '/images/products/khimar-set-5.jpg',
      '/images/products/khimar-set-1.jpg',
      '/images/products/khimar-set-2.jpg',
    ],
    imageHint: 'Woman in black and yellow floral khimar',
    category: 'plazo-khimar-set',
    stock: 10,
    size: "Free Size",
  },
  {
    id: '14',
    name: 'Plazo Khimar Set 5',
    description: 'Vibrant orange floral Plazo Khimar set.',
    price: 2500,
    image: '/images/products/khimar-set-5.jpg',
    images: [
      '/images/products/khimar-set-5.jpg',
      '/images/products/khimar-set-1.jpg',
      '/images/products/khimar-set-2.jpg',
      '/images/products/khimar-set-3.jpg',
    ],
    imageHint: 'Woman in black and orange floral khimar',
    category: 'plazo-khimar-set',
    stock: 10,
    size: "Free Size",
  },
  {
    id: '15',
    name: 'Exquisite Three-Piece Set',
    description: 'A stunning addition to our collection, featuring intricate details and premium fabric.',
    price: 3500,
    image: '/images/products/three-piece-5-new.jpg',
    images: [
      '/images/products/three-piece-5-new.jpg',
      '/images/products/three-piece-6-new.png',
      '/images/products/three-piece-7-new.jpg',
      '/images/products/three-piece-2-new.jpg',
    ],
    imageHint: 'Woman in cream floral three piece sitting',
    category: 'three-piece',
    stock: 10,
    size: "Unstitched",
  },
  {
    id: '16',
    name: 'Blue Floral Three-Piece',
    description: 'A vibrant blue floral three-piece set, perfect for casual outings.',
    price: 3200,
    image: '/images/products/three-piece-6-new.png',
    images: [
      '/images/products/three-piece-6-new.png',
      '/images/products/three-piece-7-new.jpg',
      '/images/products/three-piece-8-new.jpg',
      '/images/products/three-piece-1-new.png',
    ],
    imageHint: 'Woman in blue floral three piece',
    category: 'three-piece',
    stock: 10,
    size: "Unstitched",
  },
  {
    id: '17',
    name: 'Teal Elegance Three-Piece',
    description: 'Elegant teal three-piece with intricate embroidery.',
    price: 3800,
    image: '/images/products/three-piece-7-new.jpg',
    images: [
      '/images/products/three-piece-7-new.jpg',
      '/images/products/three-piece-8-new.jpg',
      '/images/products/three-piece-9-new.jpg',
      '/images/products/three-piece-2-new.jpg',
    ],
    imageHint: 'Woman in teal three piece garden',
    category: 'three-piece',
    stock: 10,
    size: "Unstitched",
  },
  {
    id: '18',
    name: 'Cyan Garden Three-Piece',
    description: 'Beautiful cyan three-piece set with nature-inspired prints.',
    price: 3500,
    image: '/images/products/three-piece-8-new.jpg',
    images: [
      '/images/products/three-piece-8-new.jpg',
      '/images/products/three-piece-9-new.jpg',
      '/images/products/three-piece-10-new.jpg',
      '/images/products/three-piece-3-new.jpg',
    ],
    imageHint: 'Woman in cyan three piece garden',
    category: 'three-piece',
    stock: 10,
    size: "Unstitched",
  },
  {
    id: '19',
    name: 'Sky Blue Patterned Set',
    description: 'Stylish sky blue three-piece with modern patterns.',
    price: 3000,
    image: '/images/products/three-piece-9-new.jpg',
    images: [
      '/images/products/three-piece-9-new.jpg',
      '/images/products/three-piece-10-new.jpg',
      '/images/products/three-piece-1-new.png',
      '/images/products/three-piece-4-new.jpg',
    ],
    imageHint: 'Woman in sky blue three piece',
    category: 'three-piece',
    stock: 10,
    size: "Unstitched",
  },
  {
    id: '20',
    name: 'Premium Blue Cotton Set',
    description: 'Premium blue cotton three-piece for maximum comfort.',
    price: 3600,
    image: '/images/products/three-piece-10-new.jpg',
    images: [
      '/images/products/three-piece-10-new.jpg',
      '/images/products/three-piece-2-new.jpg',
      '/images/products/three-piece-5-new.jpg',
      '/images/products/three-piece-8-new.jpg',
    ],
    imageHint: 'Woman in blue three piece sitting',
    category: 'three-piece',
    stock: 10,
  },
];

export const faqs = [
  {
    question: "১. আপনাদের কাছে কী কী কালেকশন পাওয়া যাবে?",
    answer: "আমাদের কাছে প্রিমিয়াম প্লাজো-খিমার সেট, শাড়ি, সালোয়ার কামিজ, কুর্তি এবং বিভিন্ন উৎসবের জন্য এক্সক্লুসিভ ডিজাইনার পোশাক পাওয়া যায়। আমাদের প্রতিটি পোশাকেই ঐতিহ্য এবং আধুনিকতার ছোঁয়া থাকে।"
  },
  {
    question: "২. ডেলিভারি চার্জ কত?",
    answer: "ঢাকার ভেতরে ডেলিভারি চার্জ সাধারণত ৭০-৮০ টাকা এবং ঢাকার বাইরে ১৩০-১৫০ টাকা। (অর্ডার কনফার্ম করার সময় সঠিক চার্জটি জানিয়ে দেওয়া হয়)।"
  },
  {
    question: "৩. পণ্য হাতে পেতে কতদিন সময় লাগে?",
    answer: "অর্ডার কনফার্ম করার পর ঢাকার ভেতরে ২-৩ দিন এবং ঢাকার বাইরে ৩-৫ দিনের মধ্যে ডেলিভারি করা হয়।"
  },
  {
    question: "৪. পেমেন্ট কীভাবে করা যাবে?",
    answer: "আমরা 'ক্যাশ অন ডেলিভারি' (COD) এবং বিকাশ/নগদ বা ব্যাংক পেমেন্টের সুবিধা দিয়ে থাকি।"
  },
  {
    question: "৫. পোশাকে কোনো সমস্যা থাকলে পরিবর্তন করা যাবে কি?",
    answer: "হ্যাঁ, পণ্য হাতে পাওয়ার পর কোনো ত্রুটি থাকলে বা সাইজ না মিললে নির্দিষ্ট সময়ের মধ্যে এক্সচেঞ্জ করার সুযোগ রয়েছে। তবে সেক্ষেত্রে পণ্যটি অব্যবহৃত এবং ট্যাগসহ থাকতে হবে।"
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
  const endDate = new Date(2024, 6, 25).getTime(); // Use a fixed end date
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

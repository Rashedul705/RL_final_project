
import mongoose, { Schema, Document, Model } from 'mongoose';

// --- Product Schema ---
export interface IProduct extends Document {
    id: string; // We'll keep 'id' for compatibility, but Mongoose uses _id
    name: string;
    description: string;
    price: number;
    image: string;
    images: string[];
    imageHint: string;
    category: string;
    stock: number;
    sizeGuide?: string;
    size?: string;
    highlights?: string;
}

const ProductSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    imageHint: { type: String, default: '' },
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    sizeGuide: { type: String },
    size: { type: String },
    highlights: { type: String },
}, { timestamps: true });

// --- Order Schema ---
export interface IOrder extends Document {
    id: string;
    customer: string;
    email?: string; // Link to user account
    phone: string;
    address: string;
    amount: string;
    status: 'Delivered' | 'Shipped' | 'Processing' | 'Pending' | 'Cancelled';
    products: { productId: string; name: string; quantity: number; price: number, image?: string }[];
    date: string; // ISO String
}

const OrderSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    customer: { type: String, required: true },
    email: { type: String }, // Optional linkage
    phone: { type: String, required: true },
    address: { type: String, required: true },
    amount: { type: String, required: true },
    status: {
        type: String,
        enum: ['Delivered', 'Shipped', 'Processing', 'Pending', 'Cancelled'],
        default: 'Pending'
    },
    products: [{
        productId: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String }
    }],
    date: { type: String, required: true }
}, { timestamps: true });

// --- Category Schema ---
export interface ICategory extends Document {
    id: string;
    name: string;
    description?: string;
    image?: string;
}

const CategorySchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String }
}, { timestamps: true });



// --- Shipping Method Schema ---
export interface IShippingMethod extends Document {
    name: string;
    cost: number;
    estimatedTime: string;
    status: 'active' | 'inactive';
}

const ShippingMethodSchema: Schema = new Schema({
    name: { type: String, required: true },
    cost: { type: Number, required: true },
    estimatedTime: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

// --- Inquiry Schema ---
export interface IInquiry extends Document {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    status: 'new' | 'read' | 'replied';
}

const InquirySchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'read', 'replied'], default: 'new' }
}, { timestamps: true });

// Prevent localized model recompilation error in Next.js
// AND force schema updates in dev mode by deleting old models if they exist
if (process.env.NODE_ENV !== 'production') {
    if (mongoose.models.Product) delete mongoose.models.Product;
    if (mongoose.models.Order) delete mongoose.models.Order;
    if (mongoose.models.Category) delete mongoose.models.Category;
    if (mongoose.models.User) delete mongoose.models.User;
    if (mongoose.models.ShippingMethod) delete mongoose.models.ShippingMethod;
    if (mongoose.models.Inquiry) delete mongoose.models.Inquiry;
}

export const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
export const ShippingMethod: Model<IShippingMethod> = mongoose.models.ShippingMethod || mongoose.model<IShippingMethod>('ShippingMethod', ShippingMethodSchema);
export const Inquiry: Model<IInquiry> = mongoose.models.Inquiry || mongoose.model<IInquiry>('Inquiry', InquirySchema);

// --- User Schema ---
export interface IUser extends Document {
    name: string;
    email: string;
    password?: string; // Optional if using external auth later, but needed for simple auth
    role: 'admin' | 'user';
    image?: string;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // In a real app, this should be hashed. keeping simple for demo or will use hashing in service
    role: { type: String, enum: ['admin', 'manager', 'editor', 'user'], default: 'user' },
    image: { type: String },
    phone: { type: String },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    birthday: { type: String }, // Format: YYYY-MM-DD
    addressBook: [{
        fullName: { type: String },
        phone: { type: String },
        address: { type: String },
        city: { type: String }, // district/region
        postcode: { type: String },
        isDefaultShipping: { type: Boolean, default: false },
        isDefaultBilling: { type: Boolean, default: false }
    }]
}, { timestamps: true });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

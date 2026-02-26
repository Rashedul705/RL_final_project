
import mongoose, { Schema, Document, Model } from 'mongoose';

// --- Product Schema ---
// --- Product Schema ---
export interface IVariant {
    name: string; // e.g. "Red-S"
    attributes: Record<string, string>; // { "Color": "Red", "Size": "S" }
    price: number;
    stock: number;
    sku?: string;
    image?: string;
}

export interface IProduct extends Document {
    id: string; // We'll keep 'id' for compatibility, but Mongoose uses _id
    name: string;
    description: string;
    price: number;
    image: string;
    images: string[];
    imageHint: string;
    category: string;
    brand?: string; // Brand ID/Slug
    stock: number;
    sizeGuide?: string;
    size?: string; // Legacy field, keeping for backward compatibility
    highlights?: string;
    slug: string;
    attributes?: { name: string; options: string[] }[];
    variants?: IVariant[];
}

const ProductSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String }, // Should be unique in practice
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    imageHint: { type: String, default: '' },
    category: { type: String, required: true },
    brand: { type: String }, // Optional reference to Brand
    stock: { type: Number, required: true, default: 0 },
    sizeGuide: { type: String },
    size: { type: String },
    highlights: { type: String },
    attributes: [{
        name: { type: String, required: true },
        options: { type: [String], required: true }
    }],
    variants: [{
        name: { type: String, required: true },
        attributes: { type: Map, of: String },
        price: { type: Number, required: true },
        stock: { type: Number, required: true },
        sku: { type: String },
        image: { type: String }
    }]
}, { timestamps: true });

// --- Order Schema ---
export interface IOrder extends Document {
    id: string;
    customer: string;
    email?: string; // Link to user account
    phone: string;
    address: string; // Full address string including city
    amount: string; // Grand Total
    shippingCharge: number;
    status: 'Pending' | 'Packaging' | 'Handed Over to Courier' | 'Delivered' | 'Cancelled' | 'Returned';
    products: {
        productId: string;
        name: string;
        quantity: number;
        price: number;
        image?: string;
        variantId?: string;
        variantName?: string;
        attributes?: Record<string, string>;
    }[];
    date: string; // ISO String
    subtotal: number;
    discount: number;
    couponCode?: string;
    consignment_id?: string;
    tracking_code?: string;
}

const OrderSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    customer: { type: String, required: true },
    email: { type: String }, // Optional linkage
    phone: { type: String, required: true },
    address: { type: String, required: true },
    amount: { type: String, required: true },
    shippingCharge: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['Pending', 'Packaging', 'Handed Over to Courier', 'Delivered', 'Cancelled', 'Returned'],
        default: 'Pending'
    },
    products: [{
        productId: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String },
        variantId: { type: String },
        variantName: { type: String },
        attributes: { type: Map, of: String }
    }],
    date: { type: String, required: true },
    subtotal: { type: Number },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    consignment_id: { type: String },
    tracking_code: { type: String }
}, { timestamps: true });

// --- Category Schema ---
export interface ICategory extends Document {
    id: string;
    name: string;
    description?: string;
    image?: string;
    order?: number;
}

const CategorySchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    order: { type: Number, default: 0 }
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
    estimatedTime: { type: String },
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
    reply?: string;
    repliedAt?: Date;
}

const InquirySchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'read', 'replied'], default: 'new' },
    reply: { type: String },
    repliedAt: { type: Date }
}, { timestamps: true });

// --- Blacklist Schema ---
export interface IBlacklist extends Document {
    phone: string;
    reason?: string;
}

const BlacklistSchema: Schema = new Schema({
    phone: { type: String, required: true, unique: true },
    reason: { type: String }
}, { timestamps: true });

// --- Abandoned Cart Schema ---
export interface IAbandonedCart extends Document {
    phone: string;
    name: string;
    address?: string; // NEW FIELD
    products: {
        productId: string;
        name: string;
        quantity: number;
        price: number;
        image?: string;
        variantId?: string;
        variantName?: string;
    }[];
}

const AbandonedCartSchema: Schema = new Schema({
    phone: { type: String, required: true, unique: true }, // Store latest cart by phone
    name: { type: String, required: true },
    address: { type: String }, // NEW FIELD
    products: [{
        productId: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String },
        variantId: { type: String },
        variantName: { type: String }
    }]
}, { timestamps: true });


// --- OTP Schema ---
export interface IOTP extends Document {
    phone: string;
    otp: string;
    expiresAt: Date;
}

const OTPSchema: Schema = new Schema({
    phone: { type: String, required: true, unique: true }, // One active OTP per phone
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true, expires: 0 } // Auto-delete after expiry
}, { timestamps: true });

if (process.env.NODE_ENV !== 'production') {
    if (mongoose.models.OTP) delete mongoose.models.OTP;
}

export const OTP: Model<IOTP> = mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema);

// Prevent localized model recompilation error in Next.js
// AND force schema updates in dev mode by deleting old models if they exist
if (process.env.NODE_ENV !== 'production') {
    if (mongoose.models.Product) delete mongoose.models.Product;
    if (mongoose.models.Order) delete mongoose.models.Order;
    if (mongoose.models.Category) delete mongoose.models.Category;
    if (mongoose.models.User) delete mongoose.models.User;
    if (mongoose.models.ShippingMethod) delete mongoose.models.ShippingMethod;
    if (mongoose.models.Inquiry) delete mongoose.models.Inquiry;
    if (mongoose.models.Blacklist) delete mongoose.models.Blacklist;
    if (mongoose.models.AbandonedCart) delete mongoose.models.AbandonedCart;
}

export const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
export const ShippingMethod: Model<IShippingMethod> = mongoose.models.ShippingMethod || mongoose.model<IShippingMethod>('ShippingMethod', ShippingMethodSchema);
export const Inquiry: Model<IInquiry> = mongoose.models.Inquiry || mongoose.model<IInquiry>('Inquiry', InquirySchema);
export const Blacklist: Model<IBlacklist> = mongoose.models.Blacklist || mongoose.model<IBlacklist>('Blacklist', BlacklistSchema);
export const AbandonedCart: Model<IAbandonedCart> = mongoose.models.AbandonedCart || mongoose.model<IAbandonedCart>('AbandonedCart', AbandonedCartSchema);

// --- Coupon Schema ---
export interface ICoupon extends Document {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderValue?: number;
    maxDiscountAmount?: number;
    expiryDate?: Date;
    usageLimit?: number;
    usageLimitPerUser?: number;
    usedCount: number;
    isActive: boolean;
}

const CouponSchema: Schema = new Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['percentage', 'fixed', 'free_shipping'], required: true },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number },
    expiryDate: { type: Date },
    usageLimit: { type: Number },
    usageLimitPerUser: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

if (process.env.NODE_ENV !== 'production') {
    if (mongoose.models.Coupon) delete mongoose.models.Coupon;
}

export const Coupon: Model<ICoupon> = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);

// --- Customer Schema ---
export interface ICustomer extends Document {
    id: string; // Unique ID (e.g., phone number or generated)
    name: string;
    phone: string;
    email?: string;
    address?: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: Date;
    joinedAt: Date;
}

const CustomerSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true }, // We will use phone number as ID usually, or UUID
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String },
    address: { type: String },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastOrderDate: { type: Date },
    joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });

if (process.env.NODE_ENV !== 'production') {
    if (mongoose.models.Customer) delete mongoose.models.Customer;
}

export const Customer: Model<ICustomer> = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);

// --- Analytics Schema ---
export interface IAnalytics extends Document {
    date: Date; // Normalized to start of day
    visitors: number; // Unique visitors count
    pageViews: {
        page: string;
        views: number;
        uniqueVisitors: number;
        avgTimeOnPage: number; // in seconds
    }[];
    trafficSources: {
        source: string; // e.g., 'Google', 'Facebook', 'Direct'
        count: number;
    }[];
    locations: {
        city: string;
        country: string;
        count: number;
    }[];
    deviceStats: {
        device: string; // 'Mobile', 'Desktop', 'Tablet'
        count: number;
    }[];
}

const AnalyticsSchema: Schema = new Schema({
    date: { type: Date, required: true, unique: true },
    visitors: { type: Number, default: 0 },
    pageViews: [{
        page: { type: String, required: true },
        views: { type: Number, default: 0 },
        uniqueVisitors: { type: Number, default: 0 },
        avgTimeOnPage: { type: Number, default: 0 }
    }],
    trafficSources: [{
        source: { type: String, required: true },
        count: { type: Number, default: 0 }
    }],
    locations: [{
        city: { type: String, required: true },
        country: { type: String, required: true },
        count: { type: Number, default: 0 }
    }],
    deviceStats: [{
        device: { type: String, required: true },
        count: { type: Number, default: 0 }
    }]
}, { timestamps: true });

if (process.env.NODE_ENV !== 'production') {
    if (mongoose.models.Analytics) delete mongoose.models.Analytics;
}

export const Analytics: Model<IAnalytics> = mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

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

// --- Brand Schema ---
export interface IBrand extends Document {
    id: string; // slug
    name: string;
    description?: string;
    image?: string;
}

const BrandSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String }
}, { timestamps: true });

if (process.env.NODE_ENV !== 'production') {
    if (mongoose.models.Brand) delete mongoose.models.Brand;
}

export const Brand: Model<IBrand> = mongoose.models.Brand || mongoose.model<IBrand>('Brand', BrandSchema);

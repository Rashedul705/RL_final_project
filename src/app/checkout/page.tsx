
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/components/cart/cart-context';
import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Minus, Truck } from 'lucide-react';
import { bangladeshDistricts } from '@/lib/data';
import { useAuth } from '@/components/providers/auth-provider';
import { apiClient } from '@/lib/api-client';


const formSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
    phoneNumber: z.string().regex(/^01[0-9]{9}$/, 'Please enter a valid 11-digit phone number starting with 01.'),
    city: z.string().min(1, 'Please select a district.'),
    fullAddress: z.string().min(10, 'Full address must be at least 10 characters.'),
    // shippingMethodId: z.string().min(1, 'Please select a shipping method.'),
});

type ShippingMethod = {
    _id: string;
    name: string;
    cost: number;
    estimatedTime: string;
    status: 'active' | 'inactive';
};

export default function CheckoutPage() {
    const { cart, clearCart, updateQuantity } = useCart();
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
    const [selectedMethod, setSelectedMethod] = useState<ShippingMethod | null>(null);

    // Coupon State
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);



    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            phoneNumber: "",
            city: "",
            fullAddress: "",
        },
    });

    const watchedCity = form.watch('city');
    const [shippingCost, setShippingCost] = useState(0);

    // Dynamic Shipping State
    const [rates, setRates] = useState<{ dhaka: number, rajshahi: number, outside: number, free: boolean }>({ dhaka: 80, rajshahi: 60, outside: 110, free: false });

    useEffect(() => {
        const fetchShippingRates = async () => {
            try {
                const methods = await apiClient.get<ShippingMethod[]>('/shipping');
                if (methods) {
                    const dhaka = methods.find(m => m.name === 'Inside Dhaka')?.cost || 80;
                    const rajshahi = methods.find(m => m.name === 'Inside Rajshahi')?.cost || 60;
                    const outside = methods.find(m => m.name === 'Outside Dhaka')?.cost || 110;
                    const freeMethod = methods.find(m => m.name === 'Free Shipping');
                    const isFree = freeMethod?.status === 'active';

                    setRates({ dhaka, rajshahi, outside, free: isFree });
                }
            } catch (error) {
                console.error("Failed to fetch shipping rates", error);
            }
        };
        fetchShippingRates();
    }, []);

    useEffect(() => {
        if (rates.free) {
            setShippingCost(0);
            return;
        }

        if (watchedCity) {
            const city = watchedCity.toLowerCase();
            if (city === 'dhaka') {
                setShippingCost(rates.dhaka);
            } else if (city === 'rajshahi') {
                setShippingCost(rates.rajshahi);
            } else {
                setShippingCost(rates.outside);
            }
        } else {
            setShippingCost(0);
        }
    }, [watchedCity, rates]);

    // Google Analytics 4 (GA4) Begin Checkout
    const beginCheckoutFired = useRef(false);
    useEffect(() => {
        if (cart.length > 0 && !beginCheckoutFired.current) {
            beginCheckoutFired.current = true;

            // Calculate value for the event
            const cartValue = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

            // @ts-ignore
            window.dataLayer = window.dataLayer || [];
            // @ts-ignore
            window.dataLayer.push({ ecommerce: null }); // Clear previous
            // @ts-ignore
            window.dataLayer.push({
                event: "begin_checkout",
                ecommerce: {
                    currency: "BDT",
                    value: cartValue,
                    items: cart.map(item => ({
                        item_id: item.product.id,
                        item_name: item.product.name,
                        price: item.product.price,
                        item_category: item.product.category,
                        quantity: item.quantity
                    }))
                }
            });
        }
    }, [cart]);



    const subtotal = cart.reduce(
        (acc, item) => acc + item.product.price * item.quantity,
        0
    );

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsValidatingCoupon(true);
        try {
            const phoneNumber = form.getValues('phoneNumber');
            const response = await apiClient.post<{ valid: boolean; discount: number; code: string }>('/coupons/validate', {
                code: couponCode,
                cartTotal: subtotal,
                customerPhone: phoneNumber
            });

            if (response && response.valid) {
                setAppliedCoupon({ code: response.code, discount: response.discount });
                toast({
                    title: "Coupon Applied",
                    description: `You saved BDT ${response.discount}`,
                });
            }
        } catch (error: any) {
            toast({
                title: "Invalid Coupon",
                description: error.message || "This coupon is not valid.",
                variant: "destructive"
            });
            setAppliedCoupon(null);
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode("");
    };

    const total = subtotal + shippingCost - (appliedCoupon?.discount || 0);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const orderId = `ORD${Math.floor(1000 + Math.random() * 9000)}`;



        const orderData = {
            id: orderId,
            customer: values.fullName,
            email: user?.email,
            phone: values.phoneNumber,
            address: `${values.fullAddress}, ${values.city}`,
            amount: total.toString(),
            status: 'Pending',
            products: cart.map(item => ({
                productId: item.product.id,
                name: item.product.name,
                quantity: item.quantity,
                price: item.product.price,
                image: item.product.image
            })),
            date: new Date().toISOString(),
            // shippingInfo replaced by dynamic block below
            shippingInfo: {
                ...values,
                methodName: 'Standard Delivery', // simplified for dynamic logic
                estimatedTime: '2-3 Days',
            },
            subtotal,
            shippingCharge: shippingCost,
            discount: appliedCoupon?.discount || 0,
            couponCode: appliedCoupon?.code
        };

        try {
            await apiClient.post('/orders', orderData);

            toast({
                title: 'Order Placed!',
                description: `Your order ${orderId} has been placed successfully.`,
            });
            clearCart();
            router.push(`/thank-you?orderId=${orderId}`);

        } catch (error: any) {

            if (error.message && error.message.includes('blocked')) {
                // Redirect to specialized assistance page instead of showing toast
                router.push('/order-assistance');
                return;
            }

            console.error("Order failed:", error);


            // Fallback: Save to Local Storage
            const offlineOrders = JSON.parse(localStorage.getItem('offline_orders') || '[]');
            const offlineOrder = { ...orderData, isOffline: true };
            offlineOrders.push(offlineOrder);
            localStorage.setItem('offline_orders', JSON.stringify(offlineOrders));

            toast({
                title: 'Order Saved Locally',
                description: 'Network issue detected. Your order has been saved to your device.',
                variant: "default"
            });
            clearCart();
            router.push(`/thank-you?orderId=${orderId}`);
        }
    }

    if (cart.length === 0 && subtotal === 0) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 flex items-center justify-center text-center">
                    <div>
                        <h1 className="text-2xl font-semibold mb-4">Your Cart is Empty</h1>
                        <p className="text-muted-foreground mb-8">You can't proceed to checkout without any items.</p>
                        <Button onClick={() => router.push('/')}>Go Shopping</Button>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-muted/30">
            <Header />
            <main className="flex-1 py-8 md:py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Checkout</h1>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Shipping Details */}
                        <div className="lg:col-span-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Shipping Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} id="checkout-form" className="space-y-6">
                                            <FormField
                                                control={form.control}
                                                name="fullName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Full Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g. Jane Doe" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="phoneNumber"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Phone Number</FormLabel>
                                                        <FormControl>
                                                            <Input type="tel" placeholder="e.g. 01712345678" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="city"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>City / District</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select your district" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {bangladeshDistricts.map((district) => (
                                                                    <SelectItem key={district} value={district}>
                                                                        {district}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="fullAddress"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Full Address</FormLabel>
                                                        <FormControl>
                                                            <Textarea placeholder="e.g. House 123, Road 4, Sector 5, City" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Shipping Method Auto-calculated based on City */}
                                            <div className="rounded-md bg-muted p-4">
                                                <p className="text-sm font-medium">Shipping Charge</p>
                                                <p className="text-2xl font-bold text-primary">BDT {shippingCost}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {rates.free ? 'Free Shipping Applied' : (watchedCity ? (watchedCity.toLowerCase() === 'dhaka' ? 'Inside Dhaka Rate' : (watchedCity.toLowerCase() === 'rajshahi' ? 'Inside Rajshahi Rate' : 'Outside Dhaka Rate')) : 'Select a city to calculate')}
                                                </p>
                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-2">
                            <Card className="sticky top-24">
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        {cart.map(item => (
                                            <div key={item.product.id} className="flex items-center gap-4">
                                                <div className="relative h-16 w-16 rounded-md overflow-hidden">
                                                    <Image
                                                        src={item.product.image}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium leading-tight">{item.product.name}</p>
                                                    <div className="flex items-center mt-1">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-6 w-6 text-primary hover:bg-primary hover:text-primary-foreground"
                                                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <Input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => {
                                                                const value = parseInt(e.target.value);
                                                                if (value > 0) {
                                                                    updateQuantity(item.product.id, value)
                                                                }
                                                            }}
                                                            className="h-6 w-10 rounded-none border-x-0 text-center px-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-6 w-6 text-primary hover:bg-primary hover:text-primary-foreground"
                                                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                            disabled={item.product.stock !== undefined && item.quantity >= item.product.stock}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="text-sm font-medium">
                                                    {(item.product.price * item.quantity).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>BDT {subtotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Shipping {watchedCity ? (watchedCity.toLowerCase() === 'dhaka' ? '(Inside Dhaka)' : (watchedCity.toLowerCase() === 'rajshahi' ? '(Inside Rajshahi)' : '(Outside Dhaka)')) : ''}</span>
                                            <span>BDT {shippingCost.toLocaleString()}</span>
                                        </div>
                                        {appliedCoupon && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount ({appliedCoupon.code})</span>
                                                <span>- BDT {appliedCoupon.discount.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                    <Separator />
                                    {/* Coupon Input */}
                                    {!appliedCoupon ? (
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Coupon Code"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                            />
                                            <Button
                                                variant="outline"
                                                onClick={handleApplyCoupon}
                                                disabled={!couponCode || isValidatingCoupon}
                                            >
                                                {isValidatingCoupon ? "..." : "Apply"}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between bg-green-50 p-2 rounded border border-green-200">
                                            <span className="text-sm font-medium text-green-700">Coupon applied!</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-auto p-1 text-green-700 hover:text-green-800 hover:bg-green-100"
                                                onClick={handleRemoveCoupon}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>BDT {total.toLocaleString()}</span>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h3 className="font-semibold mb-2">Payment Method</h3>
                                        <div className="rounded-md border border-primary bg-primary/10 p-4 text-center">
                                            <p className="font-medium text-primary">Cash on Delivery</p>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        type="button"
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                                        onClick={(e) => {
                                            form.handleSubmit(onSubmit)(e);
                                        }}
                                        disabled={form.formState.isSubmitting}
                                    >
                                        Place Order
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </div>
            </main >
            <Footer />
        </div >
    );
}

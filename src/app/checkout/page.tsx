
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from '@/components/cart/cart-context';
import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Minus, Truck } from 'lucide-react';
import { bangladeshDistricts, bangladeshUpazilas } from '@/lib/data';
import { useAuth } from '@/components/providers/auth-provider';
import { apiClient } from '@/lib/api-client';
import { sendGTMEvent } from '@/lib/gtm';


import { pushUserData } from '@/lib/data-layer';

const formSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
    phoneNumber: z.string().regex(/^01[0-9]{9}$/, 'Please enter a valid 11-digit phone number starting with 01.'),
    city: z.string().min(1, 'Please select a district.'),
    thana: z.string().min(1, 'Please select your Thana/Upazila.'),
    fullAddress: z.string().min(10, 'Full address must be at least 10 characters.'),
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
    const [isOtpEnabled, setIsOtpEnabled] = useState(true);
    const hasFiredBeginCheckout = useRef(false);

    // OTP State
    const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
    const [otp, setOtp] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isOtpDialogOpen && timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (isOtpDialogOpen && timeLeft === 0) {
            setCanResend(true);
        }
        return () => clearTimeout(timer);
    }, [timeLeft, isOtpDialogOpen]);

    useEffect(() => {
        if (cart.length > 0 && !hasFiredBeginCheckout.current) {
            sendGTMEvent({
                event: 'begin_checkout',
                value: cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0),
                currency: 'BDT',
                items: cart.map(item => ({
                    item_id: item.product.id,
                    item_name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                    discount: 0
                }))
            });
            hasFiredBeginCheckout.current = true;
        }
    }, [cart]);

    // Fetch Global Settings for OTP Config
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await apiClient.get<any>('/settings');
                if (data) {
                    const enabled = data.isOtpEnabled ?? true;
                    setIsOtpEnabled(enabled);
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };
        fetchSettings();
    }, []);

    // Coupon State
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: string } | null>(null);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);



    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            phoneNumber: "",
            city: "",
            thana: "",
            fullAddress: "",
        },
    });

    const watchedCity = form.watch('city');
    const [shippingCost, setShippingCost] = useState(0);

    // Reset Thana whenever City changes
    useEffect(() => {
        form.setValue('thana', '');
    }, [watchedCity, form]);

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

    useEffect(() => {
        if (appliedCoupon?.type === 'free_shipping' && appliedCoupon.discount !== shippingCost) {
            setAppliedCoupon(prev => prev ? ({ ...prev, discount: shippingCost }) : null);
        }
    }, [shippingCost, appliedCoupon]);





    const subtotal = cart.reduce(
        (acc, item) => acc + item.product.price * item.quantity,
        0
    );

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsValidatingCoupon(true);
        try {
            const phoneNumber = form.getValues('phoneNumber');
            const response = await apiClient.post<{ valid: boolean; discount: number; code: string; type: string }>('/coupons/validate', {
                code: couponCode,
                cartTotal: subtotal,
                customerPhone: phoneNumber
            });

            if (response && response.valid) {
                let finalDiscount = response.discount;
                if (response.type === 'free_shipping') {
                    finalDiscount = shippingCost;
                }
                setAppliedCoupon({ code: response.code, discount: finalDiscount, type: response.type });
                toast({
                    title: "Coupon Applied",
                    description: response.type === 'free_shipping' ? "Free Shipping Applied" : `You saved BDT ${finalDiscount}`,
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



    const handleSendOtp = async (values: z.infer<typeof formSchema>) => {
        setIsSendingOtp(true);
        try {
            // Bypass OTP if administratively disabled
            if (!isOtpEnabled) {
                await onSubmit(values);
                setIsSendingOtp(false);
                return;
            }

            // Track incomplete order / abandoned cart in background
            try {
                await apiClient.post('/abandoned-carts', {
                    phone: values.phoneNumber,
                    name: values.fullName,
                    address: `${values.fullAddress}, ${values.thana}, ${values.city}`,
                    products: cart.map(item => {
                        const variant = item.product.variants?.find((v: any) => v.id === item.variantId || v._id === item.variantId);
                        const displayImage = variant?.image || item.product.image;
                        return {
                            productId: item.product.id,
                            name: item.product.name,
                            quantity: item.quantity,
                            price: item.product.price,
                            image: displayImage,
                            variantId: item.variantId,
                            variantName: item.variantName
                        };
                    })
                });
            } catch (err) {
                console.error("Failed to save incomplete order tracking", err);
            }

            const response = await apiClient.post<{ success: boolean; message: string }>('/otp/send', {
                phone: values.phoneNumber
            });

            if (response && response.success) {
                setIsOtpDialogOpen(true);
                setTimeLeft(60);
                setCanResend(false);
                setOtp("");
                toast({
                    title: "OTP Sent",
                    description: "Please check your phone for the verification code.",
                });
            } else {
                toast({
                    title: "Failed to send OTP",
                    description: response?.message || "Please try again.",
                    variant: "destructive"
                });
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Something went wrong.",
                variant: "destructive"
            });
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        const val = value.replace(/\D/g, '');
        if (!val && value !== '') return;
        const char = val.slice(-1);

        let newOtpArray = otp.padEnd(4, ' ').split('');
        newOtpArray[index] = char || ' ';
        const newOtp = newOtpArray.join('').trimRight();
        setOtp(newOtp);

        if (char && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && (!otp[index] || otp[index] === ' ') && index > 0) {
            inputRefs.current[index - 1]?.focus();
            let newOtpArray = otp.padEnd(4, ' ').split('');
            newOtpArray[index - 1] = ' ';
            setOtp(newOtpArray.join('').trimRight());
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;
        const phone = form.getValues('phoneNumber');
        try {
            const response = await apiClient.post<{ success: boolean; message: string }>('/otp/send', {
                phone
            });
            if (response && response.success) {
                setTimeLeft(60);
                setCanResend(false);
                setOtp("");
                toast({ title: "OTP Resent", description: "Please check your phone." });
            } else {
                toast({ title: "Failed to resend", description: response?.message, variant: "destructive" });
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    async function onVerifyAndOrder() {
        if (!otp || otp.length < 4) {
            toast({
                title: "Invalid OTP",
                description: "Please enter a valid OTP.",
                variant: "destructive"
            });
            return;
        }

        setIsVerifying(true);
        try {
            const values = form.getValues();
            const response = await apiClient.post<{ success: boolean; message: string }>('/otp/verify', {
                phone: values.phoneNumber,
                otp
            });

            if (response && response.success) {
                await onSubmit(values);
            } else {
                toast({
                    title: "Invalid OTP",
                    description: response?.message || "The code you entered is incorrect.",
                    variant: "destructive"
                });
            }
        } catch (error: any) {
            toast({
                title: "Verification Failed",
                description: error.message || "Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsVerifying(false);
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Push user data to GTM
        pushUserData({
            email: user?.email,
            phone: values.phoneNumber,
            name: values.fullName
        });

        const orderId = `ORD${Math.floor(1000 + Math.random() * 9000)}`;



        const orderData = {
            id: orderId,
            customer: values.fullName,
            email: user?.email,
            phone: values.phoneNumber,
            address: `${values.fullAddress}, ${values.thana}, ${values.city}`,
            amount: total.toString(),
            status: 'Pending',
            products: cart.map(item => {
                // Resolve image: Variant Image > Product Image
                const variant = item.product.variants?.find((v: any) => v.id === item.variantId || v._id === item.variantId);
                const displayImage = variant?.image || item.product.image;

                return {
                    productId: item.product.id,
                    name: item.product.name,
                    quantity: item.quantity,
                    price: item.product.price, // Note: price might need to be item.variantPrice if we store it
                    image: displayImage,
                    variantId: item.variantId,
                    variantName: item.variantName,
                    attributes: item.attributes
                };
            }),
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

            toast({
                title: 'Order Failed',
                description: error.message || 'We could not process your order at this time. Please try again.',
                variant: "destructive"
            });

            // Note: We deliberately do NOT redirect to /thank-you here 
            // so that Facebook/GA4 URL-based purchase rules do not fire on failed orders.
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
                                        <form onSubmit={form.handleSubmit(handleSendOtp)} id="checkout-form" className="space-y-6">
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
                                                name="thana"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Thana / Upazila</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value} disabled={!watchedCity}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder={watchedCity ? "Select your Thana" : "Select District first"} />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {watchedCity && bangladeshUpazilas[watchedCity] ? (
                                                                    bangladeshUpazilas[watchedCity].map((upazila) => (
                                                                        <SelectItem key={upazila} value={upazila}>
                                                                            {upazila}
                                                                        </SelectItem>
                                                                    ))
                                                                ) : (
                                                                    <SelectItem value="none" disabled>Select District first</SelectItem>
                                                                )}
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
                                            <div key={`${item.product.id}-${item.variantId || 'default'}`} className="flex items-center gap-4">
                                                <div className="relative h-16 w-16 rounded-md overflow-hidden">
                                                    {(() => {
                                                        const variant = item.product.variants?.find((v: any) => v.id === item.variantId || v._id === item.variantId);
                                                        const displayImage = variant?.image || item.product.image;
                                                        return (
                                                            <Image
                                                                src={displayImage}
                                                                alt={item.product.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        );
                                                    })()}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium leading-tight">{item.product.name}</p>
                                                    <div className="flex items-center mt-1">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-6 w-6 text-primary hover:bg-primary hover:text-primary-foreground"
                                                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variantId)}
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
                                <CardFooter className="flex flex-col gap-4">
                                    <Button
                                        type="button"
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                                        onClick={(e) => {
                                            form.handleSubmit(handleSendOtp)(e);
                                        }}
                                        disabled={isSendingOtp}
                                    >
                                        {isSendingOtp ? "Sending OTP..." : "Continue"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </div>
            </main >

            <Footer />

            <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
                <DialogContent className="w-[92vw] sm:max-w-md p-6 sm:p-8 rounded-2xl border-0 shadow-xl bg-white" style={{ borderRadius: '1rem' }}>
                    <div className="space-y-6 sm:space-y-8">
                        <DialogHeader className="space-y-2 text-center sm:text-left">
                            <DialogTitle className="text-2xl font-bold text-gray-900">
                                OTP verification
                            </DialogTitle>
                            <DialogDescription className="text-[15px] text-gray-500 leading-relaxed">
                                Please enter the OTP (One-Time Password) sent to your registered email/phone number to complete your verification.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex justify-between gap-2 sm:gap-4 py-2">
                            {[0, 1, 2, 3].map((index) => (
                                <Input
                                    key={index}
                                    ref={(el) => { if (el) inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="\d*"
                                    maxLength={1}
                                    value={otp[index] && otp[index] !== ' ' ? otp[index] : ''}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    className="w-14 h-14 sm:w-16 sm:h-16 text-center text-2xl font-semibold rounded-xl border-gray-300 bg-white focus-visible:ring-2 focus-visible:ring-[#FE45A0] focus-visible:border-[#FE45A0] transition-shadow shadow-sm"
                                />
                            ))}
                        </div>

                        <div className="flex items-center justify-between text-sm py-2">
                            <span className="text-gray-600 font-medium">
                                Remaining time: <strong className="text-gray-900 font-bold ml-1">00:{timeLeft.toString().padStart(2, '0')}s</strong>
                            </span>
                            <span className="text-gray-600 font-medium flex items-center gap-1">
                                Didn't get the code?
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={!canResend}
                                    className={`font-bold transition-colors ml-1 ${canResend ? 'text-[#FE45A0] hover:text-[#d93887] hover:underline cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}
                                >
                                    Resend
                                </button>
                            </span>
                        </div>

                        <div className="space-y-3 pt-2">
                            <Button
                                type="button"
                                className="w-full h-12 sm:h-14 rounded-full bg-[#FE45A0] hover:bg-[#e03d8d] text-white text-base sm:text-lg font-semibold tracking-wide transition-colors"
                                onClick={onVerifyAndOrder}
                                disabled={isVerifying || otp.trim().length < 4}
                            >
                                {isVerifying ? "Verifying..." : "Verify"}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 sm:h-14 rounded-full border-2 border-[#FE45A0] text-[#FE45A0] hover:bg-[#fff0f6] text-base sm:text-lg font-semibold tracking-wide transition-colors bg-transparent"
                                onClick={() => setIsOtpDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}

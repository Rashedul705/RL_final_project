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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2, Phone } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { useCreateUserWithEmailAndPassword, useUpdateProfile, useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { useState, useEffect } from 'react';

const signupFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const phoneSchema = z.object({
    phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Enter a valid phone number with country code (e.g., +1234567890)'),
    otp: z.string().optional(),
});

export default function SignupPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('email');

    // Phone Auth State
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [phoneLoading, setPhoneLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    // Email Auth Hooks
    const [
        createUserWithEmailAndPassword,
        user,
        loading,
        error,
    ] = useCreateUserWithEmailAndPassword(auth);

    const [updateProfile, updating, updateError] = useUpdateProfile(auth);

    // Google Auth
    const [signInWithGoogle, gUser, gLoading, gError] = useSignInWithGoogle(auth);

    // Forms
    const form = useForm<z.infer<typeof signupFormSchema>>({
        resolver: zodResolver(signupFormSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const phoneForm = useForm<z.infer<typeof phoneSchema>>({
        resolver: zodResolver(phoneSchema),
        defaultValues: { phoneNumber: '', otp: '' }
    });

    // Effects
    useEffect(() => {
        if (user || gUser) {
            if (user) {
                // For email signup only (Phone signup doesn't set global 'user' from this hook yet, handled below)
            }
            router.push('/');
        }
    }, [user, gUser, router]);

    async function onSubmit(values: z.infer<typeof signupFormSchema>) {
        try {
            const res = await createUserWithEmailAndPassword(values.email, values.password);
            if (res && res.user) {
                try {
                    await updateProfile({ displayName: values.name });
                } catch (profileErr) {
                    console.error("Profile update failed:", profileErr);
                }
                toast({ title: 'Account Created', description: 'Welcome to Rodelas Lifestyle!' });
                // Redirect handled by useEffect or here
                router.push('/');
            }
        } catch (e) {
            console.error("Signup failed:", e);
        }
    }

    async function onGoogleLogin() {
        await signInWithGoogle();
    }

    // Phone Auth
    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-wrapper', {
                'size': 'invisible',
                'callback': (response: any) => {
                    // reCAPTCHA solved
                }
            });
        }
    };

    async function onPhoneSubmit(values: z.infer<typeof phoneSchema>) {
        setPhoneLoading(true);
        if (!otpSent) {
            try {
                setupRecaptcha();
                const appVerifier = window.recaptchaVerifier;
                const confirmation = await signInWithPhoneNumber(auth, values.phoneNumber, appVerifier);
                setConfirmationResult(confirmation);
                setOtpSent(true);
                toast({ title: 'OTP Sent', description: `Code sent to ${values.phoneNumber}` });
            } catch (err: any) {
                console.error(err);
                toast({ variant: 'destructive', title: 'Error', description: err.message });
                if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
            }
        } else {
            if (!values.otp) {
                phoneForm.setError('otp', { message: 'Enter the code.' });
                setPhoneLoading(false);
                return;
            }
            if (!confirmationResult) return;

            try {
                await confirmationResult.confirm(values.otp);
                toast({ title: 'Success', description: 'Account verified!' });
                router.push('/');
            } catch (err: any) {
                toast({ variant: 'destructive', title: 'Invalid Code', description: 'Please check the code.' });
            }
        }
        setPhoneLoading(false);
    }

    // Handle Errors
    if (error || updateError || gError) {
        const err = error || updateError || gError;
        console.error("Signup error:", err);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
            <Card className="w-full max-w-md shadow-lg border-0">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold tracking-tight">Create Account</CardTitle>
                    <CardDescription className="text-base">Join us to start shopping.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Google Button */}
                    <Button
                        variant="outline"
                        className="w-full h-12 text-base font-medium text-gray-700 bg-white border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-3 rounded-full transition-all"
                        onClick={onGoogleLogin}
                        disabled={loading || updating || gLoading || phoneLoading}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign up with Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">Or register with</span></div>
                    </div>

                    <Tabs defaultValue="email" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="email">Email</TabsTrigger>
                            <TabsTrigger value="phone">Phone</TabsTrigger>
                        </TabsList>

                        <TabsContent value="email">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Doe" {...field} suppressHydrationWarning />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="m@example.com" {...field} suppressHydrationWarning />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" {...field} suppressHydrationWarning />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" {...field} suppressHydrationWarning />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={loading || updating}>
                                        {(loading || updating) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign Up'}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="phone">
                            <Form {...phoneForm}>
                                <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                                    <FormField
                                        control={phoneForm.control}
                                        name="phoneNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl>
                                                    <div className="flex">
                                                        <Button variant="outline" className="rounded-r-none border-r-0 px-3 cursor-default hover:bg-background" type="button" tabIndex={-1}>
                                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                        <Input
                                                            placeholder="+1 555 555 5555"
                                                            className="rounded-l-none"
                                                            {...field}
                                                            disabled={otpSent}
                                                            suppressHydrationWarning
                                                        />
                                                    </div>
                                                </FormControl>
                                                <p className="text-xs text-muted-foreground mt-1">Format: +[CountryCode][Number]</p>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {otpSent && (
                                        <FormField
                                            control={phoneForm.control}
                                            name="otp"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Verification Code</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="123456" {...field} maxLength={6} suppressHydrationWarning />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    <div id="recaptcha-wrapper"></div>

                                    <Button type="submit" className="w-full" disabled={phoneLoading}>
                                        {phoneLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (otpSent ? 'Verify & Register' : 'Send Code')}
                                    </Button>

                                    {otpSent && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="w-full mt-2"
                                            onClick={() => { setOtpSent(false); setConfirmationResult(null); phoneForm.resetField('otp'); }}
                                        >
                                            Change Phone Number
                                        </Button>
                                    )}
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>

                </CardContent>
                <CardFooter className="flex justify-center">
                    <div className="text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary font-medium hover:underline">
                            Login
                        </Link>
                    </div>
                </CardFooter>
            </Card>

            <script dangerouslySetInnerHTML={{
                __html: `
        // Type augmentation helper if strictly needed
      `}} />
        </div>
    );
}

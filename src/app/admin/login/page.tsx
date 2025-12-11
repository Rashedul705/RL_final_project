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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Bot, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { useSignInWithEmailAndPassword, useSendPasswordResetEmail } from 'react-firebase-hooks/auth';

const loginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  pin: z.string().regex(/^\d{4}$/, 'Security PIN must be 4 digits.'),
});

const recoveryEmailSchema = z.object({
  recoveryEmail: z.string().email('Please enter a valid email address.'),
});

// Admin emails allowed (simple strict check for now)
const ALLOWED_ADMIN_EMAILS = [
  'admin@rodela.com',
  // Add other admin emails here or use process.env
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
].filter(Boolean);

export default function AdminLoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);

  // Firebase Hooks
  const [
    signInWithEmailAndPassword,
    user,
    loading,
    error,
  ] = useSignInWithEmailAndPassword(auth);

  const [sendPasswordResetEmail, sending, resetError] = useSendPasswordResetEmail(auth);

  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      pin: '',
    },
  });

  const recoveryFormEmail = useForm<z.infer<typeof recoveryEmailSchema>>({
    resolver: zodResolver(recoveryEmailSchema),
    defaultValues: { recoveryEmail: '' },
  });

  // Handle Firebase Login Errors
  useEffect(() => {
    if (error) {
      let msg = 'Invalid credentials.';
      if (error.code === 'auth/invalid-credential') msg = 'Invalid email or password.';
      if (error.code === 'auth/user-not-found') msg = 'User not found.';
      if (error.code === 'auth/wrong-password') msg = 'Incorrect password.';
      if (error.code === 'auth/too-many-requests') msg = 'Too many failed attempts. Try again later.';

      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: msg,
      });
    }
  }, [error, toast]);

  // Handle Login Success
  useEffect(() => {
    if (user) {
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      router.push('/admin');
    }
  }, [user, router, toast]);

  async function onLoginSubmit(values: z.infer<typeof loginFormSchema>) {
    const { email, password, pin } = values;

    // 1. PIN Check (Local Security Layer)
    const validPin = process.env.NEXT_PUBLIC_ADMIN_PIN || '9999';
    if (pin !== validPin) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'Invalid Security PIN.',
      });
      return;
    }

    // 2. Allowed Admin Domain/Email Check
    // In production, use Firebase Custom Claims for true admin security.
    if (!ALLOWED_ADMIN_EMAILS.includes(email) && !email.endsWith('@rodela.com')) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'This email is not authorized for admin access.',
      });
      return;
    }

    // 3. Firebase Login
    await signInWithEmailAndPassword(email, password);
  }

  async function onRecoveryEmailSubmit(values: z.infer<typeof recoveryEmailSchema>) {
    const success = await sendPasswordResetEmail(values.recoveryEmail);
    if (success) {
      toast({
        title: 'Reset Link Sent',
        description: `Check ${values.recoveryEmail} for a password reset link.`,
      });
      setIsRecoveryOpen(false);
      recoveryFormEmail.reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: resetError?.message || 'Failed to send reset email.',
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary p-3">
              <Bot className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@rodela.com" {...field} suppressHydrationWarning />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} suppressHydrationWarning />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security PIN</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••" maxLength={4} {...field} suppressHydrationWarning />
                    </FormControl>
                    <FormMessage />
                    <p className="text-[10px] text-muted-foreground text-right">* Check .env for PIN</p>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? 'Authenticating...' : 'Login to Admin Dashboard'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            <Dialog open={isRecoveryOpen} onOpenChange={setIsRecoveryOpen}>
              <DialogTrigger asChild>
                <Button variant="link" className="p-0 h-auto">Forgot Password?</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Password</DialogTitle>
                  <DialogDescription>
                    Enter your email to receive a password reset link.
                  </DialogDescription>
                </DialogHeader>

                <Form {...recoveryFormEmail}>
                  <form onSubmit={recoveryFormEmail.handleSubmit(onRecoveryEmailSubmit)} id="recovery-email-form" className="space-y-4 pt-4">
                    <FormField
                      control={recoveryFormEmail.control}
                      name="recoveryEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registered Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="admin@rodela.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsRecoveryOpen(false)}>Cancel</Button>
                  <Button type="submit" form="recovery-email-form" disabled={sending}>
                    {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Reset Link'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

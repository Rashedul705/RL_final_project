
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
import { Bot } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const loginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  pin: z.string().regex(/^\d{4}$/, 'Security PIN must be 4 digits.'),
});

const recoveryEmailSchema = z.object({
  recoveryEmail: z.string().email('Please enter a valid email address.'),
});

const recoveryOtpSchema = z.object({
  otp: z.string().length(4, 'OTP must be 4 digits.'),
});

const recoveryNewCredsSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters.'),
  newPin: z.string().regex(/^\d{4}$/, 'Security PIN must be 4 digits.'),
});


export default function AdminLoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const [newPassword, setNewPassword] = useState('123456');
  const [newPin, setNewPin] = useState('9999');

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
  
  const recoveryFormOtp = useForm<z.infer<typeof recoveryOtpSchema>>({
    resolver: zodResolver(recoveryOtpSchema),
    defaultValues: { otp: '' },
  });

  const recoveryFormNewCreds = useForm<z.infer<typeof recoveryNewCredsSchema>>({
    resolver: zodResolver(recoveryNewCredsSchema),
    defaultValues: { newPassword: '', newPin: '' },
  });


  function onLoginSubmit(values: z.infer<typeof loginFormSchema>) {
    const { email, password, pin } = values;

    if (
      email === 'admin@rodela.com' &&
      password === newPassword &&
      pin === newPin
    ) {
      localStorage.setItem('isAuthenticated', 'true');
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      router.push('/admin');
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid credentials. Please check your email, password, and PIN.',
      });
    }
  }

  function onRecoveryEmailSubmit(values: z.infer<typeof recoveryEmailSchema>) {
    if (values.recoveryEmail.toLowerCase() === 'admin@rodela.com') {
      setRecoveryEmail(values.recoveryEmail);
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(otp);
      toast({
        title: 'Verification Code Sent',
        description: `Your verification code is: ${otp}`,
      });
      setRecoveryStep(2);
    } else {
      toast({
        variant: 'destructive',
        title: 'Unknown Email',
        description: 'This email is not registered.',
      });
    }
  }

  function onRecoveryOtpSubmit(values: z.infer<typeof recoveryOtpSchema>) {
    if (values.otp === generatedOtp) {
      setRecoveryStep(3);
    } else {
      recoveryFormOtp.setError('otp', {
        type: 'manual',
        message: 'Invalid OTP. Please try again.',
      });
    }
  }

  function onRecoveryNewCredsSubmit(values: z.infer<typeof recoveryNewCredsSchema>) {
    setNewPassword(values.newPassword);
    setNewPin(values.newPin);
    toast({
      title: 'Reset Successful!',
      description: 'Your credentials have been updated. Please login.',
    });
    resetRecoveryFlow();
  }
  
  const resetRecoveryFlow = () => {
    setIsRecoveryOpen(false);
    setTimeout(() => {
        setRecoveryStep(1);
        setRecoveryEmail('');
        setGeneratedOtp('');
        recoveryFormEmail.reset();
        recoveryFormOtp.reset();
        recoveryFormNewCreds.reset();
    }, 300); // delay to allow dialog to close smoothly
  };


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
                      <Input type="email" placeholder="admin@rodela.com" {...field} />
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
                      <Input type="password" placeholder="••••••••" {...field} />
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
                      <Input type="password" placeholder="••••" maxLength={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Login to Admin Dashboard
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            <Dialog open={isRecoveryOpen} onOpenChange={setIsRecoveryOpen}>
                <DialogTrigger asChild>
                    <Button variant="link" className="p-0 h-auto">Forgot Password?</Button>
                </DialogTrigger>
                <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                   <DialogHeader>
                        <DialogTitle>Password & PIN Recovery</DialogTitle>
                        <DialogDescription>
                            {recoveryStep === 1 && "Enter your email to receive a verification code."}
                            {recoveryStep === 2 && `We've sent a code to ${recoveryEmail}. Please enter it below.`}
                            {recoveryStep === 3 && "You can now reset your credentials."}
                        </DialogDescription>
                    </DialogHeader>

                    {recoveryStep === 1 && (
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
                    )}

                    {recoveryStep === 2 && (
                         <Form {...recoveryFormOtp}>
                            <form onSubmit={recoveryFormOtp.handleSubmit(onRecoveryOtpSubmit)} id="recovery-otp-form" className="space-y-4 pt-4">
                                <FormField
                                    control={recoveryFormOtp.control}
                                    name="otp"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>4-Digit Verification Code</FormLabel>
                                        <FormControl>
                                            <Input type="text" maxLength={4} placeholder="1234" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                    )}
                    
                    {recoveryStep === 3 && (
                         <Form {...recoveryFormNewCreds}>
                            <form onSubmit={recoveryFormNewCreds.handleSubmit(onRecoveryNewCredsSubmit)} id="recovery-new-creds-form" className="space-y-4 pt-4">
                                <FormField
                                    control={recoveryFormNewCreds.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={recoveryFormNewCreds.control}
                                    name="newPin"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New 4-Digit Security PIN</FormLabel>
                                        <FormControl>
                                            <Input type="password" maxLength={4} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                    )}


                    <DialogFooter>
                        <Button variant="outline" onClick={resetRecoveryFlow}>Cancel</Button>
                        {recoveryStep === 1 && <Button type="submit" form="recovery-email-form">Send Verification Code</Button>}
                        {recoveryStep === 2 && <Button type="submit" form="recovery-otp-form">Verify Code</Button>}
                        {recoveryStep === 3 && <Button type="submit" form="recovery-new-creds-form">Update Credentials</Button>}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    
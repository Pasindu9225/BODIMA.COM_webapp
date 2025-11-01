'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { BordimaLogo } from '@/components/bordima-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const { toast } = useToast();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        // The error 'CredentialsSignin' is a specific error code from Next-Auth.
        if (result.error === 'CredentialsSignin') {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'Invalid email or password. Please try again.',
            });
        } else {
             toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'An unexpected error occurred. Please try again.',
            });
        }
      } else if (result?.ok) {
        // Successful login, Next-Auth middleware will handle redirection.
        // We push to the callbackUrl and let the middleware sort out the user's role.
        router.push(callbackUrl);
        router.refresh(); // Force a refresh to ensure middleware runs and session is updated
      }
    } catch(error) {
        console.error("Login submission error", error);
        toast({
            variant: 'destructive',
            title: 'Uh oh!',
            description: 'Something went wrong during login.',
        });
    }
  };

  const loginArtImage = PlaceHolderImages.find((p) => p.id === 'login-art');

  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-8">
        <div className="mx-auto flex w-full max-w-sm flex-col items-start">
          <BordimaLogo />
          <h1 className="mt-6 font-headline text-3xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-muted-foreground">Log in to continue to Bordima.</p>
        </div>
        <Card className="mt-6 w-full max-w-sm border-none bg-transparent shadow-none">
          <CardContent className="p-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} />
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
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Logging in...' : 'Log In'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
      <div className="relative hidden flex-1 lg:block">
        {loginArtImage && (
          <Image
            src={loginArtImage.imageUrl}
            alt="Abstract art"
            fill
            className="object-cover"
            data-ai-hint={loginArtImage.imageHint}
          />
        )}
      </div>
    </div>
  );
}

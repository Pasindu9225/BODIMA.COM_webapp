'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BordimaLogo } from '@/components/bordima-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
  role: z.enum(['student', 'provider'], {
    required_error: 'You need to select an account type.',
  }),
});

export default function RegisterPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'student',
    },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    // Mock registration logic
    console.log(values);
    if (values.role === 'provider') {
      router.push('/provider/register');
    } else {
      router.push('/student/dashboard');
    }
  };

  const loginArtImage = PlaceHolderImages.find((p) => p.id === 'login-art');

  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-8">
        <div className="mx-auto flex w-full max-w-sm flex-col items-start">
          <BordimaLogo />
          <h1 className="mt-6 font-headline text-3xl font-bold">Create an Account</h1>
          <p className="mt-2 text-muted-foreground">Get started with Bordima today.</p>
        </div>
        <Card className="mt-6 w-full max-w-sm border-none bg-transparent shadow-none">
          <CardContent className="p-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>I am a...</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="student" />
                            </FormControl>
                            <FormLabel className="font-normal">Student</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="provider" />
                            </FormControl>
                            <FormLabel className="font-normal">Boarding Provider</FormLabel>
                          </FormItem>
                        </RadioGroup>
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
                <Button type="submit" className="w-full">
                  Create Account
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
            Log in
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

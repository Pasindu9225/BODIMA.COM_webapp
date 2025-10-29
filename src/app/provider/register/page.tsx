'use client';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BordimaLogo } from '@/components/bordima-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';

const providerRegisterSchema = z.object({
  providerName: z.string().min(1, 'Provider name is required.'),
  contactName: z.string().min(1, 'Contact person name is required.'),
  phone: z.string().min(10, 'A valid phone number is required.'),
  address: z.string().min(1, 'Address is required.'),
  nic: z.string().min(10, 'NIC number is required.'),
  propertyInfo: z.string().optional(),
  agreedToTerms: z.literal<boolean>(true, {
    errorMap: () => ({ message: 'You must agree to the terms and conditions' }),
  }),
});

export default function ProviderRegisterPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof providerRegisterSchema>>({
    resolver: zodResolver(providerRegisterSchema),
    defaultValues: {
      providerName: '',
      contactName: '',
      phone: '',
      address: '',
      nic: '',
      propertyInfo: '',
    },
  });

  const onSubmit = (values: z.infer<typeof providerRegisterSchema>) => {
    // Mock provider registration logic
    console.log(values);
    router.push('/provider/pending');
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
       <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-center">
            <BordimaLogo />
        </div>
        <Card>
            <CardHeader>
            <CardTitle className="font-headline text-2xl">Become a Boarding Provider</CardTitle>
            <CardDescription>
                Complete the form below to get started. Your submission will be reviewed by our team.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="providerName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Provider/Business Name</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Sunil Properties" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="contactName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact Person Name</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Sunil Perera" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                            <Input placeholder="077xxxxxxx" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="nic"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>National Identity Card (NIC)</FormLabel>
                            <FormControl>
                            <Input placeholder="Your NIC number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                   </div>
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Property Address</FormLabel>
                            <FormControl>
                            <Input placeholder="123, Galle Road, Colombo 03" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="propertyInfo"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>About Your Property (Optional)</FormLabel>
                            <FormControl>
                            <Textarea placeholder="Tell us a little about the rooms or facilities you offer." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                      control={form.control}
                      name="agreedToTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I agree to the <Link href="#" className="text-primary underline">terms and conditions</Link>.
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                <Button type="submit" className="w-full">
                    Submit for Approval
                </Button>
                </form>
            </Form>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

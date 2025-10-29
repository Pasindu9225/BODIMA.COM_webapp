import { BordimaLogo } from '@/components/bordima-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MailCheck } from 'lucide-react';
import Link from 'next/link';

export default function ProviderPendingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
            <BordimaLogo />
        </div>
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <MailCheck className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mt-4 font-headline text-2xl">Thank You for Registering!</CardTitle>
            <CardDescription>
              Your application has been submitted successfully. Our team will review your information and you will be notified via email once your account is approved. This usually takes 2-3 business days.
            </cardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
                <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

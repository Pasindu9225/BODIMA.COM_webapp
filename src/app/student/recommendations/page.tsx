'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { personalizedRecommendation, type PersonalizedRecommendationOutput } from '@/ai/flows/personalized-recommendation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';

const recommendationSchema = z.object({
  course: z.string().min(1, 'Course is required.'),
  budget: z.coerce.number().min(1, 'Budget is required.'),
  preferences: z.string().optional(),
});

export default function RecommendationsPage() {
  const [recommendation, setRecommendation] = useState<PersonalizedRecommendationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof recommendationSchema>>({
    resolver: zodResolver(recommendationSchema),
    defaultValues: {
      course: '',
      budget: 0,
      preferences: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof recommendationSchema>) => {
    setIsLoading(true);
    setError(null);
    setRecommendation(null);
    try {
      const result = await personalizedRecommendation(values);
      setRecommendation(result);
    } catch (e) {
      console.error(e);
      setError('Failed to get recommendation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">AI-Powered Recommendations</h1>
        <p className="text-muted-foreground">Let our AI assistant help you find the perfect boarding place.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Preferences</CardTitle>
          <CardDescription>Tell us what you're looking for, and we'll provide a personalized suggestion.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="course"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course of Study</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Medicine, Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Budget (LKR)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 20000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Preferences</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., quiet environment, close to a gym, attached bathroom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Recommendation
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      {error && <p className="text-destructive">{error}</p>}
      {recommendation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-accent" />
              Here's Our Suggestion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{recommendation.recommendation}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// src/ai/flows/personalized-recommendation.ts
'use server';
/**
 * @fileOverview Provides personalized boarding place recommendations based on student course and budget.
 *
 * - personalizedRecommendation - A function that generates personalized recommendations.
 * - PersonalizedRecommendationInput - The input type for the personalizedRecommendation function.
 * - PersonalizedRecommendationOutput - The return type for the personalizedRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRecommendationInputSchema = z.object({
  course: z.string().describe('The student\'s course of study.'),
  budget: z.number().describe('The student\'s budget for accommodation.'),
  preferences: z.string().optional().describe('Any specific preferences the student has for accommodation.'),
});
export type PersonalizedRecommendationInput = z.infer<typeof PersonalizedRecommendationInputSchema>;

const PersonalizedRecommendationOutputSchema = z.object({
  recommendation: z.string().describe('A personalized recommendation of suitable boarding places.'),
});
export type PersonalizedRecommendationOutput = z.infer<typeof PersonalizedRecommendationOutputSchema>;

export async function personalizedRecommendation(input: PersonalizedRecommendationInput): Promise<PersonalizedRecommendationOutput> {
  return personalizedRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedRecommendationPrompt',
  input: {schema: PersonalizedRecommendationInputSchema},
  output: {schema: PersonalizedRecommendationOutputSchema},
  prompt: `You are a helpful assistant that provides personalized boarding place recommendations to students.

  Consider the student's course of study, budget, and any specific preferences they may have.

  Course: {{{course}}}
  Budget: {{{budget}}}
  Preferences: {{{preferences}}}

  Provide a detailed recommendation that includes specific boarding place features and why they are suitable for the student.`, 
});

const personalizedRecommendationFlow = ai.defineFlow(
  {
    name: 'personalizedRecommendationFlow',
    inputSchema: PersonalizedRecommendationInputSchema,
    outputSchema: PersonalizedRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

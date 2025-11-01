'use server';

import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { Role, UserStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const SALT_ROUNDS = 10;

// Schema for student registration
const studentSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
});

// Schema for provider registration
const providerSchema = z.object({
  providerName: z.string().min(1, 'Provider name is required.'),
  contactName: z.string().min(1, 'Contact person name is required.'),
  email: z.string().email('A valid email address is required.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  phone: z.string().min(10, 'A valid phone number is required.'),
  address: z.string().min(1, 'Address is required.'),
  nic: z.string().min(10, 'NIC number is required.'),
  propertyInfo: z.string().optional(),
  agreedToTerms: z.literal<boolean>(true, {
    errorMap: () => ({ message: 'You must agree to the terms and conditions' }),
  }),
});

type FormState = {
  success: boolean;
  message: string;
};

/**
 * Registers a new student user.
 * @param values - The form values for student registration.
 * @returns A promise that resolves to the form state.
 */
export async function registerStudent(
  values: z.infer<typeof studentSchema>
): Promise<FormState> {
  const validatedFields = studentSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid form data.',
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.STUDENT,
        status: UserStatus.APPROVED, // Students are auto-approved
      },
    });

    return { success: true, message: 'Student registered successfully.' };
  } catch (error) {
    console.error('Student registration error:', error);
    return { success: false, message: 'Database error. Please try again.' };
  }
}

/**
 * Registers a new provider user and their profile.
 * @param values - The form values for provider registration.
 * @returns A promise that resolves to the form state.
 */
export async function registerProvider(
  values: z.infer<typeof providerSchema>
): Promise<FormState> {
  const validatedFields = providerSchema.safeParse(values);

  if (!validatedFields.success) {
    // Construct a more detailed error message from validation issues
    const errorMessages = validatedFields.error.errors.map(e => e.message).join(', ');
    return {
      success: false,
      message: `Invalid form data: ${errorMessages}`,
    };
  }

  const {
    providerName,
    contactName,
    email,
    password,
    phone,
    address,
    nic,
    propertyInfo,
  } = validatedFields.data;

  try {
    // Use a transaction to ensure both User and Provider are created or neither
    const result = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({ where: { email } });
      if (existingUser) {
        // This will cause the transaction to roll back
        throw new Error('An account with this email already exists.');
      }

      const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS);

      const newUser = await tx.user.create({
        data: {
          name: contactName, // Use contact name for the user's name
          email,
          password: hashedPassword,
          role: Role.PROVIDER,
          status: UserStatus.PENDING, // Providers must be approved by an admin
        },
      });

      await tx.providerProfile.create({
        data: {
          userId: newUser.id,
          name: providerName,
          phone,
          address,
          nic,
          propertyInfo: propertyInfo,
        },
      });

      return newUser;
    });

    return { success: true, message: 'Provider registration submitted for approval.' };
  } catch (error: any) {
    console.error('Provider registration error:', error);
    if (error.message.includes('already exists')) {
      return { success: false, message: error.message };
    }
    return { success: false, message: 'Database error. Please try again.' };
  }
}


/**
 * A dummy action for the initial registration form to redirect to the full provider form.
 * In a real app, you might pass state between these pages.
 */
export async function registerProviderRedirect() {
  // This function is mostly a placeholder for the form action.
  // The client-side router handles the redirect.
  return { success: true, message: 'Redirecting to provider details form.' };
}

/**
 * Approves a provider's registration.
 * @param userId - The ID of the user to approve.
 */
export async function approveProvider(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.APPROVED },
    });
    revalidatePath('/admin/dashboard'); // Refresh the data on the dashboard
    return { success: true, message: 'Provider approved.' };
  } catch (error) {
    console.error('Error approving provider:', error);
    return { success: false, message: 'Failed to approve provider.' };
  }
}

/**
 * Rejects a provider's registration, deleting the user and provider profile.
 * @param userId - The ID of the user to reject.
 */
export async function rejectProvider(userId: string) {
  try {
    // Use a transaction to ensure both are deleted
    await prisma.$transaction(async (tx) => {
      // The schema is set up with cascading deletes,
      // so deleting the user will also delete the provider profile.
      await tx.user.delete({ where: { id: userId } });
    });
    revalidatePath('/admin/dashboard'); // Refresh the data on the dashboard
    return { success: true, message: 'Provider rejected and deleted.' };
  } catch (error) {
    console.error('Error rejecting provider:', error);
    return { success: false, message: 'Failed to reject provider.' };
  }
}

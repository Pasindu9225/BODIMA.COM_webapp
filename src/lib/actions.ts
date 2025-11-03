"use server";

import { z } from "zod";
import * as bcryptjs from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role, UserStatus, ListingStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const SALT_ROUNDS = 10;

// Schema for student registration
const studentSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

// Schema for provider registration
const providerSchema = z.object({
  providerName: z.string().min(1, "Provider name is required."),
  contactName: z.string().min(1, "Contact person name is required."),
  email: z.string().email("A valid email address is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  phone: z.string().min(10, "A valid phone number is required."),
  address: z.string().min(1, "Address is required."),
  nic: z.string().min(10, "NIC number is required."),
  propertyInfo: z.string().optional(),
  agreedToTerms: z.literal<boolean>(true, {
    errorMap: () => ({ message: "You must agree to the terms and conditions" }),
  }),
});

type FormState = {
  success: boolean;
  message: string;
};

/**
 * Registers a new student user.
 */
export async function registerStudent(
  values: z.infer<typeof studentSchema>
): Promise<FormState> {
  const validatedFields = studentSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid form data.",
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return {
        success: false,
        message: "An account with this email already exists.",
      };
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

    return { success: true, message: "Student registered successfully." };
  } catch (error) {
    console.error("Student registration error:", error);
    return { success: false, message: "Database error. Please try again." };
  }
}

/**
 * Registers a new provider user and their profile.
 */
export async function registerProvider(
  values: z.infer<typeof providerSchema>
): Promise<FormState> {
  const validatedFields = providerSchema.safeParse(values);

  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.errors
      .map((e) => e.message)
      .join(", ");
    return {
      success: false,
      message: `Invalid form data: ${errorMessages}`,
    };
  }

  const { providerName, contactName, email, password, phone, address, nic } =
    validatedFields.data;

  try {
    await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new Error("An account with this email already exists.");
      }

      const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS);

      const newUser = await tx.user.create({
        data: {
          name: contactName,
          email,
          password: hashedPassword,
          role: Role.PROVIDER,
          status: UserStatus.PENDING,
        },
      });

      await tx.provider.create({
        data: {
          userId: newUser.id,
          name: providerName,
          phone,
          address,
          nic,
        },
      });
    });
  } catch (error: any) {
    console.error("Provider registration error:", error);
    if (error.code === "P2002" && error.meta?.target?.includes("nic")) {
      return {
        success: false,
        message: "This NIC number is already registered.",
      };
    }
    if (error.message.includes("already exists")) {
      return {
        success: false,
        message: "An account with this email already exists.",
      };
    }
    return { success: false, message: "Database error. Please try again." };
  }

  // If successful, redirect to the pending page
  redirect("/provider/pending");
}

/**
 * A dummy action for the initial registration form.
 */
export async function registerProviderRedirect() {
  return { success: true, message: "Redirecting to provider details form." };
}

/**
 * Approves a provider's registration.
 */
export async function approveProvider(userId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { status: UserStatus.APPROVED },
      });
      await tx.provider.update({
        where: { userId: userId },
        data: { isVerified: true },
      });
    });

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/users");
    return { success: true, message: "Provider approved." };
  } catch (error) {
    console.error("Error approving provider:", error);
    return { success: false, message: "Failed to approve provider." };
  }
}

/**
 * Rejects a provider's registration.
 */
export async function rejectProvider(userId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.delete({ where: { id: userId } });
    });
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/users");
    return { success: true, message: "Provider rejected and deleted." };
  } catch (error) {
    console.error("Error rejecting provider:", error);
    return { success: false, message: "Failed to reject provider." };
  }
}

/**
 * Approves a property listing.
 */
export async function approveListing(listingId: string, formData: FormData) {
  try {
    await prisma.listing.update({
      where: { id: listingId },
      data: { status: ListingStatus.APPROVED },
    });
    revalidatePath("/admin/listings");
  } catch (error) {
    console.error("Error approving listing:", error);
  }
}

/**
 * Rejects a property listing.
 */
export async function rejectListing(listingId: string, formData: FormData) {
  try {
    await prisma.listing.update({
      where: { id: listingId },
      data: { status: ListingStatus.REJECTED },
    });
    revalidatePath("/admin/listings");
  } catch (error) {
    console.error("Error rejecting listing:", error);
  }
}

/**
 * Creates a new amenity.
 */
// --- FIX 1: Removed the return values ---
export async function createAmenity(formData: FormData) {
  const name = formData.get("name") as string;
  const icon = formData.get("icon") as string;

  if (!name || !icon) {
    // You can still handle simple errors, but don't return
    console.error("Name and Icon are required.");
    return;
  }

  try {
    await prisma.amenity.create({
      data: {
        name: name,
        icon: icon,
      },
    });
    revalidatePath("/admin/settings");
  } catch (error: any) {
    if (error.code === "P2002") {
      console.error("An amenity with this name already exists.");
    } else {
      console.error("Error creating amenity:", error);
    }
  }
}

/**
 * Deletes an amenity.
 */
// --- FIX 2: Added formData and removed return values ---
export async function deleteAmenity(amenityId: string, formData: FormData) {
  try {
    await prisma.amenity.delete({
      where: { id: amenityId },
    });
    revalidatePath("/admin/settings");
  } catch (error) {
    console.error("Error deleting amenity:", error);
  }
}

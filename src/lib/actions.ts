"use server";

import { z } from "zod";
import * as bcryptjs from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role, UserStatus, ListingStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth.config";
import type { Prisma } from "@prisma/client";
import auth from "@/auth";

const SALT_ROUNDS = 10;

const studentSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

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

// --- Schema for the Listing Form ---
const listingFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  roomType: z.string().min(1, "Room type is required"),
  amenities: z.array(z.string()).optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  photos: z
    .array(
      z
        .string()
        .url({ message: "Invalid URL" })
        .min(1, { message: "URL can't be empty" })
    )
    .min(1, "At least one photo URL is required"),
});

type FormState = {
  success: boolean;
  message: string;
};

export async function registerStudent(
  values: z.infer<typeof studentSchema>
): Promise<FormState> {
  const validatedFields = studentSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, message: "Invalid form data." };
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
        status: UserStatus.APPROVED,
      },
    });
    return { success: true, message: "Student registered successfully." };
  } catch (error) {
    console.error("Student registration error:", error);
    return { success: false, message: "Database error. Please try again." };
  }
}

export async function registerProvider(
  values: z.infer<typeof providerSchema>
): Promise<FormState> {
  const validatedFields = providerSchema.safeParse(values);
  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.errors
      .map((e) => e.message)
      .join(", ");
    return { success: false, message: `Invalid form data: ${errorMessages}` };
  }
  const { providerName, contactName, email, password, phone, address, nic } =
    validatedFields.data;
  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existingUser = await tx.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new Error("An account with this email already exists.");
      }
      const existingProvider = await tx.provider.findUnique({ where: { nic } });
      if (existingProvider) {
        throw new Error("This NIC number is already registered.");
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
  redirect("/provider/pending");
}

export async function registerProviderRedirect() {
  return { success: true, message: "Redirecting to provider details form." };
}

export async function approveProvider(userId: string) {
  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

export async function rejectProvider(userId: string) {
  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

export async function createAmenity(formData: FormData) {
  const name = formData.get("name") as string;
  const icon = formData.get("icon") as string;
  if (!name || !icon) {
    console.error("Name and Icon are required.");
    return;
  }
  try {
    await prisma.amenity.create({
      data: { name, icon },
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

export async function createListing(
  values: z.infer<typeof listingFormSchema>
): Promise<FormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "PROVIDER") {
    return { success: false, message: "Error: Not authorized." };
  }

  const providerId = session.user.id;
  const validatedFields = listingFormSchema.safeParse(values);
  if (!validatedFields.success) {
    console.error("Validation failed:", validatedFields.error.errors);
    return {
      success: false,
      message:
        "Error: Invalid data. " +
        validatedFields.error.errors.map((e) => e.message).join(", "),
    };
  }

  const {
    title,
    description,
    address,
    city,
    price,
    roomType,
    amenities = [],
    lat,
    lng,
    photos,
  } = validatedFields.data;

  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newListing = await tx.listing.create({
        data: {
          title,
          description,
          address,
          city,
          price,
          roomType,
          status: ListingStatus.PENDING,
          providerId,
          lat,
          lng,
        },
      });

      if (amenities.length > 0) {
        await tx.listingAmenity.createMany({
          data: amenities.map((amenityId) => ({
            listingId: newListing.id,
            amenityId,
          })),
        });
      }

      await tx.photo.createMany({
        data: photos.map((url, index) => ({
          listingId: newListing.id,
          url,
          isCover: index === 0,
        })),
      });
    });
  } catch (error) {
    console.error("Error creating listing:", error);
    return { success: false, message: "Error: Failed to create listing." };
  }

  revalidatePath("/provider/dashboard");
  return { success: true, message: "Listing created successfully!" };
}

export async function updateListing(listingId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "PROVIDER") {
    throw new Error("Unauthorized");
  }

  const providerId = session.user.id;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const price = parseFloat(formData.get("price") as string);
  const roomType = formData.get("roomType") as string;
  const amenityIds = formData.getAll("amenities") as string[];
  const photoUrls = formData.getAll("photos") as string[];

  if (!title || !address || !city || !price || !roomType) {
    throw new Error("Missing required fields");
  }

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { providerId: true },
    });

    if (!listing || listing.providerId !== providerId) {
      throw new Error("Forbidden: You do not own this listing.");
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.listing.update({
        where: { id: listingId },
        data: {
          title,
          description,
          address,
          city,
          price,
          roomType,
          status: ListingStatus.PENDING,
        },
      });

      await tx.listingAmenity.deleteMany({ where: { listingId } });
      if (amenityIds.length > 0) {
        await tx.listingAmenity.createMany({
          data: amenityIds.map((amenityId) => ({
            listingId,
            amenityId,
          })),
        });
      }

      await tx.photo.deleteMany({ where: { listingId } });
      if (photoUrls.length > 0) {
        await tx.photo.createMany({
          data: photoUrls
            .filter((url) => url.trim() !== "")
            .map((url, index) => ({
              listingId,
              url,
              isCover: index === 0,
            })),
        });
      }
    });
  } catch (error) {
    console.error("Error updating listing:", error);
    throw new Error("Failed to update listing.");
  }

  revalidatePath("/provider/dashboard");
  redirect("/provider/dashboard");
}

export async function deleteListing(listingId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  const providerId = session?.user?.id;
  if (!providerId || session.user.role !== "PROVIDER") {
    throw new Error("Not authorized");
  }

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { providerId: true },
    });

    if (!listing || listing.providerId !== providerId) {
      throw new Error("Forbidden: You do not own this listing.");
    }

    await prisma.listing.delete({ where: { id: listingId } });
    revalidatePath("/provider/dashboard");
  } catch (error) {
    console.error("Error deleting listing:", error);
  }
}

export async function updateProviderProfile(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;

  if (!name || !phone || !address) throw new Error("Missing required fields");

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      providerProfile: {
        update: {
          phone,
          address,
        },
      },
    },
  });

  revalidatePath("/provider/profile");
}

export async function updateProviderPassword(
  formData: FormData
): Promise<FormState> {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "PROVIDER") {
      return { success: false, message: "Error: Not authorized." };
    }

    const userId = session.user.id;
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!currentPassword || !newPassword) {
      return { success: false, message: "Error: All fields are required." };
    }

    if (newPassword.length < 8) {
      return {
        success: false,
        message: "Error: New password must be at least 8 characters long.",
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user || !user.password) {
      return { success: false, message: "Error: User not found." };
    }

    const isPasswordCorrect = await bcryptjs.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      return { success: false, message: "Error: Incorrect current password." };
    }

    const hashedNewPassword = await bcryptjs.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    revalidatePath("/provider/settings");
    return { success: true, message: "Password updated successfully!" };
  } catch (error) {
    console.error("Error updating password:", error);
    return { success: false, message: "Error: Failed to update password." };
  }
}

export async function getUniversities() {
  try {
    const universities = await prisma.university.findMany({
      orderBy: { name: "asc" },
    });
    return universities;
  } catch (error) {
    console.error("Error fetching universities:", error);
    return [];
  }
}

export async function addUniversity(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, message: "Unauthorized access." };
    }

    const name = formData.get("name") as string;
    const city = formData.get("city") as string;
    const address = formData.get("address") as string;
    const lat = parseFloat(formData.get("lat") as string);
    const lng = parseFloat(formData.get("lng") as string);

    if (!name || !city || !address || isNaN(lat) || isNaN(lng)) {
      return {
        success: false,
        message: "Please fill in all fields correctly.",
      };
    }

    await prisma.university.create({
      data: {
        name,
        city,
        address,
        lat,
        lng,
      },
    });

    revalidatePath("/admin/university");

    return { success: true, message: "University added successfully!" };
  } catch (error) {
    console.error("Error adding university:", error);
    return {
      success: false,
      message: "An error occurred while adding the university.",
    };
  }
}

export async function deleteUniversity(formData: FormData) {
  try {
    const id = formData.get("id") as string;

    if (!id) throw new Error("University ID not provided.");

    await prisma.university.delete({ where: { id } });

    revalidatePath("/admin/university");
    return { success: true, message: "University deleted successfully." };
  } catch (error) {
    console.error("Error deleting university:", error);
    return { success: false, message: "Failed to delete university." };
  }
}

export async function searchUniversities(query?: string) {
  try {
    if (!query || query.trim() === "") {
      return await prisma.university.findMany({
        orderBy: { name: "asc" },
        take: 10,
      });
    }

    return await prisma.university.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      orderBy: { name: "asc" },
      take: 10,
    });
  } catch (error) {
    console.error("Error fetching universities:", error);
    return [];
  }
}

export async function getRandomListings(limit = 10) {
  try {
    const listings = await prisma.listing.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Shuffle randomly
    return listings.sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error("Error fetching listings:", error);
    return [];
  }
}

export async function searchListings(query: string) {
  try {
    if (!query || query.trim() === "") return [];

    return await prisma.listing.findMany({
      where: {
        OR: [
          {
            city: { contains: query, mode: "insensitive" },
          },
          {
            title: { contains: query, mode: "insensitive" },
          },
          {
            address: { contains: query, mode: "insensitive" },
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  } catch (error) {
    console.error("Error searching listings:", error);
    return [];
  }
}
export async function getListingsNearUniversity(universityName: string, radiusKm = 5) {
  try {
    const university = await prisma.university.findFirst({
      where: {
        name: { contains: universityName, mode: "insensitive" },
      },
    });

    if (!university) {
      console.warn("University not found for:", universityName);
      return { university: null, listings: [] };
    }

    const listings = await prisma.listing.findMany({
      where: { status: ListingStatus.APPROVED },
    });

    const R = 6371;
    const nearby = listings.filter((listing) => {
      const dLat = (listing.lat - university.lat) * (Math.PI / 180);
      const dLng = (listing.lng - university.lng) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(university.lat * (Math.PI / 180)) *
          Math.cos(listing.lat * (Math.PI / 180)) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // in km
      return distance <= radiusKm;
    });

    return { university, listings: nearby };
  } catch (error) {
    console.error("Error finding listings near university:", error);
    return { university: null, listings: [] };
  }
}

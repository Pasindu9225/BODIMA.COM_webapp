import type { User, Provider as ProviderModel } from '@prisma/client';

export type Listing = {
  id: string;
  title: string;
  description?: string;
  location: string;
  price: number;
  roomType?: 'single' | 'shared';
  amenities?: string[];
  status?: 'pending' | 'approved' | 'rejected';
  providerId?: string;
  imageUrl?: string;
  imageHint?: string;
  lat: number;
  lng: number;
};

export type Provider = {
  id: string;
  providerName: string;
  contactName: string;
  phone: string;
  address: string;
  nic: string;
  status: 'pending' | 'approved' | 'rejected';
};

// These types should already be here
export type University = {
  name: string;
  lat: number;
  lng: number;
};

export type MarkerData = {
  position: [number, number];
  popupContent: React.ReactNode;
  item: Listing | University;
  type: 'university' | 'listing';
};

export type ProviderWithProfile = User & {
  provider: ProviderModel | null;
};

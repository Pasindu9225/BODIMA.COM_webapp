export type Listing = {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  roomType: 'single' | 'shared';
  amenities: string[];
  status: 'pending' | 'approved' | 'rejected';
  providerId: string;
  imageUrl?: string;
  imageHint?: string;
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

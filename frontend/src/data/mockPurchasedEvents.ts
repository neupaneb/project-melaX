import { Event } from './mockEvents';

export interface PurchasedEvent {
  id: string;
  eventId: string;
  event: Event;
  purchaseDate: string;
  quantity: number;
  totalPrice: number;
  originalAmount?: number;
  discountAmount?: number;
  appliedVouchers?: Array<{
    code: string;
    discountPercentage: number;
    discountAmount: number;
  }>;
  status: 'confirmed' | 'cancelled' | 'refunded' | 'pending';
  ticketNumber?: string;
  transactionId?: string;
  paymentMethod?: string;
  receiptId?: string;
  currency?: string;
}

export interface UserPurchasedEvents {
  userId: string;
  events: PurchasedEvent[];
}

// Mock purchased events data
export const mockPurchasedEvents: PurchasedEvent[] = [
  {
    id: 'purchase-1',
    eventId: '1',
    event: {
      id: "1",
      title: "Nepal Music Festival 2025",
      description: "Join us for the biggest music festival in Nepal featuring local and international artists. Experience the vibrant culture and music of Nepal in one spectacular event.",
      date: "2025-03-15",
      time: "18:00",
      location: "Tundikhel Ground",
      city: "Kathmandu",
      price: { min: 500, max: 2000, currency: "NPR" },
      category: "Concerts",
      imageUrl: "https://images.unsplash.com/photo-1639198623728-ac1fa5b275dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXBhbCUyMGZlc3RpdmFsJTIwY29uY2VydHxlbnwxfHx8fDE3NTgxMDgwODZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      organizer: "Nepal Music Society",
      ticketUrl: "https://example.com/tickets/1",
      featured: true,
      coordinates: { lat: 27.7031, lng: 85.3083 }
    },
    purchaseDate: "2025-01-15",
    quantity: 2,
    totalPrice: 3000,
    status: 'confirmed',
    ticketNumber: 'NM2025-001',
    transactionId: 'TXN-1758412345678',
    paymentMethod: 'card',
    receiptId: 'RCP-1758412345678'
  },
  {
    id: 'purchase-2',
    eventId: '2',
    event: {
      id: "2",
      title: "Tech Summit Kathmandu",
      description: "Annual technology summit bringing together innovators, entrepreneurs, and tech enthusiasts from across Nepal and South Asia.",
      date: "2025-02-28",
      time: "09:00",
      location: "Hotel Soaltee Crown Plaza",
      city: "Kathmandu",
      price: { min: 1500, max: 3500, currency: "NPR" },
      category: "Tech",
      imageUrl: "https://images.unsplash.com/photo-1646579886135-068c73800308?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwd29ya3Nob3AlMjBzZW1pbmFyfGVufDF8fHx8MTc1ODAxMjQ0NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      organizer: "Nepal Tech Hub",
      ticketUrl: "https://example.com/tickets/2",
      featured: true,
      coordinates: { lat: 27.6915, lng: 85.3459 }
    },
    purchaseDate: "2025-01-10",
    quantity: 1,
    totalPrice: 2500,
    status: 'confirmed',
    ticketNumber: 'TS2025-002',
    transactionId: 'TXN-1758412345679',
    paymentMethod: 'khalti',
    receiptId: 'RCP-1758412345679'
  },
  {
    id: 'purchase-3',
    eventId: '5',
    event: {
      id: "5",
      title: "Holi Celebration Concert",
      description: "Celebrate the festival of colors with live music, traditional dance, and cultural performances.",
      date: "2025-03-13",
      time: "16:00",
      location: "Basantapur Durbar Square",
      city: "Kathmandu",
      price: { min: 300, max: 800, currency: "NPR" },
      category: "Festivals",
      imageUrl: "https://images.unsplash.com/photo-1738667181188-a63ec751a646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBzdGFnZXxlbnwxfHx8fDE3NTgwMjA2NTB8MA&ixlib=rb-4.1.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      organizer: "Cultural Heritage Nepal",
      ticketUrl: "https://example.com/tickets/5",
      featured: true,
      coordinates: { lat: 27.7047, lng: 85.3075 }
    },
    purchaseDate: "2025-01-20",
    quantity: 3,
    totalPrice: 1500,
    status: 'confirmed',
    ticketNumber: 'HC2025-003',
    transactionId: 'TXN-1758412345680',
    paymentMethod: 'esewa',
    receiptId: 'RCP-1758412345680'
  }
];

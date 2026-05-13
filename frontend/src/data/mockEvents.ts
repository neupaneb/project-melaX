export interface TicketCategory {
  name: string;
  price: number;
  currency: string;
  description?: string;
  available: number;
}

export interface Voucher {
  id: string;
  code: string;
  eventId: string;
  discountPercentage: number;
  description?: string;
  maxUses: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  maxUsesPerUser: number;
  userUsageCount?: number;
  remainingUses: number;
  isExpired: boolean;
  isFullyUsed: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  city: string;
  country: string;
  ticketCategories: TicketCategory[];
  category: string;
  imageUrl: string;
  organizer: string;
  featured: boolean;
  vouchers?: Voucher[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Nepal Music Festival 2025",
    description: "Join us for the biggest music festival in Nepal featuring local and international artists. Experience the vibrant culture and music of Nepal in one spectacular event.",
    date: "2025-03-15",
    time: "18:00",
    location: "Tundikhel Ground",
    city: "Kathmandu",
    country: "Nepal",
    ticketCategories: [
      { name: "General Admission", price: 500, currency: "NPR", description: "Standard entry ticket", available: 1000 },
      { name: "VIP", price: 1500, currency: "NPR", description: "VIP access with premium seating", available: 200 },
      { name: "Premium", price: 2000, currency: "NPR", description: "Premium package with backstage access", available: 50 }
    ],
    category: "Concerts",
    imageUrl: "https://images.unsplash.com/photo-1639198623728-ac1fa5b275dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXBhbCUyMGZlc3RpdmFsJTIwY29uY2VydHxlbnwxfHx8fDE3NTgxMDgwODZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    organizer: "Nepal Music Society",
    featured: true,
    coordinates: { lat: 27.7031, lng: 85.3083 }
  },
  {
    id: "2",
    title: "Tech Summit Kathmandu",
    description: "Annual technology summit bringing together innovators, entrepreneurs, and tech enthusiasts from across Nepal and South Asia.",
    date: "2025-02-28",
    time: "09:00",
    location: "Hotel Soaltee Crown Plaza",
    city: "Kathmandu",
    country: "Nepal",
    ticketCategories: [
      { name: "Student", price: 1500, currency: "NPR", description: "Student discount ticket", available: 300 },
      { name: "Professional", price: 2500, currency: "NPR", description: "Standard professional ticket", available: 500 },
      { name: "Premium", price: 3500, currency: "NPR", description: "Premium access with networking dinner", available: 100 }
    ],
    category: "Tech",
    imageUrl: "https://images.unsplash.com/photo-1646579886135-068c73800308?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwd29ya3Nob3AlMjBzZW1pbmFyfGVufDF8fHx8MTc1ODAxMjQ0NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    organizer: "Nepal Tech Hub",
    featured: true,
    coordinates: { lat: 27.6915, lng: 85.3459 }
  },
  {
    id: "3",
    title: "Football Championship Final",
    description: "The ultimate showdown in Nepal's premier football league. Watch the top teams battle for the championship title.",
    date: "2025-03-01",
    time: "15:00",
    location: "Dasharath Stadium",
    city: "Kathmandu",
    country: "Nepal",
    ticketCategories: [
      { name: "General", price: 200, currency: "NPR", description: "General seating", available: 2000 },
      { name: "Premium", price: 500, currency: "NPR", description: "Premium seating", available: 500 },
      { name: "VIP", price: 1000, currency: "NPR", description: "VIP box access", available: 100 }
    ],
    category: "Sports",
    imageUrl: "https://images.unsplash.com/photo-1686947079063-f1e7a7dfc6a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBzdGFkaXVtJTIwZXZlbnR8ZW58MXx8fHwxNzU4MTA4MDk3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    organizer: "Nepal Football Association",
    featured: false,
    coordinates: { lat: 27.7000, lng: 85.3333 }
  },
  {
    id: "4",
    title: "Digital Marketing Workshop",
    description: "Learn the latest digital marketing strategies and tools. Perfect for businesses and professionals looking to enhance their online presence.",
    date: "2025-02-25",
    time: "10:00",
    location: "Everest Hotel",
    city: "Kathmandu",
    country: "Nepal",
    ticketCategories: [
      { name: "Standard", price: 800, currency: "NPR", description: "Workshop access with materials", available: 50 }
    ],
    category: "Workshops",
    imageUrl: "https://images.unsplash.com/photo-1646579886135-068c73800308?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwd29ya3Nob3AlMjBzZW1pbmFyfGVufDF8fHx8MTc1ODAxMjQ0NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    organizer: "Digital Nepal",
    featured: false,
    coordinates: { lat: 27.7089, lng: 85.3203 }
  },
  {
    id: "5",
    title: "Holi Celebration Concert",
    description: "Celebrate the festival of colors with live music, traditional dance, and cultural performances.",
    date: "2025-03-13",
    time: "16:00",
    location: "Basantapur Durbar Square",
    city: "Kathmandu",
    country: "Nepal",
    ticketCategories: [
      { name: "General", price: 300, currency: "NPR", description: "General admission", available: 1000 },
      { name: "VIP", price: 800, currency: "NPR", description: "VIP area with refreshments", available: 200 }
    ],
    category: "Festivals",
    imageUrl: "https://images.unsplash.com/photo-1738667181188-a63ec751a646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBzdGFnZXxlbnwxfHx8fDE3NTgwMjA2NTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    organizer: "Cultural Heritage Nepal",
    featured: true,
    coordinates: { lat: 27.7047, lng: 85.3075 }
  },
  {
    id: "6",
    title: "Startup Pitch Competition",
    description: "Watch innovative startups pitch their ideas to investors and win funding for their ventures.",
    date: "2025-03-05",
    time: "14:00",
    location: "Durbarmarg Business Center",
    city: "Kathmandu",
    country: "Nepal",
    ticketCategories: [
      { name: "Free Admission", price: 0, currency: "NPR", description: "Free entry for all attendees", available: 300 }
    ],
    category: "Tech",
    imageUrl: "https://images.unsplash.com/photo-1646579886135-068c73800308?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwd29ya3Nob3AlMjBzZW1pbmFyfGVufDF8fHx8MTc1ODAxMjQ0NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    organizer: "Startup Nepal",
    featured: false,
    coordinates: { lat: 27.7069, lng: 85.3206 }
  }
];

export const categories = ["All", "Concerts", "Sports", "Workshops", "Tech", "Festivals"];
export const cities = ["All Cities", "Kathmandu", "Pokhara", "Chitwan", "Lalitpur"];
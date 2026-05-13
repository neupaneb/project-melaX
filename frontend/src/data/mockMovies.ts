export interface Showtime {
  time: string;
  theater: string;
  ticketUrl: string;
  price: number;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string[];
  duration: number; // in minutes
  rating: string; // U, PG, PG-13, R, etc.
  releaseDate: string;
  director: string;
  cast: string[];
  imageUrl: string;
  trailerUrl: string;
  status: 'now-showing' | 'coming-soon';
  featured: boolean;
  showtimes: {
    [city: string]: {
      [date: string]: Showtime[];
    };
  };
}

export const mockMovies: Movie[] = [
  {
    id: "1",
    title: "The Mountain King",
    description: "An epic adventure story set in the majestic Himalayas of Nepal, following a young climber's journey to save his village from an ancient curse.",
    genre: ["Adventure", "Drama"],
    duration: 142,
    rating: "PG-13",
    releaseDate: "2025-02-20",
    director: "Rajesh Hamal",
    cast: ["Anmol KC", "Samragyee RL Shah", "Dayahang Rai"],
    imageUrl: "https://images.unsplash.com/photo-1755076347925-fe1e04401c90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY3Rpb24lMjBtb3ZpZSUyMHNjZW5lfGVufDF8fHx8MTc1ODA0NzU5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    trailerUrl: "https://example.com/trailer/1",
    status: "now-showing",
    featured: true,
    showtimes: {
      "Kathmandu": {
        "2025-02-20": [
          { time: "10:30", theater: "QFX Cinemas Aman Mall", ticketUrl: "https://example.com/book/1", price: 250 },
          { time: "13:45", theater: "QFX Cinemas Aman Mall", ticketUrl: "https://example.com/book/1", price: 300 },
          { time: "17:00", theater: "Big Movies Bhaktapur", ticketUrl: "https://example.com/book/1", price: 200 },
          { time: "20:15", theater: "QFX Cinemas Civil Mall", ticketUrl: "https://example.com/book/1", price: 350 }
        ],
        "2025-02-21": [
          { time: "11:00", theater: "QFX Cinemas Aman Mall", ticketUrl: "https://example.com/book/1", price: 250 },
          { time: "14:30", theater: "Big Movies Bhaktapur", ticketUrl: "https://example.com/book/1", price: 200 },
          { time: "18:00", theater: "QFX Cinemas Civil Mall", ticketUrl: "https://example.com/book/1", price: 300 }
        ]
      },
      "Pokhara": {
        "2025-02-20": [
          { time: "12:00", theater: "QFX Pokhara", ticketUrl: "https://example.com/book/1", price: 220 },
          { time: "19:30", theater: "QFX Pokhara", ticketUrl: "https://example.com/book/1", price: 280 }
        ]
      }
    }
  },
  {
    id: "2",
    title: "Love in Lalitpur",
    description: "A heartwarming romantic comedy about two young professionals who meet during the vibrant festival season in the historic city of Lalitpur.",
    genre: ["Romance", "Comedy"],
    duration: 118,
    rating: "PG",
    releaseDate: "2025-02-14",
    director: "Nischal Basnet",
    cast: ["Pradeep Khadka", "Jassita Gurung", "Puskar Gurung"],
    imageUrl: "https://images.unsplash.com/photo-1647962982511-f120db3d63c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmFtYSUyMG1vdmllJTIwdGhlYXRlcnxlbnwxfHx8fDE3NTgwNzgyNTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    trailerUrl: "https://example.com/trailer/2",
    status: "now-showing",
    featured: true,
    showtimes: {
      "Kathmandu": {
        "2025-02-20": [
          { time: "11:15", theater: "QFX Cinemas Civil Mall", ticketUrl: "https://example.com/book/2", price: 280 },
          { time: "15:30", theater: "Big Movies Bhaktapur", ticketUrl: "https://example.com/book/2", price: 220 },
          { time: "19:45", theater: "QFX Cinemas Aman Mall", ticketUrl: "https://example.com/book/2", price: 320 }
        ]
      },
      "Lalitpur": {
        "2025-02-20": [
          { time: "13:00", theater: "Kumari Cinema", ticketUrl: "https://example.com/book/2", price: 180 },
          { time: "16:45", theater: "Kumari Cinema", ticketUrl: "https://example.com/book/2", price: 200 }
        ]
      }
    }
  },
  {
    id: "3",
    title: "Everest Dreams",
    description: "The incredible true story of Nepali mountaineers who achieved the impossible, breaking barriers and inspiring a nation.",
    genre: ["Biography", "Adventure"],
    duration: 156,
    rating: "PG-13",
    releaseDate: "2025-03-15",
    director: "Min Bahadur Bham",
    cast: ["Bipin Karki", "Barsha Raut", "Rabindra Singh Baniya"],
    imageUrl: "https://images.unsplash.com/photo-1620153850780-0883dd907257?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHBvc3RlciUyMGZpbG18ZW58MXx8fHwxNzU4MDIwNjQ5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    trailerUrl: "https://example.com/trailer/3",
    status: "coming-soon",
    featured: true,
    showtimes: {}
  },
  {
    id: "4",
    title: "Digital Nepal",
    description: "A tech thriller exploring the dark side of social media and digital surveillance in modern Nepal.",
    genre: ["Thriller", "Drama"],
    duration: 124,
    rating: "R",
    releaseDate: "2025-02-25",
    director: "Deepak Rauniyar",
    cast: ["Saugat Malla", "Namrata Shrestha", "Aryan Sigdel"],
    imageUrl: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpZSUyMHRoZWF0ZXIlMjBjaW5lbWF8ZW58MXx8fHwxNzU4MDIzMTI3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    trailerUrl: "https://example.com/trailer/4",
    status: "now-showing",
    featured: false,
    showtimes: {
      "Kathmandu": {
        "2025-02-20": [
          { time: "14:00", theater: "QFX Cinemas Aman Mall", ticketUrl: "https://example.com/book/4", price: 300 },
          { time: "21:30", theater: "QFX Cinemas Civil Mall", ticketUrl: "https://example.com/book/4", price: 350 }
        ]
      }
    }
  },
  {
    id: "5",
    title: "Festival of Colors",
    description: "A beautiful family drama celebrating Nepalese traditions and the bonds that keep families together across generations.",
    genre: ["Family", "Drama"],
    duration: 135,
    rating: "U",
    releaseDate: "2025-03-01",
    director: "Tulsi Ghimire",
    cast: ["Rajesh Hamal", "Karishma Manandhar", "Bhuwan KC"],
    imageUrl: "https://images.unsplash.com/photo-1647962982511-f120db3d63c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmFtYSUyMG1vdmllJTIwdGhlYXRlcnxlbnwxfHx8fDE3NTgwNzgyNTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    trailerUrl: "https://example.com/trailer/5",
    status: "coming-soon",
    featured: false,
    showtimes: {}
  }
];

export const movieGenres = ["All", "Action", "Adventure", "Biography", "Comedy", "Drama", "Family", "Romance", "Thriller"];
export const movieCities = ["All Cities", "Kathmandu", "Pokhara", "Lalitpur", "Chitwan"];
export const theaters = [
  "QFX Cinemas Aman Mall",
  "QFX Cinemas Civil Mall", 
  "Big Movies Bhaktapur",
  "QFX Pokhara",
  "Kumari Cinema"
];
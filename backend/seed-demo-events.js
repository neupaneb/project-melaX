require('dotenv').config({ path: './backend/config.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const demoEvents = [
  {
    title: 'Kathmandu Night Music Fest',
    description: 'A high-energy live concert night featuring Nepali indie bands, food stalls, immersive lights, and a packed crowd in the heart of Kathmandu.',
    date: '2026-06-21',
    time: '18:30',
    location: 'Tundikhel Ground',
    city: 'Kathmandu',
    country: 'Nepal',
    ticketCategories: [
      { name: 'General Admission', price: 800, currency: 'NPR', description: 'Standard festival entry', available: 1200 },
      { name: 'VIP Pass', price: 2200, currency: 'NPR', description: 'Closer stage zone with priority access', available: 180 },
    ],
    category: 'Concerts',
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    organizer: 'melaX Live',
    featured: true,
    coordinates: { lat: 27.7008, lng: 85.3151 },
  },
  {
    title: 'Pokhara Lakeside Food Carnival',
    description: 'Street food, local coffee, acoustic performances, and sunset views by the lake. A perfect demo event for families, couples, and tourists.',
    date: '2026-06-28',
    time: '15:00',
    location: 'Lakeside Promenade',
    city: 'Pokhara',
    country: 'Nepal',
    ticketCategories: [
      { name: 'Entry Pass', price: 350, currency: 'NPR', description: 'General carnival access', available: 1500 },
      { name: 'Foodie Pass', price: 999, currency: 'NPR', description: 'Includes tasting coupons', available: 300 },
    ],
    category: 'Festivals',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
    organizer: 'Pokhara Events Collective',
    featured: true,
    coordinates: { lat: 28.2096, lng: 83.9596 },
  },
  {
    title: 'Startup Nepal Demo Day',
    description: 'Founders pitch bold ideas, investors network, and students discover the startup scene through panels and product showcases.',
    date: '2026-07-05',
    time: '11:00',
    location: 'The Plaza, Pulchowk',
    city: 'Lalitpur',
    country: 'Nepal',
    ticketCategories: [
      { name: 'Student', price: 500, currency: 'NPR', description: 'Discounted student entry', available: 250 },
      { name: 'Professional', price: 1800, currency: 'NPR', description: 'Standard networking access', available: 400 },
      { name: 'Investor Circle', price: 4000, currency: 'NPR', description: 'Private founder networking session', available: 60 },
    ],
    category: 'Tech',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    organizer: 'Startup Nepal',
    featured: true,
    coordinates: { lat: 27.678, lng: 85.3187 },
  },
  {
    title: 'Chitwan Jungle Photography Workshop',
    description: 'A guided practical workshop for beginner and intermediate photographers who want to learn wildlife framing and outdoor storytelling.',
    date: '2026-07-12',
    time: '08:00',
    location: 'Sauraha Community Hall',
    city: 'Chitwan',
    country: 'Nepal',
    ticketCategories: [
      { name: 'Workshop Seat', price: 1400, currency: 'NPR', description: 'Full-day workshop access', available: 80 },
    ],
    category: 'Workshops',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
    organizer: 'Lens Nepal',
    featured: false,
    coordinates: { lat: 27.5767, lng: 84.4968 },
  },
  {
    title: 'Dasharath Stadium Cup Final',
    description: 'A packed final match atmosphere with drums, flags, commentary, and the kind of crowd energy that looks great in your event cards.',
    date: '2026-07-19',
    time: '16:00',
    location: 'Dasharath Stadium',
    city: 'Kathmandu',
    country: 'Nepal',
    ticketCategories: [
      { name: 'General Stand', price: 300, currency: 'NPR', description: 'Standard stadium seating', available: 2500 },
      { name: 'Premium Stand', price: 900, currency: 'NPR', description: 'Better angle and closer view', available: 600 },
      { name: 'VIP Box', price: 2500, currency: 'NPR', description: 'VIP access and lounge entry', available: 90 },
    ],
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80',
    organizer: 'Nepal Sports Network',
    featured: false,
    coordinates: { lat: 27.6945, lng: 85.3208 },
  },
  {
    title: 'Open Air Cinema at Bhaktapur',
    description: 'A relaxed movie night under the sky with bean bags, local snacks, and a heritage-square backdrop that makes the app feel more alive.',
    date: '2026-07-26',
    time: '19:00',
    location: 'Bhaktapur Durbar Square',
    city: 'Bhaktapur',
    country: 'Nepal',
    ticketCategories: [
      { name: 'Standard Seat', price: 450, currency: 'NPR', description: 'General open-air seating', available: 500 },
      { name: 'Couple Pass', price: 800, currency: 'NPR', description: 'Two-entry discounted pass', available: 120 },
    ],
    category: 'Movies',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    organizer: 'Valley Screenings',
    featured: true,
    coordinates: { lat: 27.671, lng: 85.4298 },
  },
];

async function main() {
  const client = await pool.connect();
  try {
    const userResult = await client.query('SELECT id, name, email FROM users ORDER BY created_at ASC LIMIT 1');
    if (userResult.rows.length === 0) {
      throw new Error('No users found. Create an account first, then run this seed again.');
    }

    const owner = userResult.rows[0];
    let inserted = 0;
    let skipped = 0;

    for (const event of demoEvents) {
      const existing = await client.query(
        'SELECT id FROM events WHERE title = $1 AND organizer = $2 LIMIT 1',
        [event.title, event.organizer]
      );

      if (existing.rows.length > 0) {
        skipped += 1;
        continue;
      }

      await client.query(
        `INSERT INTO events (
          title, description, date, time, location, city, country,
          ticket_categories, category, image_url, organizer, featured,
          coordinates, created_by, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8::jsonb, $9, $10, $11, $12,
          $13::jsonb, $14, 'active'
        )`,
        [
          event.title,
          event.description,
          event.date,
          event.time,
          event.location,
          event.city,
          event.country,
          JSON.stringify(event.ticketCategories),
          event.category,
          event.imageUrl,
          event.organizer,
          event.featured,
          JSON.stringify(event.coordinates),
          owner.id,
        ]
      );

      inserted += 1;
    }

    console.log(`Seed complete. Inserted ${inserted} event(s), skipped ${skipped}.`);
    console.log(`Events are linked to: ${owner.name} <${owner.email}>`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

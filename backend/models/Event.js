const { query } = require('../config/database');

const mapEvent = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.date,
    time: row.time,
    location: row.location,
    city: row.city,
    country: row.country,
    ticketCategories: row.ticket_categories || [],
    category: row.category,
    imageUrl: row.image_url,
    organizer: row.organizer,
    featured: row.featured,
    coordinates: row.coordinates || null,
    createdBy: row.created_by_user || row.created_by,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    async save() {
      return Event.save(this);
    },
  };
};

class Event {
  static async create(data) {
    const result = await query(
      `INSERT INTO events (
        title, description, date, time, location, city, country,
        ticket_categories, category, image_url, organizer, featured,
        coordinates, created_by, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, $15
      ) RETURNING *`,
      [
        data.title,
        data.description,
        data.date,
        data.time,
        data.location,
        data.city,
        data.country,
        JSON.stringify(data.ticketCategories || []),
        data.category,
        data.imageUrl,
        data.organizer,
        !!data.featured,
        JSON.stringify(data.coordinates || {}),
        data.createdBy,
        data.status || 'active',
      ]
    );
    return mapEvent(result.rows[0]);
  }

  static async save(event) {
    const result = await query(
      `UPDATE events SET
        title = $2,
        description = $3,
        date = $4,
        time = $5,
        location = $6,
        city = $7,
        country = $8,
        ticket_categories = $9,
        category = $10,
        image_url = $11,
        organizer = $12,
        featured = $13,
        coordinates = $14,
        status = $15,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *`,
      [
        event.id,
        event.title,
        event.description,
        event.date,
        event.time,
        event.location,
        event.city,
        event.country,
        JSON.stringify(event.ticketCategories || []),
        event.category,
        event.imageUrl,
        event.organizer,
        !!event.featured,
        JSON.stringify(event.coordinates || {}),
        event.status,
      ]
    );
    return mapEvent(result.rows[0]);
  }

  static async findById(id) {
    const result = await query(
      `SELECT e.*, json_build_object('id', u.id, 'name', u.name, 'email', u.email) AS created_by_user
       FROM events e
       LEFT JOIN users u ON u.id = e.created_by
       WHERE e.id = $1
       LIMIT 1`,
      [id]
    );
    return mapEvent(result.rows[0]);
  }

  static async findMine(userId) {
    const result = await query(
      `SELECT e.*, json_build_object('id', u.id, 'name', u.name, 'email', u.email) AS created_by_user
       FROM events e
       LEFT JOIN users u ON u.id = e.created_by
       WHERE e.created_by = $1
       ORDER BY e.created_at DESC`,
      [userId]
    );
    return result.rows.map(mapEvent);
  }

  static async search(filters = {}) {
    const clauses = [`e.status = 'active'`];
    const params = [];
    let index = 1;

    if (filters.search) {
      clauses.push(`(e.title ILIKE $${index} OR e.description ILIKE $${index} OR e.location ILIKE $${index} OR e.city ILIKE $${index} OR e.organizer ILIKE $${index} OR e.category ILIKE $${index})`);
      params.push(`%${filters.search}%`);
      index += 1;
    }
    if (filters.category && filters.category !== 'All') {
      clauses.push(`e.category = $${index++}`);
      params.push(filters.category);
    }
    if (filters.city && filters.city !== 'All Cities') {
      clauses.push(`e.city = $${index++}`);
      params.push(filters.city);
    }
    if (filters.country && filters.country !== 'All Countries') {
      clauses.push(`e.country = $${index++}`);
      params.push(filters.country);
    }
    if (filters.featured !== undefined) {
      clauses.push(`e.featured = $${index++}`);
      params.push(filters.featured === 'true' || filters.featured === true);
    }
    if (filters.dateFrom) {
      clauses.push(`e.date >= $${index++}`);
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      clauses.push(`e.date <= $${index++}`);
      params.push(filters.dateTo);
    }
    if (filters.minPrice) {
      clauses.push(`EXISTS (SELECT 1 FROM jsonb_array_elements(e.ticket_categories) category WHERE (category->>'price')::numeric >= $${index})`);
      params.push(filters.minPrice);
      index += 1;
    }
    if (filters.maxPrice) {
      clauses.push(`EXISTS (SELECT 1 FROM jsonb_array_elements(e.ticket_categories) category WHERE (category->>'price')::numeric <= $${index})`);
      params.push(filters.maxPrice);
      index += 1;
    }

    const sortMap = {
      price: `(SELECT MIN((category->>'price')::numeric) FROM jsonb_array_elements(e.ticket_categories) category)`,
      name: 'e.title',
      popularity: 'e.featured',
      date: 'e.date',
    };
    const sortColumn = sortMap[filters.sortBy] || 'e.date';
    const sortDirection = filters.sortOrder === 'desc' ? 'DESC' : 'ASC';
    const limit = Number(filters.limit || 12);
    const page = Number(filters.page || 1);
    const offset = (page - 1) * limit;
    const whereSql = `WHERE ${clauses.join(' AND ')}`;

    const totalResult = await query(`SELECT COUNT(*)::int AS count FROM events e ${whereSql}`, params);
    const listResult = await query(
      `SELECT e.*, json_build_object('id', u.id, 'name', u.name, 'email', u.email) AS created_by_user
       FROM events e
       LEFT JOIN users u ON u.id = e.created_by
       ${whereSql}
       ORDER BY ${sortColumn} ${sortDirection}
       LIMIT $${index++} OFFSET $${index++}`,
      [...params, limit, offset]
    );

    return {
      events: listResult.rows.map(mapEvent),
      total: totalResult.rows[0].count,
      page,
      limit,
      totalPages: Math.ceil(totalResult.rows[0].count / limit),
    };
  }

  static async distinct(field) {
    const allowed = { category: 'category', city: 'city', country: 'country' };
    const column = allowed[field];
    if (!column) return [];
    const result = await query(`SELECT DISTINCT ${column} FROM events WHERE status = 'active' ORDER BY ${column} ASC`);
    return result.rows.map((row) => row[column]);
  }
}

module.exports = Event;

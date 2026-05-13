const { query } = require('../config/database');

const mapWishlist = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    userId: row.user_id,
    eventId: row.event_id,
    eventDetails: row.event_details || {},
    addedAt: row.added_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

class Wishlist {
  static async findByUserId(userId) {
    const result = await query('SELECT * FROM wishlists WHERE user_id = $1 ORDER BY added_at DESC', [userId]);
    return result.rows.map(mapWishlist);
  }

  static async isInWishlist(userId, eventId) {
    const result = await query('SELECT * FROM wishlists WHERE user_id = $1 AND event_id = $2 LIMIT 1', [userId, eventId]);
    return mapWishlist(result.rows[0]);
  }

  static async addToWishlist(userId, eventId, eventDetails) {
    const result = await query(
      `INSERT INTO wishlists (user_id, event_id, event_details) VALUES ($1, $2, $3) RETURNING *`,
      [userId, eventId, JSON.stringify(eventDetails)]
    );
    return mapWishlist(result.rows[0]);
  }

  static async removeFromWishlist(userId, eventId) {
    const result = await query('DELETE FROM wishlists WHERE user_id = $1 AND event_id = $2 RETURNING *', [userId, eventId]);
    return mapWishlist(result.rows[0]);
  }

  static async deleteMany(filter) {
    const result = await query('DELETE FROM wishlists WHERE user_id = $1', [filter.userId]);
    return { deletedCount: result.rowCount };
  }
}

module.exports = Wishlist;

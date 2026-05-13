const { query } = require('../config/database');

const mapTicket = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    ticketId: row.ticket_id,
    userId: row.user_data || row.user_id,
    eventId: row.event_id,
    purchaseId: row.purchase_id,
    quantity: row.quantity,
    unitPrice: Number(row.unit_price),
    totalAmount: Number(row.total_amount),
    originalAmount: Number(row.original_amount),
    discountAmount: Number(row.discount_amount),
    appliedVouchers: row.applied_vouchers || [],
    currency: row.currency,
    paymentMethod: row.payment_method,
    transactionId: row.transaction_id,
    status: row.status,
    purchaseDate: row.purchase_date,
    qrCode: row.qr_code,
    seatNumbers: row.seat_numbers || [],
    eventDetails: row.event_details || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    async save() {
      return Ticket.create(this);
    },
  };
};

class Ticket {
  static async create(data) {
    const result = await query(
      `INSERT INTO tickets (
        ticket_id, user_id, event_id, purchase_id, quantity,
        unit_price, total_amount, original_amount, discount_amount,
        applied_vouchers, currency, payment_method, transaction_id,
        status, purchase_date, qr_code, seat_numbers, event_details
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12, $13,
        $14, $15, $16, $17, $18
      ) RETURNING *`,
      [
        data.ticketId,
        data.userId,
        data.eventId,
        data.purchaseId,
        data.quantity,
        data.unitPrice,
        data.totalAmount,
        data.originalAmount,
        data.discountAmount || 0,
        JSON.stringify(data.appliedVouchers || []),
        data.currency || 'NPR',
        data.paymentMethod,
        data.transactionId,
        data.status || 'confirmed',
        data.purchaseDate || new Date(),
        data.qrCode,
        JSON.stringify(data.seatNumbers || []),
        JSON.stringify(data.eventDetails || {}),
      ]
    );
    return mapTicket(result.rows[0]);
  }

  static async getTicketsByUser(userId) {
    const result = await query('SELECT * FROM tickets WHERE user_id = $1 ORDER BY purchase_date DESC', [userId]);
    return result.rows.map(mapTicket);
  }

  static async getTicketsByEvent(eventId) {
    const result = await query('SELECT * FROM tickets WHERE event_id = $1', [eventId]);
    return result.rows.map(mapTicket);
  }

  static async getTicketsByPurchase(purchaseId) {
    const result = await query('SELECT * FROM tickets WHERE purchase_id = $1', [purchaseId]);
    return result.rows.map(mapTicket);
  }

  static async findById(id) {
    const result = await query(
      `SELECT t.*, json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'preferences', u.preferences) AS user_data
       FROM tickets t
       LEFT JOIN users u ON u.id = t.user_id
       WHERE t.id = $1
       LIMIT 1`,
      [id]
    );
    return mapTicket(result.rows[0]);
  }

  static async updateStatusByTicketIdAndUserId(ticketId, userId, status) {
    const result = await query(
      `UPDATE tickets SET status = $3, updated_at = NOW() WHERE ticket_id = $1 AND user_id = $2 RETURNING *`,
      [ticketId, userId, status]
    );
    return mapTicket(result.rows[0]);
  }

  static async findReminderTickets(date, exact = false) {
    const operator = exact ? '=' : '>=';
    const result = await query(
      `SELECT t.*, json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'preferences', u.preferences) AS user_data
       FROM tickets t
       JOIN users u ON u.id = t.user_id
       WHERE t.status = 'confirmed' AND t.event_details->>'date' ${operator} $1
       ORDER BY t.event_details->>'date' ASC`,
      [date]
    );
    return result.rows.map(mapTicket);
  }
}

module.exports = Ticket;

const { query } = require('../config/database');

const mapVoucher = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    code: row.code,
    event: row.event_data || row.event_id,
    discountPercentage: row.discount_percentage,
    description: row.description,
    maxUses: row.max_uses,
    usedCount: row.used_count,
    validFrom: row.valid_from,
    validUntil: row.valid_until,
    isActive: row.is_active,
    createdBy: row.created_by,
    minOrderAmount: Number(row.min_order_amount || 0),
    maxDiscountAmount: row.max_discount_amount === null ? null : Number(row.max_discount_amount),
    maxUsesPerUser: row.max_uses_per_user,
    remainingUses: row.max_uses - row.used_count,
    isExpired: new Date() < new Date(row.valid_from) || new Date() > new Date(row.valid_until),
    isFullyUsed: row.used_count >= row.max_uses,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    async canUserUseVoucher(userId) {
      const count = await Voucher.getUserUsageCount(this.id, userId);
      return count < this.maxUsesPerUser;
    },
    async getUserUsageCount(userId) {
      return Voucher.getUserUsageCount(this.id, userId);
    },
    async incrementUserUsage(userId) {
      return Voucher.incrementUserUsage(this.id, userId);
    },
    async save() {
      return this.id ? Voucher.updateById(this.id, this) : Voucher.create(this);
    },
  };
};

class Voucher {
  static async create(data) {
    const result = await query(
      `INSERT INTO vouchers (
        code, event_id, discount_percentage, description, max_uses, used_count,
        valid_from, valid_until, is_active, created_by, min_order_amount,
        max_discount_amount, max_uses_per_user
      ) VALUES (
        UPPER($1), $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13
      ) RETURNING *`,
      [
        data.code,
        data.event,
        data.discountPercentage,
        data.description || '',
        data.maxUses,
        data.usedCount || 0,
        data.validFrom,
        data.validUntil,
        data.isActive !== undefined ? data.isActive : true,
        data.createdBy,
        data.minOrderAmount || 0,
        data.maxDiscountAmount || null,
        data.maxUsesPerUser || 1,
      ]
    );
    return mapVoucher(result.rows[0]);
  }

  static async findById(id) {
    const result = await query(
      `SELECT v.*, json_build_object('id', e.id, 'title', e.title) AS event_data
       FROM vouchers v
       LEFT JOIN events e ON e.id = v.event_id
       WHERE v.id = $1
       LIMIT 1`,
      [id]
    );
    return mapVoucher(result.rows[0]);
  }

  static async findByEvent(eventId) {
    const result = await query('SELECT * FROM vouchers WHERE event_id = $1 ORDER BY created_at DESC', [eventId]);
    return result.rows.map(mapVoucher);
  }

  static async updateById(id, updates) {
    const current = await this.findById(id);
    if (!current) return null;
    const next = { ...current, ...updates };
    const result = await query(
      `UPDATE vouchers SET
        code = UPPER($2),
        discount_percentage = $3,
        description = $4,
        max_uses = $5,
        used_count = $6,
        valid_from = $7,
        valid_until = $8,
        is_active = $9,
        min_order_amount = $10,
        max_discount_amount = $11,
        max_uses_per_user = $12,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *`,
      [
        id,
        next.code,
        next.discountPercentage,
        next.description || '',
        next.maxUses,
        next.usedCount || 0,
        next.validFrom,
        next.validUntil,
        next.isActive !== undefined ? next.isActive : true,
        next.minOrderAmount || 0,
        next.maxDiscountAmount || null,
        next.maxUsesPerUser || 1,
      ]
    );
    return mapVoucher(result.rows[0]);
  }

  static async deleteById(id) {
    const result = await query('DELETE FROM vouchers WHERE id = $1 RETURNING *', [id]);
    return mapVoucher(result.rows[0]);
  }

  static async findValidVoucher(code, eventId) {
    const result = await query(
      `SELECT * FROM vouchers
       WHERE code = UPPER($1)
         AND event_id = $2
         AND is_active = TRUE
         AND valid_from <= NOW()
         AND valid_until >= NOW()
         AND used_count < max_uses
       LIMIT 1`,
      [code, eventId]
    );
    return mapVoucher(result.rows[0]);
  }

  static async getUserUsageCount(voucherId, userId) {
    const result = await query('SELECT usage_count FROM voucher_usage WHERE voucher_id = $1 AND user_id = $2 LIMIT 1', [voucherId, userId]);
    return result.rows[0]?.usage_count || 0;
  }

  static async incrementUserUsage(voucherId, userId) {
    await query(
      `INSERT INTO voucher_usage (voucher_id, user_id, usage_count, used_at)
       VALUES ($1, $2, 1, NOW())
       ON CONFLICT (voucher_id, user_id)
       DO UPDATE SET usage_count = voucher_usage.usage_count + 1, used_at = NOW()`,
      [voucherId, userId]
    );
    await query('UPDATE vouchers SET used_count = used_count + 1, updated_at = NOW() WHERE id = $1', [voucherId]);
    return this.findById(voucherId);
  }
}

module.exports = Voucher;

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query, defaultPreferences } = require('../config/database');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const mapUser = (row) => {
  if (!row) return null;

  const user = {
    _id: row.id,
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    password: row.password,
    googleId: row.google_id,
    avatar: row.avatar,
    authProvider: row.auth_provider,
    role: row.role,
    permissions: row.permissions || [],
    isSuperAdmin: row.is_super_admin,
    adminInvitedBy: row.admin_invited_by,
    adminInvitedAt: row.admin_invited_at,
    isVerified: row.is_verified,
    emailVerificationToken: row.email_verification_token,
    emailVerificationExpires: row.email_verification_expires,
    passwordResetToken: row.password_reset_token,
    passwordResetExpires: row.password_reset_expires,
    lastLogin: row.last_login,
    loginAttempts: row.login_attempts,
    lockUntil: row.lock_until,
    preferences: row.preferences || defaultPreferences,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    get isLocked() {
      return !!(this.lockUntil && new Date(this.lockUntil) > new Date());
    },
    toObject() {
      return { ...this };
    },
    async comparePassword(candidatePassword) {
      if (!this.password) return false;
      return bcrypt.compare(candidatePassword, this.password);
    },
    async incLoginAttempts() {
      if (this.lockUntil && new Date(this.lockUntil) < new Date()) {
        await query('UPDATE users SET login_attempts = 1, lock_until = NULL, updated_at = NOW() WHERE id = $1', [this.id]);
        this.loginAttempts = 1;
        this.lockUntil = null;
        return;
      }

      const nextAttempts = (this.loginAttempts || 0) + 1;
      let lockUntil = this.lockUntil;
      if (nextAttempts >= 5 && !this.isLocked) {
        lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000);
      }

      await query('UPDATE users SET login_attempts = $2, lock_until = $3, updated_at = NOW() WHERE id = $1', [this.id, nextAttempts, lockUntil]);
      this.loginAttempts = nextAttempts;
      this.lockUntil = lockUntil;
    },
    async resetLoginAttempts() {
      await query('UPDATE users SET login_attempts = 0, lock_until = NULL, updated_at = NOW() WHERE id = $1', [this.id]);
      this.loginAttempts = 0;
      this.lockUntil = null;
    },
    isAdmin() {
      return this.role === 'admin' || this.role === 'super_admin' || this.isSuperAdmin;
    },
    isSuperAdminUser() {
      return this.role === 'super_admin' || this.isSuperAdmin;
    },
    async promoteToAdmin(invitedBy) {
      return User.updateById(this.id, {
        role: 'admin',
        adminInvitedBy: invitedBy,
        adminInvitedAt: new Date(),
      });
    },
    async promoteToSuperAdmin() {
      return User.updateById(this.id, {
        role: 'super_admin',
        isSuperAdmin: true,
      });
    },
    generatePasswordResetToken() {
      const resetToken = crypto.randomBytes(32).toString('hex');
      this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
      return resetToken;
    },
    async clearPasswordResetToken() {
      return User.updateById(this.id, {
        passwordResetToken: null,
        passwordResetExpires: null,
      }, { includePassword: true });
    },
    async save() {
      return User.save(this);
    },
  };

  return user;
};

const sanitizeUser = (user, includePassword = false) => {
  if (!user) return null;
  if (!includePassword) delete user.password;
  return user;
};

class User {
  static async _hashPasswordIfNeeded(password) {
    if (!password) return password;
    if (password.startsWith('$2')) return password;
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  static async create(data) {
    const password = await this._hashPasswordIfNeeded(data.password || null);
    const result = await query(
      `INSERT INTO users (
        name, email, phone, password, google_id, avatar, auth_provider, role,
        permissions, is_super_admin, admin_invited_by, admin_invited_at, is_verified,
        email_verification_token, email_verification_expires, password_reset_token,
        password_reset_expires, last_login, login_attempts, lock_until, preferences
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13,
        $14, $15, $16,
        $17, $18, $19, $20, $21
      ) RETURNING *`,
      [
        data.name,
        data.email || null,
        data.phone || null,
        password || null,
        data.googleId || null,
        data.avatar || null,
        data.authProvider,
        data.role || 'user',
        data.permissions || [],
        !!data.isSuperAdmin,
        data.adminInvitedBy || null,
        data.adminInvitedAt || null,
        !!data.isVerified,
        data.emailVerificationToken || null,
        data.emailVerificationExpires || null,
        data.passwordResetToken || null,
        data.passwordResetExpires || null,
        data.lastLogin || null,
        data.loginAttempts || 0,
        data.lockUntil || null,
        JSON.stringify(data.preferences || defaultPreferences),
      ]
    );
    return sanitizeUser(mapUser(result.rows[0]), true);
  }

  static async save(user) {
    const password = await this._hashPasswordIfNeeded(user.password || null);
    const result = await query(
      `UPDATE users SET
        name = $2,
        email = $3,
        phone = $4,
        password = $5,
        google_id = $6,
        avatar = $7,
        auth_provider = $8,
        role = $9,
        permissions = $10,
        is_super_admin = $11,
        admin_invited_by = $12,
        admin_invited_at = $13,
        is_verified = $14,
        email_verification_token = $15,
        email_verification_expires = $16,
        password_reset_token = $17,
        password_reset_expires = $18,
        last_login = $19,
        login_attempts = $20,
        lock_until = $21,
        preferences = $22,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *`,
      [
        user.id,
        user.name,
        user.email || null,
        user.phone || null,
        password || null,
        user.googleId || null,
        user.avatar || null,
        user.authProvider,
        user.role,
        user.permissions || [],
        !!user.isSuperAdmin,
        user.adminInvitedBy || null,
        user.adminInvitedAt || null,
        !!user.isVerified,
        user.emailVerificationToken || null,
        user.emailVerificationExpires || null,
        user.passwordResetToken || null,
        user.passwordResetExpires || null,
        user.lastLogin || null,
        user.loginAttempts || 0,
        user.lockUntil || null,
        JSON.stringify(user.preferences || defaultPreferences),
      ]
    );
    return sanitizeUser(mapUser(result.rows[0]), true);
  }

  static async createUser(userData) {
    const { name, emailOrPhone, password, authProvider } = userData;
    const isEmail = EMAIL_REGEX.test(emailOrPhone);
    return this.create({
      name,
      email: isEmail ? emailOrPhone.toLowerCase() : null,
      phone: isEmail ? null : emailOrPhone,
      password: authProvider !== 'google' ? password : null,
      authProvider,
    });
  }

  static async findById(id, options = {}) {
    const result = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
    return sanitizeUser(mapUser(result.rows[0]), options.includePassword);
  }

  static async findOne(filter = {}, options = {}) {
    const clauses = [];
    const params = [];
    let index = 1;
    const columnMap = {
      email: 'email',
      phone: 'phone',
      googleId: 'google_id',
      google_id: 'google_id',
      emailVerificationToken: 'email_verification_token',
      email_verification_token: 'email_verification_token',
      passwordResetToken: 'password_reset_token',
      password_reset_token: 'password_reset_token',
      role: 'role',
      isSuperAdmin: 'is_super_admin',
      is_super_admin: 'is_super_admin',
    };

    Object.entries(filter).forEach(([key, value]) => {
      const column = columnMap[key] || key;
      clauses.push(`${column} = $${index++}`);
      params.push(value);
    });

    const sql = `SELECT * FROM users ${clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''} LIMIT 1`;
    const result = await query(sql, params);
    return sanitizeUser(mapUser(result.rows[0]), options.includePassword);
  }

  static async findByEmailOrPhone(emailOrPhone) {
    if (EMAIL_REGEX.test(emailOrPhone)) {
      return this.findOne({ email: emailOrPhone.toLowerCase() }, { includePassword: true });
    }
    return this.findOne({ phone: emailOrPhone }, { includePassword: true });
  }

  static async updateById(id, updates = {}, options = {}) {
    const current = await this.findById(id, { includePassword: true });
    if (!current) return null;

    const merged = { ...current, ...updates };
    const saved = await this.save(merged);
    return sanitizeUser(saved, options.includePassword);
  }

  static async deleteById(id) {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return sanitizeUser(mapUser(result.rows[0]), true);
  }

  static async list({ limit = 50, offset = 0 } = {}) {
    const result = await query('SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    return result.rows.map((row) => sanitizeUser(mapUser(row), false));
  }

  static async countDocuments() {
    const result = await query('SELECT COUNT(*)::int AS count FROM users');
    return result.rows[0].count;
  }

  static async findAdmins() {
    const result = await query(`SELECT * FROM users WHERE role IN ('admin', 'super_admin') OR is_super_admin = TRUE ORDER BY created_at DESC`);
    return result.rows.map((row) => sanitizeUser(mapUser(row), false));
  }

  static async findSuperAdmins() {
    const result = await query(`SELECT * FROM users WHERE role = 'super_admin' OR is_super_admin = TRUE ORDER BY created_at DESC`);
    return result.rows.map((row) => sanitizeUser(mapUser(row), false));
  }

  static async findByPasswordResetToken(token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const result = await query(
      `SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW() LIMIT 1`,
      [hashedToken]
    );
    return sanitizeUser(mapUser(result.rows[0]), true);
  }
}

module.exports = User;

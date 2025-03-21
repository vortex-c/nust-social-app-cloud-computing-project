const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(username, email, password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at
    `;
    
    const result = await pool.query(query, [username, email, hashedPassword]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT id, username, email, created_at
      FROM users
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = `
      SELECT *
      FROM users
      WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findByUsername(username) {
    const query = `
      SELECT id, username, email, created_at
      FROM users
      WHERE username = $1
    `;
    
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  static async findManyByIds(ids) {
    const query = `
      SELECT id, username, email, created_at
      FROM users
      WHERE id = ANY($1)
    `;
    
    const result = await pool.query(query, [ids]);
    return result.rows;
  }

  static async update(id, data) {
    const { username, email } = data;
    let query = `
      UPDATE users
      SET username = $1, email = $2
      WHERE id = $3
      RETURNING id, username, email, created_at
    `;
    
    const result = await pool.query(query, [username, email, id]);
    return result.rows[0];
  }

  static async changePassword(id, password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = `
      UPDATE users
      SET password = $1
      WHERE id = $2
      RETURNING id
    `;
    
    const result = await pool.query(query, [hashedPassword, id]);
    return result.rowCount > 0;
  }

  static async delete(id) {
    const query = `
      DELETE FROM users
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }
}

module.exports = User;
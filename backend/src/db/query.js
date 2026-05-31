import pool    from './pool.js'
import { env } from '../config/env.js'

/**
 * Execute a SQL query — uses query() not execute()
 * so it handles reconnections automatically
 */
export const query = async (sql, params = []) => {
  if (env.isDev) {
    console.log(`\n📋 SQL: ${sql.trim()}`)
    if (params.length) console.log(`   Params: ${JSON.stringify(params)}`)
  }

  try {
    const [rows] = await pool.query(sql, params)
    return rows
  } catch (err) {
    console.error('❌  Query error:', err.message)
    console.error('   SQL:', sql)
    throw err
  }
}

export const queryOne = async (sql, params = []) => {
  const rows = await query(sql, params)
  return rows[0] || null
}

export const insert = async (sql, params = []) => {
  const [result] = await pool.query(sql, params)
  return result.insertId
}

export const execute = async (sql, params = []) => {
  const [result] = await pool.query(sql, params)
  return result.affectedRows
}

export const transaction = async (callback) => {
  const conn = await pool.getConnection()
  await conn.beginTransaction()
  try {
    const result = await callback(conn)
    await conn.commit()
    return result
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

export const buildWhere = (filters = {}) => {
  const conditions = []
  const values     = []
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      conditions.push(`${key} = ?`)
      values.push(value)
    }
  }
  const clause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : ''
  return { clause, values }
}

export const buildOrderBy = (column, direction = 'ASC', allowedColumns = []) => {
  const safeColumn    = allowedColumns.includes(column) ? column : allowedColumns[0]
  const safeDirection = direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
  return `ORDER BY ${safeColumn} ${safeDirection}`
}

export const buildPagination = (page = 1, limit = 20) => {
  const safePage  = Math.max(1, parseInt(page))
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit)))
  const offset    = (safePage - 1) * safeLimit
  return {
    limitClause: `LIMIT ${safeLimit} OFFSET ${offset}`,
    offset,
    safeLimit,
    safePage,
  }
}
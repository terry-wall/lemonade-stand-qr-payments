import sqlite3 from 'sqlite3'
import { Order, CartItem } from '@/types'
import path from 'path'

// Create database connection
const dbPath = path.join(process.cwd(), 'lemonade_orders.db')
const db = new sqlite3.Database(dbPath)

// Initialize database tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_intent_id TEXT UNIQUE NOT NULL,
      items TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
})

export async function saveOrder(orderData: {
  paymentIntentId: string
  items: CartItem[]
  amount: number
  status: string
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const { paymentIntentId, items, amount, status } = orderData
    
    db.run(
      `INSERT INTO orders (payment_intent_id, items, amount, status) 
       VALUES (?, ?, ?, ?)`,
      [paymentIntentId, JSON.stringify(items), amount, status],
      function(err) {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }
    )
  })
}

export async function getOrder(paymentIntentId: string): Promise<Order | null> {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM orders WHERE payment_intent_id = ?`,
      [paymentIntentId],
      (err, row: any) => {
        if (err) {
          reject(err)
        } else if (row) {
          resolve({
            id: row.id,
            paymentIntentId: row.payment_intent_id,
            items: JSON.parse(row.items),
            amount: row.amount,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          })
        } else {
          resolve(null)
        }
      }
    )
  })
}

export async function updateOrderStatus(
  paymentIntentId: string,
  status: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE orders 
       SET status = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE payment_intent_id = ?`,
      [status, paymentIntentId],
      function(err) {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }
    )
  })
}

export async function getAllOrders(): Promise<Order[]> {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM orders ORDER BY created_at DESC`,
      [],
      (err, rows: any[]) => {
        if (err) {
          reject(err)
        } else {
          const orders = rows.map(row => ({
            id: row.id,
            paymentIntentId: row.payment_intent_id,
            items: JSON.parse(row.items),
            amount: row.amount,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }))
          resolve(orders)
        }
      }
    )
  })
}
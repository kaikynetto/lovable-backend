import { Pool } from 'pg';

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { host, port, database, user, password } = req.body;

  try {
    const pool = new Pool({
      host,
      port,
      database,
      user,
      password,
      ssl: { rejectUnauthorized: false }
    });

    await pool.query('SELECT 1');
    await pool.end();

    res.json({ success: true, data: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
}

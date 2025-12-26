import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST(request: Request) {
  let pool: Pool | null = null;

  try {
    const body = await request.json();
   
    const { database_url } = body

    if (!database_url) {
      return NextResponse.json(
        { error: 'Database URL is required' },
        { status: 400 }
      );
    }

    // Auto-fix password encoding and use pooler
    const fixedUrl = fixDatabaseUrl(database_url);
    
    pool = new Pool({
      connectionString: fixedUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 30000,
    });

    const result = await pool.query('SELECT NOW() as current_time');

    return NextResponse.json({
      success: true,
      message: 'Connection successful',
      timestamp: result.rows[0].current_time
    });

  } catch (err: any) {
    console.error('Connection failed:', err);
    
    // Convert error object to user-friendly string message
    let errorMessage = 'Connection failed';
    
    if (err.message) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    } else if (err.code) {
      // Handle PostgreSQL error codes
      switch (err.code) {
        case 'ECONNREFUSED':
          errorMessage = 'Connection refused. Please check your database URL and credentials.';
          break;
        case 'ENOTFOUND':
          errorMessage = 'Database host not found. Please verify the hostname.';
          break;
        case '28P01':
          errorMessage = 'Authentication failed. Please check your username and password.';
          break;
        case '3D000':
          errorMessage = 'Database does not exist.';
          break;
        case 'ETIMEDOUT':
          errorMessage = 'Connection timeout. Please check your network or database availability.';
          break;
        default:
          errorMessage = `Database error (${err.code}): ${err.message || 'Unknown error'}`;
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        message: errorMessage
      },
      { status: 400 }
    );

  } finally {
    if (pool) {
      try {
        await pool.end();
      } catch (e) {
        console.error('Error closing pool:', e);
      }
    }
  }
}
function fixDatabaseUrl(url: string): string {
  try {
    // Parse URL: postgresql://user:password@host:port/database
    const regex = /^postgresql:\/\/([^:]+):([^@]+)@(.+)$/;
    const match = url.match(regex);

    if (!match) {
      // If already properly formatted, just ensure pooler
      return ensurePooler(url);
    }

    const [, username, password, rest] = match;

    // Encode password (handles @, #, $, %, &, !, spaces, etc.)
    const encodedPassword = encodeURIComponent(password);

    // Rebuild URL
    const fixedUrl = `postgresql://${username}:${encodedPassword}@${rest}`;

    // Ensure using connection pooler (port 6543)
    return ensurePooler(fixedUrl);

  } catch (err) {
    console.error('Error fixing URL:', err);
    return ensurePooler(url);
  }
}

/**
 * Ensure connection pooler is used (port 6543)
 */
function ensurePooler(url: string): string {
  let finalUrl = url;

  // Replace port 5432 with 6543
  if (finalUrl.includes(':5432/')) {
    finalUrl = finalUrl.replace(':5432/', ':6543/');
  }

  // Add pgbouncer parameter if not exists
  if (!finalUrl.includes('pgbouncer=true')) {
    const separator = finalUrl.includes('?') ? '&' : '?';
    finalUrl = `${finalUrl}${separator}pgbouncer=true`;
  }

  return finalUrl;
}
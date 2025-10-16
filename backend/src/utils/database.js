const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || 'sqlite://./tickets.db';
const isPostgreSQL = DATABASE_URL.startsWith('postgresql://');
const isSQLite = DATABASE_URL.startsWith('sqlite://');

let db;

// Initialize database connection
async function initializeDatabase() {
    try {
        if (isPostgreSQL) {
            // PostgreSQL setup
            console.log('🐘 Initializing PostgreSQL connection...');
            db = new Pool({
                connectionString: DATABASE_URL,
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
            });
            
            // Test connection
            const client = await db.connect();
            console.log('✅ PostgreSQL connected successfully');
            client.release();
            
        } else if (isSQLite) {
            // SQLite setup
            console.log('📁 Initializing SQLite connection...');
            const Database = require('better-sqlite3');
            const dbPath = DATABASE_URL.replace('sqlite://', '');
            db = new Database(dbPath);
            console.log('✅ SQLite connected successfully');
            
        } else {
            throw new Error('Unsupported database type. Use postgresql:// or sqlite:// URL');
        }
        
        // Run migrations
        await runMigrations();
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
}

// Run database migrations
async function runMigrations() {
    try {
        console.log('🔄 Running database migrations...');
        
        const migrationFile = isPostgreSQL 
            ? '001_create_tickets_table.sql'
            : '001_create_tickets_table_sqlite.sql';
            
        const migrationPath = path.join(__dirname, '../../migrations', migrationFile);
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        if (isPostgreSQL) {
            await db.query(migrationSQL);
        } else if (isSQLite) {
            db.exec(migrationSQL);
        }
        
        console.log('✅ Migrations completed successfully');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

// Generic query function
async function query(sql, params = []) {
    try {
        if (isPostgreSQL) {
            const result = await db.query(sql, params);
            return result.rows;
        } else if (isSQLite) {
            const stmt = db.prepare(sql);
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                return stmt.all(params);
            } else {
                const result = stmt.run(params);
                return { 
                    insertId: result.lastInsertRowid,
                    affectedRows: result.changes,
                    rows: []
                };
            }
        }
    } catch (error) {
        console.error('❌ Database query error:', error);
        throw error;
    }
}

// Get single record
async function queryOne(sql, params = []) {
    const results = await query(sql, params);
    return results[0] || null;
}

// Transaction wrapper
async function transaction(callback) {
    if (isPostgreSQL) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } else if (isSQLite) {
        const txn = db.transaction(callback);
        return txn();
    }
}

// Helper function to get current timestamp
function getCurrentTimestamp() {
    if (isPostgreSQL) {
        return 'CURRENT_TIMESTAMP';
    } else {
        return 'CURRENT_TIMESTAMP';
    }
}

// Helper function to add minutes to current time
function getExpirationTimestamp(minutes = 15) {
    if (isPostgreSQL) {
        return `CURRENT_TIMESTAMP + INTERVAL '${minutes} minutes'`;
    } else {
        // SQLite datetime function
        return `datetime('now', '+${minutes} minutes')`;
    }
}

// Close database connection
async function closeDatabase() {
    try {
        if (isPostgreSQL && db) {
            await db.end();
            console.log('🐘 PostgreSQL connection closed');
        } else if (isSQLite && db) {
            db.close();
            console.log('📁 SQLite connection closed');
        }
    } catch (error) {
        console.error('❌ Error closing database:', error);
    }
}

// Health check function
async function healthCheck() {
    try {
        const timestamp = new Date().toISOString();
        
        if (isPostgreSQL) {
            const result = await query('SELECT NOW() as current_time');
            return {
                status: 'healthy',
                database: 'PostgreSQL',
                server_time: result[0].current_time,
                timestamp
            };
        } else if (isSQLite) {
            const result = await query("SELECT datetime('now') as current_time");
            return {
                status: 'healthy',
                database: 'SQLite',
                server_time: result[0].current_time,
                timestamp
            };
        }
    } catch (error) {
        return {
            status: 'unhealthy',
            database: isPostgreSQL ? 'PostgreSQL' : 'SQLite',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = {
    initializeDatabase,
    query,
    queryOne,
    transaction,
    getCurrentTimestamp,
    getExpirationTimestamp,
    closeDatabase,
    healthCheck,
    isPostgreSQL,
    isSQLite
};
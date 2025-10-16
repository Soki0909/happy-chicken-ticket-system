-- Happy Chicken Ticket System Database Migration
-- Creates the necessary tables for the ticket management system

-- Drop tables if they exist (for clean migration)
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS ticket_counter CASCADE;

-- Create tickets table
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    ticket_number INTEGER NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_tickets_session_id ON tickets(session_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_expires_at ON tickets(expires_at);
CREATE INDEX idx_tickets_ticket_number ON tickets(ticket_number);

-- Create ticket counter table for managing sequential numbers
CREATE TABLE ticket_counter (
    id INTEGER PRIMARY KEY DEFAULT 1,
    current_number INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Insert initial counter record
INSERT INTO ticket_counter (current_number) VALUES (0);

-- Add comments for documentation
COMMENT ON TABLE tickets IS 'Stores issued ticket numbers and their status';
COMMENT ON COLUMN tickets.ticket_number IS 'Display number shown to customers (001, 002, etc.)';
COMMENT ON COLUMN tickets.status IS 'Ticket status: pending, completed, expired';
COMMENT ON COLUMN tickets.session_id IS 'Session identifier for tracking user sessions';
COMMENT ON COLUMN tickets.expires_at IS 'Expiration timestamp (15 minutes from creation)';

COMMENT ON TABLE ticket_counter IS 'Manages sequential ticket number generation';
COMMENT ON COLUMN ticket_counter.current_number IS 'Last issued ticket number';

-- Create function to automatically cleanup expired tickets (optional)
CREATE OR REPLACE FUNCTION cleanup_expired_tickets()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete tickets older than 24 hours to keep database clean
    DELETE FROM tickets 
    WHERE created_at < NOW() - INTERVAL '24 hours';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup activity
    RAISE NOTICE 'Cleaned up % expired tickets', deleted_count;
    
    RETURN deleted_count;
END;
$$;
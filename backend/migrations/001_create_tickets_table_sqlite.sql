-- Happy Chicken Ticket System Database Migration (SQLite Version)
-- Creates the necessary tables for the ticket management system

-- Drop tables if they exist (for clean migration)
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS ticket_counter;

-- Create tickets table
CREATE TABLE tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_number INTEGER NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    session_id TEXT NOT NULL,
    expires_at DATETIME NOT NULL
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHECK (id = 1)
);

-- Insert initial counter record
INSERT INTO ticket_counter (id, current_number) VALUES (1, 0);
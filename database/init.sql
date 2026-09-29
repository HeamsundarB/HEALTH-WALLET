-- HEALTH WALLET — Phase 0 PostgreSQL Database Foundation
-- Team: MEDIMIND

-- Create Database if not exists (Handled by Docker entrypoint)
-- CREATE DATABASE health_wallet_db;

-- Initial Schema Extension Stubs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Phase 0 System Health Log Table Foundation
CREATE TABLE IF NOT EXISTS system_health_logs (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL DEFAULT 'health-wallet-backend',
    status VARCHAR(50) NOT NULL DEFAULT 'ok',
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Phase 0 initialization record
INSERT INTO system_health_logs (service_name, status) 
VALUES ('health-wallet-backend', 'ok');

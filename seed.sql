-- Database seed file for TMS RBAC system
-- This file creates the necessary tables and inserts sample data

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_org_id INTEGER NULL,
    CONSTRAINT fk_organizations_parent 
        FOREIGN KEY (parent_org_id) 
        REFERENCES organizations(id) 
        ON DELETE SET NULL
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    feature VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    CONSTRAINT unique_role_feature_action 
        UNIQUE (role, feature, action)
);

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create org_user_roles table for user-organization role assignments
CREATE TABLE IF NOT EXISTS org_user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id INTEGER NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL,
    CONSTRAINT fk_org_user_roles_organization 
        FOREIGN KEY (org_id) 
        REFERENCES organizations(id),
    CONSTRAINT fk_org_user_roles_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id),
    CONSTRAINT unique_org_user_role 
        UNIQUE (org_id, user_id)
);

-- Insert sample organizations
INSERT INTO organizations (id, name, parent_org_id) VALUES
(1, 'Acme Corporation', NULL),
(2, 'Engineering Department', 1),
(3, 'Marketing Department', 1),
(4, 'ABC Company', NULL),
(5, 'Backend Team', 4),
(6, 'Design Team', 4),
(7, 'Content Team', 4);

-- Insert users for each role for each organization
-- Password for all users: 123456 (hashed with bcrypt)
INSERT INTO users (id, name, email, password) VALUES
-- Acme Corporation users
('550e8400-e29b-41d4-a716-446655440001', 'Acme Owner', 'acme.owner@acme.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('550e8400-e29b-41d4-a716-446655440002', 'Acme Admin', 'acme.admin@acme.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('550e8400-e29b-41d4-a716-446655440003', 'Acme Viewer', 'acme.viewer@acme.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),

-- Engineering Department users
('550e8400-e29b-41d4-a716-446655440004', 'Engineering Owner', 'eng.owner@acme.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('550e8400-e29b-41d4-a716-446655440005', 'Engineering Admin', 'eng.admin@acme.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('550e8400-e29b-41d4-a716-446655440006', 'Engineering Viewer', 'eng.viewer@acme.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),

-- Marketing Department users
('550e8400-e29b-41d4-a716-446655440007', 'Marketing Owner', 'marketing.owner@acme.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('550e8400-e29b-41d4-a716-446655440008', 'Marketing Admin', 'marketing.admin@acme.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('550e8400-e29b-41d4-a716-446655440009', 'Marketing Viewer', 'marketing.viewer@acme.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),

-- ABC Company users
('550e8400-e29b-41d4-a716-446655440010', 'ABC Owner', 'abc.owner@abc.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('550e8400-e29b-41d4-a716-446655440011', 'ABC Admin', 'abc.admin@abc.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('550e8400-e29b-41d4-a716-446655440012', 'ABC Viewer', 'abc.viewer@abc.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),

-- Backend Team users
('550e8400-e29b-41d4-a716-446655440013', 'Backend Owner', 'backend.owner@abc.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('550e8400-e29b-41d4-a716-446655440014', 'Backend Admin', 'backend.admin@abc.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('550e8400-e29b-41d4-a716-446655440015', 'Backend Viewer', 'backend.viewer@abc.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),

-- Design Team users
('550e8400-e29b-41d4-a716-446655440016', 'Design Owner', 'design.owner@abc.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('550e8400-e29b-41d4-a716-446655440017', 'Design Admin', 'design.admin@abc.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('550e8400-e29b-41d4-a716-446655440018', 'Design Viewer', 'design.viewer@abc.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),

-- Content Team users
('550e8400-e29b-41d4-a716-446655440019', 'Content Owner', 'content.owner@abc.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('550e8400-e29b-41d4-a716-446655440020', 'Content Admin', 'content.admin@abc.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('550e8400-e29b-41d4-a716-446655440021', 'Content Viewer', 'content.viewer@abc.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Insert user-organization role assignments
INSERT INTO org_user_roles (org_id, user_id, role) VALUES
-- Acme Corporation roles
(1, '550e8400-e29b-41d4-a716-446655440001', 'OWNER'),
(1, '550e8400-e29b-41d4-a716-446655440002', 'ADMIN'),
(1, '550e8400-e29b-41d4-a716-446655440003', 'VIEWER'),

-- Engineering Department roles
(2, '550e8400-e29b-41d4-a716-446655440004', 'OWNER'),
(2, '550e8400-e29b-41d4-a716-446655440005', 'ADMIN'),
(2, '550e8400-e29b-41d4-a716-446655440006', 'VIEWER'),

-- Marketing Department roles
(3, '550e8400-e29b-41d4-a716-446655440007', 'OWNER'),
(3, '550e8400-e29b-41d4-a716-446655440008', 'ADMIN'),
(3, '550e8400-e29b-41d4-a716-446655440009', 'VIEWER'),

-- ABC Company roles
(4, '550e8400-e29b-41d4-a716-446655440010', 'OWNER'),
(4, '550e8400-e29b-41d4-a716-446655440011', 'ADMIN'),
(4, '550e8400-e29b-41d4-a716-446655440012', 'VIEWER'),

-- Backend Team roles
(5, '550e8400-e29b-41d4-a716-446655440013', 'OWNER'),
(5, '550e8400-e29b-41d4-a716-446655440014', 'ADMIN'),
(5, '550e8400-e29b-41d4-a716-446655440015', 'VIEWER'),

-- Design Team roles
(6, '550e8400-e29b-41d4-a716-446655440016', 'OWNER'),
(6, '550e8400-e29b-41d4-a716-446655440017', 'ADMIN'),
(6, '550e8400-e29b-41d4-a716-446655440018', 'VIEWER'),

-- Content Team roles
(7, '550e8400-e29b-41d4-a716-446655440019', 'OWNER'),
(7, '550e8400-e29b-41d4-a716-446655440020', 'ADMIN'),
(7, '550e8400-e29b-41d4-a716-446655440021', 'VIEWER');

-- Insert sample permissions
-- OWNER permissions (full access to everything)
INSERT INTO permissions (role, feature, action) VALUES
('OWNER', 'users', 'delete'),
('OWNER', 'organizations', 'delete'),

-- ADMIN permissions (can manage users and organizations, view reports)
INSERT INTO permissions (role, feature, action) VALUES
('ADMIN', 'users', 'create'),
('ADMIN', 'users', 'edit'),
('ADMIN', 'organizations', 'create'),
('ADMIN', 'organizations', 'edit'),

-- VIEWER permissions (read-only access)
INSERT INTO permissions (role, feature, action) VALUES
('VIEWER', 'users', 'view'),
('VIEWER', 'organizations', 'view'),

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organizations_parent_org_id ON organizations(parent_org_id);
CREATE INDEX IF NOT EXISTS idx_permissions_role ON permissions(role);
CREATE INDEX IF NOT EXISTS idx_permissions_feature ON permissions(feature);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);
CREATE INDEX IF NOT EXISTS idx_permissions_role_feature ON permissions(role, feature);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_org_user_roles_org_id ON org_user_roles(org_id);
CREATE INDEX IF NOT EXISTS idx_org_user_roles_user_id ON org_user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_org_user_roles_role ON org_user_roles(role);

-- Reset sequences to start from the next available ID
SELECT setval('organizations_id_seq', (SELECT MAX(id) FROM organizations));
SELECT setval('permissions_id_seq', (SELECT MAX(id) FROM permissions));

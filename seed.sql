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
(4, 'Frontend Team', 2),
(5, 'Backend Team', 2),
(6, 'Design Team', 3),
(7, 'Content Team', 3);

-- Insert sample permissions
-- OWNER permissions (full access to everything)
INSERT INTO permissions (role, feature, action) VALUES
('OWNER', 'users', 'create'),
('OWNER', 'users', 'delete'),
('OWNER', 'users', 'edit'),
('OWNER', 'users', 'view'),
('OWNER', 'organizations', 'create'),
('OWNER', 'organizations', 'delete'),
('OWNER', 'organizations', 'edit'),
('OWNER', 'organizations', 'view'),
('OWNER', 'permissions', 'create'),
('OWNER', 'permissions', 'delete'),
('OWNER', 'permissions', 'edit'),
('OWNER', 'permissions', 'view'),
('OWNER', 'reports', 'create'),
('OWNER', 'reports', 'delete'),
('OWNER', 'reports', 'edit'),
('OWNER', 'reports', 'view'),
('OWNER', 'settings', 'create'),
('OWNER', 'settings', 'delete'),
('OWNER', 'settings', 'edit'),
('OWNER', 'settings', 'view');

-- ADMIN permissions (can manage users and organizations, view reports)
INSERT INTO permissions (role, feature, action) VALUES
('ADMIN', 'users', 'create'),
('ADMIN', 'users', 'edit'),
('ADMIN', 'users', 'view'),
('ADMIN', 'organizations', 'create'),
('ADMIN', 'organizations', 'edit'),
('ADMIN', 'organizations', 'view'),
('ADMIN', 'permissions', 'view'),
('ADMIN', 'reports', 'view'),
('ADMIN', 'settings', 'view');

-- VIEWER permissions (read-only access)
INSERT INTO permissions (role, feature, action) VALUES
('VIEWER', 'users', 'view'),
('VIEWER', 'organizations', 'view'),
('VIEWER', 'reports', 'view');

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

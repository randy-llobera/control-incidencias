-- Seed script for testing the Control de Comportamiento system
-- Run this in your Supabase SQL Editor after setting up the main schema

-- Insert some sample groups
INSERT INTO groups (name, created_by) VALUES 
  ('ESO 1A', (SELECT id FROM users LIMIT 1)),
  ('ESO 1B', (SELECT id FROM users LIMIT 1)),
  ('ESO 2A', (SELECT id FROM users LIMIT 1)),
  ('ESO 2B', (SELECT id FROM users LIMIT 1));

-- Insert some sample categories
INSERT INTO categories (name, created_by) VALUES 
  ('Falta de respeto', (SELECT id FROM users LIMIT 1)),
  ('Comportamiento disruptivo', (SELECT id FROM users LIMIT 1)),
  ('Falta de material', (SELECT id FROM users LIMIT 1)),
  ('Agresión verbal', (SELECT id FROM users LIMIT 1)),
  ('Agresión física', (SELECT id FROM users LIMIT 1)),
  ('Uso inadecuado de dispositivos', (SELECT id FROM users LIMIT 1));

-- Insert some sample students
INSERT INTO students (name, group_id) VALUES 
  ('Ana García', (SELECT id FROM groups WHERE name = '1º A' LIMIT 1)),
  ('Carlos López', (SELECT id FROM groups WHERE name = '1º A' LIMIT 1)),
  ('María Rodríguez', (SELECT id FROM groups WHERE name = '1º B' LIMIT 1)),
  ('José Martínez', (SELECT id FROM groups WHERE name = '1º B' LIMIT 1)),
  ('Laura Sánchez', (SELECT id FROM groups WHERE name = '2º A' LIMIT 1)),
  ('Pedro González', (SELECT id FROM groups WHERE name = '2º A' LIMIT 1)),
  ('Sofia Fernández', (SELECT id FROM groups WHERE name = '2º B' LIMIT 1)),
  ('Diego Ruiz', (SELECT id FROM groups WHERE name = '2º B' LIMIT 1)),
  ('Elena Torres', (SELECT id FROM groups WHERE name = '3º A' LIMIT 1)),
  ('Miguel Herrera', (SELECT id FROM groups WHERE name = '3º A' LIMIT 1));

-- Insert some sample incidents
INSERT INTO incidents (student_id, category_id, severity, description, date, teacher_id) VALUES 
  (
    (SELECT id FROM students WHERE name = 'Ana García' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Falta de respeto' LIMIT 1),
    'low',
    'No siguió las instrucciones del profesor durante la clase de matemáticas',
    '2024-01-15',
    (SELECT id FROM users LIMIT 1)
  ),
  (
    (SELECT id FROM students WHERE name = 'Carlos López' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Comportamiento disruptivo' LIMIT 1),
    'medium',
    'Interrumpió constantemente la clase hablando con sus compañeros',
    '2024-01-16',
    (SELECT id FROM users LIMIT 1)
  ),
  (
    (SELECT id FROM students WHERE name = 'María Rodríguez' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Falta de material' LIMIT 1),
    'low',
    'No trajo el libro de texto requerido para la clase',
    '2024-01-17',
    (SELECT id FROM users LIMIT 1)
  ),
  (
    (SELECT id FROM students WHERE name = 'José Martínez' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Agresión verbal' LIMIT 1),
    'high',
    'Insultó a un compañero durante el recreo',
    '2024-01-18',
    (SELECT id FROM users LIMIT 1)
  ),
  (
    (SELECT id FROM students WHERE name = 'Laura Sánchez' LIMIT 1),
    (SELECT id FROM categories WHERE name = 'Uso inadecuado de dispositivos' LIMIT 1),
    'medium',
    'Usó el teléfono móvil durante la clase sin permiso',
    '2024-01-19',
    (SELECT id FROM users LIMIT 1)
  );

-- Note: Make sure you have at least one user created before running this script
-- The script assumes there's at least one user in the users table

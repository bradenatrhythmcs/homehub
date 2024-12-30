-- Add color column to categories table
ALTER TABLE categories ADD COLUMN color TEXT DEFAULT 'orange';

-- Update predefined categories to use orange as default color
UPDATE categories SET color = 'orange' WHERE is_predefined = 1; 
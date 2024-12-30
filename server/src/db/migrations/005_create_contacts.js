module.exports = {
    version: 12,
    description: 'Create contacts table',
    up: async (db) => {
        // Create contacts table
        await db.run(`
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_by INTEGER NOT NULL,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                street_address TEXT,
                city TEXT,
                state TEXT,
                postal_code TEXT,
                country TEXT,
                phone_number TEXT,
                email TEXT,
                date_of_birth DATE,
                contact_type TEXT NOT NULL CHECK (contact_type IN ('Family', 'Friend', 'Business', 'Vendor', 'Other')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Create index for created_by to optimize queries
        await db.run(`
            CREATE INDEX IF NOT EXISTS contacts_created_by_idx ON contacts(created_by)
        `);

        // Create trigger for updating the updated_at timestamp
        await db.run(`
            CREATE TRIGGER IF NOT EXISTS update_contacts_updated_at
            AFTER UPDATE ON contacts
            BEGIN
                UPDATE contacts SET updated_at = CURRENT_TIMESTAMP
                WHERE id = NEW.id;
            END
        `);
    }
}; 
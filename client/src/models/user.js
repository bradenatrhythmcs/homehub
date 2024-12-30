static async findById(id) {
    try {
        console.log('Finding user by ID:', id);
        const users = await getQuery(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        console.log('Query result:', users[0]);
        return users[0];
    } catch (error) {
        console.error('Error in findById:', error);
        throw error;
    }
} 
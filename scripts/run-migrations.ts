import { getDatabase } from '../src/config/database';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  try {
    const db = getDatabase();
    
    // Read migration file
    const migrationPath = path.join(__dirname, '../src/database/migrations/001_workos_auth_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running WorkOS auth tables migration...');
    
    // Execute migration
    const { error } = await db.getSupabaseClient()
      .rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runMigrations();
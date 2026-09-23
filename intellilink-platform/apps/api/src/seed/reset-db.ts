import { DataSource } from 'typeorm';
import * as Entities from '../entities';

export async function resetDb() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'intellilink',
    password: process.env.DATABASE_PASSWORD || 'intellilink_dev',
    database: process.env.DATABASE_NAME || 'intellilink',
    entities: Object.values(Entities),
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('⚠️ Dropping all database tables...');
  await dataSource.dropDatabase();
  await dataSource.synchronize();
  console.log('✅ Database reset successfully.');
  await dataSource.destroy();
}

if (require.main === module) {
  resetDb().catch((err) => {
    console.error('Reset failed:', err);
    process.exit(1);
  });
}

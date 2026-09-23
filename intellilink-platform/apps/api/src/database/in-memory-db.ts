import { newDb, IMemoryDb } from 'pg-mem';
import { DataSource } from 'typeorm';
import * as Entities from '../entities';

import { v4 as uuidv4 } from 'uuid';

let memoryDbInstance: IMemoryDb | null = null;
let memoryDataSource: DataSource | null = null;

export async function getOrCreateMemoryDataSource(): Promise<DataSource> {
  if (memoryDataSource && memoryDataSource.isInitialized) {
    return memoryDataSource;
  }

  const db = newDb({ autoCreateForeignKeyIndices: true });

  db.public.registerFunction({
    name: 'version',
    implementation: () => 'PostgreSQL 16.0 (pg-mem in-memory fabric)',
  });

  db.public.registerFunction({
    name: 'current_database',
    implementation: () => 'intellilink',
  });

  db.public.registerFunction({
    name: 'uuid_generate_v4',
    implementation: () => uuidv4(),
  });

  db.public.registerFunction({
    name: 'gen_random_uuid',
    implementation: () => uuidv4(),
  });

  const ds = await db.adapters.createTypeormDataSource({
    type: 'postgres',
    entities: Object.values(Entities),
  });

  await ds.initialize();
  await ds.synchronize();

  memoryDbInstance = db;
  memoryDataSource = ds;
  return ds;
}

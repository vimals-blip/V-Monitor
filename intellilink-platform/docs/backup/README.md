# Backup & Restoration Procedures

## Database Backup
```bash
pg_dump -h $DATABASE_HOST -U $DATABASE_USER -d $DATABASE_NAME -F c -b -v -f intellilink_backup.dump
```

## Restoration
```bash
pg_restore -h $DATABASE_HOST -U $DATABASE_USER -d $DATABASE_NAME -v intellilink_backup.dump
```

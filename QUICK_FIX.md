# Quick Fix for SQLite3 Migration

The issue is that `better-sqlite3` requires Visual Studio Build Tools on Windows. I've switched to `sqlite3` which has prebuilt binaries.

## Status
- ✅ `backend/package.json` - Updated to use `sqlite3`
- ✅ `backend/database/db.js` - Updated with compatibility layer
- ✅ `backend/routes/equipment.js` - Updated to async/await
- ⚠️ Other route files need async/await updates

## To Complete the Migration

All route handlers need to be updated from:
```javascript
router.get('/', (req, res) => {
  const data = db.prepare('...').all();
  ...
});
```

To:
```javascript
router.get('/', async (req, res) => {
  const data = await db.prepare('...').all();
  ...
});
```

Files needing updates:
- routes/teams.js
- routes/technicians.js
- routes/requests.js (7 endpoints)
- routes/dashboard.js
- routes/notes.js

## Alternative: Install Build Tools

If you prefer to use `better-sqlite3`:
1. Install Visual Studio Build Tools: https://visualstudio.microsoft.com/downloads/
2. Select "Desktop development with C++" workload
3. Run `npm install` in backend folder


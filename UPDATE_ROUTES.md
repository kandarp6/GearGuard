# Route Files Need Async/Await Update

All route files need to be updated from synchronous `better-sqlite3` to asynchronous `sqlite3`.

Files to update:
1. ✅ equipment.js - DONE
2. teams.js
3. technicians.js  
4. requests.js (most critical)
5. dashboard.js
6. notes.js

Pattern:
- Change `router.get('/', (req, res) => {` to `router.get('/', async (req, res) => {`
- Change `db.prepare(...).all()` to `await db.prepare(...).all()`
- Change `db.prepare(...).get()` to `await db.prepare(...).get()`
- Change `db.prepare(...).run()` to `await db.prepare(...).run()`


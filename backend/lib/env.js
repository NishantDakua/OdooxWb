const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is missing. Create `backend/.env` (or repo-root `.env`) from `.env.example` and set DATABASE_URL and DIRECT_URL.'
  );
}

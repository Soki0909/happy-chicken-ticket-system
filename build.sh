# Render.com Build Script
# This script prepares the application for deployment on Render.com

echo "🐔 Happy Chicken Ticket System - Build Starting..."

# Create necessary directories
mkdir -p data
mkdir -p logs

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Run database migrations
echo "🗄️ Setting up database..."
export DATABASE_URL="sqlite://./data/tickets.db"
node -e "
const { initializeDatabase } = require('./backend/src/utils/database');
initializeDatabase().then(() => {
  console.log('✅ Database initialized successfully');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
});
"

echo "✅ Build completed successfully!"
echo "🚀 Ready for deployment!"
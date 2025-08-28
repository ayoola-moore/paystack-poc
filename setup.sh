#!/bin/bash

echo "🚀 Setting up Paystack POC - Grundy Marketplace"
echo "================================================"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for Node.js
if command_exists node; then
    echo "✅ Node.js is installed: $(node --version)"
else
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check for npm
if command_exists npm; then
    echo "✅ npm is installed: $(npm --version)"
else
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

cd ..

echo ""
echo "🔧 Setting up environment files..."

# Create backend .env if it doesn't exist
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env (please update with your Paystack keys)"
else
    echo "ℹ️  backend/.env already exists"
fi

# Create frontend .env if it doesn't exist
if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env (please update with your Paystack public key)"
else
    echo "ℹ️  frontend/.env already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your Paystack secret key"
echo "2. Update frontend/.env with your Paystack public key"
echo ""
echo "To start the application:"
echo "Backend:  cd backend && npm run dev"
echo "Frontend: cd frontend && npm run dev"
echo ""
echo "Then open http://localhost:5173 in your browser"
echo ""
echo "📖 Read README.md for detailed instructions and API documentation"

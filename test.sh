#!/bin/bash

echo "🧪 Testing Paystack POC Setup"
echo "============================="

# Test backend health
echo "Testing backend health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3001/health)
if echo "$HEALTH_RESPONSE" | grep -q "success"; then
    echo "✅ Backend is running and healthy"
else
    echo "❌ Backend is not responding. Make sure to start it with: cd backend && npm run dev"
    exit 1
fi

# Test backend orders endpoint
echo "Testing backend orders endpoint..."
ORDERS_RESPONSE=$(curl -s http://localhost:3001/orders)
if echo "$ORDERS_RESPONSE" | grep -q "success"; then
    echo "✅ Backend orders endpoint is working"
else
    echo "❌ Backend orders endpoint is not working"
    exit 1
fi

# Test frontend accessibility
echo "Testing frontend accessibility..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo "✅ Frontend is accessible at http://localhost:5173"
else
    echo "❌ Frontend is not accessible. Make sure to start it with: cd frontend && npm run dev"
    exit 1
fi

echo ""
echo "🎉 All tests passed! Your Paystack POC is ready to use."
echo ""
echo "Access points:"
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Admin Panel: http://localhost:5173/admin"
echo "📊 Backend API: http://localhost:3001"
echo "❤️ Health Check: http://localhost:3001/health"
echo ""
echo "Test cards for Paystack:"
echo "💳 Success: 4084084084084081"
echo "💳 Insufficient funds: 4094849999999994"
echo "💳 Failed: 4111111111111112"

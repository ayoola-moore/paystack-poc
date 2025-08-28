#!/bin/bash

echo "🔍 Checking Paystack POC Status"
echo "==============================="

echo ""
echo "🔧 Backend Status:"
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend is running on http://localhost:3001"
    echo "   Health: $(curl -s http://localhost:3001/health | jq -r '.message' 2>/dev/null || echo 'OK')"
else
    echo "❌ Backend is not running"
fi

echo ""
echo "🌐 Frontend Status:"
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:5173"
elif curl -s http://localhost:5174 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:5174"
else
    echo "❌ Frontend is not accessible"
fi

echo ""
echo "📊 Port Usage:"
lsof -i :3001 -i :5173 -i :5174 2>/dev/null | grep LISTEN || echo "No ports in use"

echo ""
echo "🚀 Access URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Admin Panel: http://localhost:5173/admin"
echo "   Backend API: http://localhost:3001"
echo "   Health Check: http://localhost:3001/health"

echo ""
echo "💳 Test Cards:"
echo "   Success: 4084084084084081"
echo "   Insufficient: 4094849999999994"
echo "   Failed: 4111111111111112"

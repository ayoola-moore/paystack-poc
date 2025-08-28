# Paystack POC Frontend

React frontend for the Paystack proof of concept implementation.

## Features

- Marketplace with shopping cart
- Multiple payment methods (Pay Now, Pay on Delivery)
- Real-time order tracking
- Payment callbacks handling
- Admin panel for order management
- AWS Amplify ready

## Components

- `Checkout.jsx` - Main shopping and checkout interface
- `PaymentCallback.jsx` - Handles payment confirmations
- `OrderStatus.jsx` - Real-time order tracking
- `AdminPanel.jsx` - Order management interface

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
VITE_API_BASE_URL=http://localhost:3001
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
```

3. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build for Production

```bash
npm run build
```

## Routes

- `/` - Marketplace and checkout
- `/callback` - Standard payment callback
- `/pod-callback` - Pay on delivery callback
- `/order/:orderId` - Order status tracking
- `/admin` - Admin panel

## AWS Amplify Integration

The app includes basic AWS Amplify configuration. To enable full authentication:

1. Install Amplify CLI
2. Run `amplify init`
3. Add authentication with `amplify add auth`
4. Deploy with `amplify push`

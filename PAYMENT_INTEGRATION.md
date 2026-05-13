# Payment Gateway Integration Guide

This document provides instructions for integrating Khalti and eSewa payment gateways into the melaX application.

## Current Implementation

The application currently uses mock payment processing to simulate Khalti and eSewa payments. This allows for testing the user interface and flow without requiring actual merchant accounts.

## Production Integration Steps

### 1. Khalti Integration

#### Prerequisites
- Register as a merchant at [Khalti Merchant Portal](https://khalti.com/merchant/)
- Complete Business KYC
- Obtain API credentials (Public Key, Secret Key)

#### Implementation Steps

1. **Install Khalti SDK**
   ```bash
   npm install khalti-checkout-web
   ```

2. **Update PaymentContext.tsx**
   ```typescript
   import KhaltiCheckout from "khalti-checkout-web";
   
   const processKhaltiPayment = async (details: PaymentDetails): Promise<PaymentResult> => {
     const config = {
       publicKey: process.env.REACT_APP_KHALTI_PUBLIC_KEY,
       productIdentity: details.eventId,
       productName: details.eventTitle,
       productUrl: window.location.href,
       eventHandler: {
         onSuccess(payload: any) {
           // Handle successful payment
           return {
             success: true,
             transactionId: payload.idx,
             paymentGateway: 'khalti',
             amount: details.totalAmount
           };
         },
         onError(error: any) {
           // Handle payment error
           return {
             success: false,
             paymentGateway: 'khalti',
             amount: details.totalAmount,
             error: error.message
           };
         }
       },
       paymentPreference: ['KHALTI', 'EBANKING', 'MOBILE_BANKING', 'CONNECT_IPS', 'SCT'],
     };
     
     const checkout = new KhaltiCheckout(config);
     checkout.show({ amount: details.totalAmount * 100 }); // Amount in paisa
   };
   ```

3. **Environment Variables**
   ```env
   REACT_APP_KHALTI_PUBLIC_KEY=your_khalti_public_key
   REACT_APP_KHALTI_SECRET_KEY=your_khalti_secret_key
   ```

### 2. eSewa Integration

#### Prerequisites
- Register as a merchant at [eSewa Merchant Portal](https://esewa.com.np/merchant)
- Complete KYC procedures
- Obtain API credentials (Merchant ID, Secret Key)

#### Implementation Steps

1. **Update PaymentContext.tsx**
   ```typescript
   const processEsewaPayment = async (details: PaymentDetails): Promise<PaymentResult> => {
     const form = document.createElement('form');
     form.method = 'POST';
     form.action = 'https://uat.esewa.com.np/epay/main';
     
     const params = {
       amt: details.totalAmount,
       psc: 0,
       pdc: 0,
       txAmt: 0,
       tAmt: details.totalAmount,
       pid: details.eventId,
       scd: process.env.REACT_APP_ESEWA_MERCHANT_ID,
       su: `${window.location.origin}/payment-success`,
       fu: `${window.location.origin}/payment-failure`
     };
     
     // Add form fields
     Object.entries(params).forEach(([key, value]) => {
       const input = document.createElement('input');
       input.type = 'hidden';
       input.name = key;
       input.value = value.toString();
       form.appendChild(input);
     });
     
     document.body.appendChild(form);
     form.submit();
   };
   ```

2. **Environment Variables**
   ```env
   REACT_APP_ESEWA_MERCHANT_ID=your_esewa_merchant_id
   REACT_APP_ESEWA_SECRET_KEY=your_esewa_secret_key
   ```

### 3. Payment Verification

#### Khalti Verification
```typescript
const verifyKhaltiPayment = async (token: string, amount: number) => {
  const response = await fetch('https://khalti.com/api/v2/payment/verify/', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${process.env.REACT_APP_KHALTI_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      amount
    })
  });
  
  return response.json();
};
```

#### eSewa Verification
```typescript
const verifyEsewaPayment = async (data: any) => {
  const { oid, amt, refId } = data;
  
  const response = await fetch('https://uat.esewa.com.np/epay/transrec', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      amt: amt,
      rid: refId,
      pid: oid,
      scd: process.env.REACT_APP_ESEWA_MERCHANT_ID
    })
  });
  
  return response.text();
};
```

### 4. Security Considerations

1. **Environment Variables**: Never commit API keys to version control
2. **HTTPS**: Ensure all payment communications use HTTPS
3. **Server-side Verification**: Implement server-side payment verification
4. **PCI Compliance**: Follow PCI DSS guidelines for handling payment data

### 5. Testing

#### Khalti Test Credentials
- Use test public key: `test_public_key_dc74e0fd57cb46cd93832aee0a390234`
- Test amounts: Use small amounts for testing

#### eSewa Test Environment
- Use UAT environment: `https://uat.esewa.com.np/epay/main`
- Test merchant ID provided during registration

### 6. Production Deployment

1. Replace test credentials with production credentials
2. Update API endpoints to production URLs
3. Implement proper error handling and logging
4. Set up monitoring and alerts for failed transactions
5. Test thoroughly with real payment methods

## Current Mock Implementation

The current implementation simulates payment processing with:
- 90% success rate for Khalti
- 85% success rate for eSewa
- Random transaction IDs
- Realistic error messages

This allows for UI/UX testing without requiring actual payment gateway accounts.

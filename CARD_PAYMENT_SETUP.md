# Card Payment Integration Guide

This guide explains how to integrate real card payment processing into your melaX application.

## Current Implementation

The application now includes a **Credit/Debit Card** payment option alongside Khalti and eSewa. Currently, it uses mock processing for demonstration purposes.

## Payment Options Available

1. **Khalti** - Digital Wallet (Nepal)
2. **eSewa** - Digital Wallet (Nepal) 
3. **Credit/Debit Card** - Global payment method

## Card Payment Features

- ✅ **Multiple Card Types**: Visa, Mastercard, American Express
- ✅ **Secure Processing**: Mock secure transaction handling
- ✅ **Real-time Feedback**: Loading states and success/error messages
- ✅ **Transaction Tracking**: Unique transaction IDs for each payment
- ✅ **High Success Rate**: 95% simulated success rate

## Integration with Real Card Processor

To integrate with a real card payment processor (like Stripe, PayPal, or local banks), you'll need to:

### 1. Choose a Payment Processor

**Popular Options:**
- **Stripe** - Global, supports Nepal
- **PayPal** - Global, widely accepted
- **Local Banks** - Nepal-specific solutions
- **Razorpay** - Popular in South Asia

### 2. Update Configuration

Replace the mock configuration in `src/contexts/PaymentContext.tsx`:

```typescript
const PAYMENT_CONFIG = {
  card: {
    publicKey: 'your_real_public_key',
    secretKey: 'your_real_secret_key',
    baseUrl: 'https://api.your-processor.com/v1'
  }
};
```

### 3. Implement Real Processing

Update the `processCardPayment` function to:

1. **Initialize SDK**: Load the payment processor's SDK
2. **Create Payment Intent**: Set up the payment with amount and currency
3. **Handle Card Details**: Securely collect card information
4. **Process Payment**: Submit to the payment processor
5. **Verify Transaction**: Confirm payment success
6. **Handle Errors**: Manage declined payments and errors

### 4. Security Considerations

- **PCI Compliance**: Ensure card data is handled securely
- **Tokenization**: Never store raw card details
- **HTTPS**: Always use secure connections
- **Validation**: Validate card details before processing

## Testing

### Mock Testing (Current)
- Click "Buy Tickets" on any event
- Select "Credit/Debit Card" payment option
- Payment will be processed with mock success/failure

### Real Testing
- Use test card numbers provided by your payment processor
- Test both successful and failed transactions
- Verify webhook handling for payment confirmations

## Production Deployment

1. **Environment Variables**: Store API keys securely
2. **Webhook Endpoints**: Set up payment confirmation webhooks
3. **Error Handling**: Implement comprehensive error management
4. **Logging**: Add payment transaction logging
5. **Monitoring**: Set up payment success/failure monitoring

## Example Integration (Stripe)

```typescript
// Example Stripe integration
import { loadStripe } from '@stripe/stripe-js';

const processCardPayment = async (details: PaymentDetails) => {
  const stripe = await loadStripe(PAYMENT_CONFIG.card.publicKey);
  
  const { error, paymentMethod } = await stripe.createPaymentMethod({
    type: 'card',
    card: cardElement,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Process payment with your backend
  const response = await fetch('/api/process-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paymentMethodId: paymentMethod.id,
      amount: details.totalAmount,
      currency: 'npr'
    })
  });

  return await response.json();
};
```

## Support

For questions about card payment integration:
- Check your payment processor's documentation
- Review security best practices
- Test thoroughly in sandbox mode before going live

The card payment option is now fully integrated and ready for real-world implementation!

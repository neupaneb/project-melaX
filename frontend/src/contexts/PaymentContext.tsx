import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { Voucher, TicketCategory } from '../data/mockEvents';
import { apiFetch } from '../lib/api';

export interface PaymentDetails {
  eventId: string;
  eventTitle: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  eventCity?: string;
  eventCountry?: string;
  eventImage?: string;
  eventOrganizer?: string;
  eventDescription?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: string;
  originalAmount: number;
  discountAmount: number;
  appliedVoucher?: Voucher;
  appliedVouchers: Voucher[]; // Track all applied vouchers
  ticketCategories?: TicketCategory[]; // Available ticket categories
  selectedCategoryIndex?: number; // Index of selected category
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentGateway: 'khalti' | 'esewa' | 'card';
  amount: number;
  error?: string;
}

export type PaymentGateway = 'khalti' | 'esewa' | 'card';

interface PaymentContextType {
  isPaymentModalOpen: boolean;
  paymentDetails: PaymentDetails | null;
  isLoading: boolean;
  verificationRequired: boolean;
  verificationMessage: string;
  openPaymentModal: (details: PaymentDetails) => void;
  closePaymentModal: () => void;
  updatePaymentDetails: (updates: Partial<PaymentDetails>) => void;
  processPayment: (gateway: PaymentGateway) => Promise<PaymentResult>;
  checkVerificationStatus: () => Promise<boolean>;
  validateVoucher: (code: string, eventId: string, orderAmount: number) => Promise<Voucher | null>;
  applyVoucher: (voucher: Voucher) => void;
  removeVoucher: (voucherId?: string) => void;
  canApplyVoucher: (voucher: Voucher) => boolean;
  selectTicketCategory: (categoryIndex: number) => void;
}

const PaymentContext = createContext(undefined);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

interface PaymentProviderProps {
  children: any;
}

// Mock configuration - In production, these would come from environment variables
const PAYMENT_CONFIG = {
  khalti: {
    publicKey: 'test_public_key_dc74e0fd57cb46cd93832aee0a390234', // Test key
    secretKey: 'test_secret_key_f59e8b7d0b4e4d6a9c0e8f5a3b2c1d0e', // Test key
    baseUrl: 'https://khalti.com/api/v2'
  },
  esewa: {
    merchantId: 'test_merchant_id', // Test merchant ID
    secretKey: 'test_secret_key', // Test secret key
    baseUrl: 'https://uat.esewa.com.np/epay/main'
  },
  card: {
    publicKey: 'pk_test_card_payment_key', // Test public key for card payments
    secretKey: 'sk_test_card_payment_secret', // Test secret key
    baseUrl: 'https://api.stripe.com/v1' // Example: Stripe API
  }
};

export const PaymentProvider = ({ children }: PaymentProviderProps) => {
  const { purchaseEvent, user, isAdmin } = useAuth();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');

  const checkVerificationStatus = async (): Promise<boolean> => {
    if (!user) {
      setVerificationRequired(true);
      setVerificationMessage('Please log in to purchase tickets');
      return false;
    }

    if (!user.isVerified) {
      setVerificationRequired(true);
      setVerificationMessage('Please verify your email address to purchase tickets');
      return false;
    }

    setVerificationRequired(false);
    setVerificationMessage('');
    return true;
  };

  const openPaymentModal = async (details: PaymentDetails) => {
    // Block admin users from purchasing tickets
    if (isAdmin()) {
      toast.error('Admins cannot purchase tickets. This is an admin-only view.');
      return;
    }

    const isVerified = await checkVerificationStatus();
    
    if (!isVerified) {
      // Show verification message but still allow payment modal to open
      toast.warning('Email verification recommended for secure transactions');
    }

    setPaymentDetails({
      ...details,
      originalAmount: details.totalAmount,
      discountAmount: 0,
      appliedVoucher: undefined,
      appliedVouchers: [],
      selectedCategoryIndex: details.selectedCategoryIndex ?? 0 // Default to first category
    });
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentDetails(null);
  };

  const updatePaymentDetails = (updates: Partial<PaymentDetails>) => {
    if (paymentDetails) {
      const updatedDetails = { ...paymentDetails, ...updates };
      // Recalculate total amount if quantity or unit price changed
      if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
        updatedDetails.totalAmount = updatedDetails.quantity * updatedDetails.unitPrice;
      }
      setPaymentDetails(updatedDetails);
    }
  };

  const processPayment = async (gateway: PaymentGateway): Promise<PaymentResult> => {
    if (!paymentDetails) {
      throw new Error('No payment details available');
    }

    setIsLoading(true);

    try {
      // Call the backend API to create tickets
      const response = await apiFetch('/api/payments/purchase-ticket', {
        method: 'POST',
        body: JSON.stringify({
          eventId: paymentDetails.eventId,
          quantity: paymentDetails.quantity,
          paymentMethod: gateway,
          appliedVouchers: paymentDetails.appliedVouchers,
          selectedCategoryIndex: paymentDetails.selectedCategoryIndex ?? 0
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh the user's tickets after successful purchase
        if (purchaseEvent) {
          await purchaseEvent(
            paymentDetails.eventId,
            paymentDetails.eventTitle,
            paymentDetails.quantity,
            paymentDetails.totalAmount,
            data.data.purchase.transactionId
          );
        }

        return {
          success: true,
          transactionId: data.data.purchase.transactionId,
          paymentGateway: gateway,
          amount: paymentDetails.totalAmount
        };
      } else {
        throw new Error(data.message || 'Payment failed');
      }
    } catch (error) {
      return {
        success: false,
        paymentGateway: gateway,
        amount: paymentDetails.totalAmount,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const processKhaltiPayment = async (details: PaymentDetails): Promise<PaymentResult> => {
    // In a real implementation, this would:
    // 1. Initialize Khalti SDK
    // 2. Create payment intent
    // 3. Handle payment confirmation
    // 4. Verify transaction with Khalti API

    // Mock implementation
    const mockTransactionId = `khalti_${Date.now()}`;
    
    // Simulate 90% success rate
    const isSuccess = Math.random() > 0.1;
    
      if (isSuccess) {
        // Complete the purchase in AuthContext
        await purchaseEvent(
          paymentDetails.eventId,
          paymentDetails.quantity,
          paymentDetails.totalAmount,
          mockTransactionId,
          'khalti'
        );

        return {
          success: true,
          transactionId: mockTransactionId,
          paymentGateway: 'khalti',
          amount: details.totalAmount
        };
      } else {
      return {
        success: false,
        paymentGateway: 'khalti',
        amount: details.totalAmount,
        error: 'Payment was declined by Khalti'
      };
    }
  };

  const processEsewaPayment = async (details: PaymentDetails): Promise<PaymentResult> => {
    // In a real implementation, this would:
    // 1. Create payment form with eSewa parameters
    // 2. Redirect to eSewa payment page
    // 3. Handle callback from eSewa
    // 4. Verify transaction with eSewa API

    // Mock implementation
    const mockTransactionId = `esewa_${Date.now()}`;
    
    // Simulate 85% success rate
    const isSuccess = Math.random() > 0.15;
    
      if (isSuccess) {
        // Complete the purchase in AuthContext
        await purchaseEvent(
          paymentDetails.eventId,
          paymentDetails.quantity,
          paymentDetails.totalAmount,
          mockTransactionId,
          'khalti'
        );

        return {
          success: true,
          transactionId: mockTransactionId,
          paymentGateway: 'esewa',
          amount: details.totalAmount
        };
      } else {
      return {
        success: false,
        paymentGateway: 'esewa',
        amount: details.totalAmount,
        error: 'Payment was declined by eSewa'
      };
    }
  };

  const processCardPayment = async (details: PaymentDetails): Promise<PaymentResult> => {
    // In a real implementation, this would:
    // 1. Initialize Stripe/PayPal SDK
    // 2. Create payment intent
    // 3. Handle card details securely
    // 4. Process payment with card processor
    // 5. Verify transaction

    // Mock implementation
    const mockTransactionId = `card_${Date.now()}`;
    
    // Simulate 95% success rate for card payments
    const isSuccess = Math.random() > 0.05;
    
    if (isSuccess) {
      // Complete the purchase in AuthContext
      await purchaseEvent(
        paymentDetails.eventId,
        paymentDetails.quantity,
        paymentDetails.totalAmount,
        mockTransactionId,
        'card'
      );

      return {
        success: true,
        transactionId: mockTransactionId,
        paymentGateway: 'card',
        amount: details.totalAmount
      };
    } else {
      return {
        success: false,
        paymentGateway: 'card',
        amount: details.totalAmount,
        error: 'Card payment was declined by the bank'
      };
    }
  };

  const validateVoucher = async (code: string, eventId: string, orderAmount: number): Promise<Voucher | null> => {
    try {
      console.log('Validating voucher:', { code, eventId, orderAmount, userId: user?.id });
      
      const response = await apiFetch('/api/vouchers/validate', {
        method: 'POST',
        body: JSON.stringify({
          code,
          eventId,
          orderAmount,
          userId: user?.id // Pass user ID for user-specific validation
        })
      });

      console.log('Voucher validation response status:', response.status);
      
      if (!response.ok) {
        console.error('Voucher validation failed:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      console.log('Voucher validation response:', data);
      
      if (data.success && data.data.voucher) {
        return data.data.voucher;
      }
      
      return null;
    } catch (error) {
      console.error('Validate voucher error:', error);
      return null;
    }
  };

  const applyVoucher = (voucher: Voucher) => {
    if (!paymentDetails) return;

    // Check if voucher can be applied
    if (!canApplyVoucher(voucher)) {
      if (paymentDetails.appliedVouchers.some(v => v.id === voucher.id)) {
        toast.error('This voucher has already been applied');
      } else if (paymentDetails.appliedVouchers.length > 0) {
        toast.error('Only one voucher can be applied per order');
      }
      return;
    }

    const discountAmount = (paymentDetails.originalAmount * voucher.discountPercentage) / 100;
    const finalAmount = paymentDetails.originalAmount - discountAmount;

    updatePaymentDetails({
      appliedVoucher: voucher,
      appliedVouchers: [voucher], // Only one voucher allowed
      discountAmount: discountAmount,
      totalAmount: finalAmount
    });

    toast.success(`Voucher "${voucher.code}" applied! ${voucher.discountPercentage}% discount`);
  };

  const canApplyVoucher = (voucher: Voucher): boolean => {
    if (!paymentDetails) return false;
    
    // Check if voucher is already applied
    const isAlreadyApplied = paymentDetails.appliedVouchers.some(
      appliedVoucher => appliedVoucher.id === voucher.id
    );
    
    if (isAlreadyApplied) {
      return false;
    }
    
    // Allow only one voucher per order
    if (paymentDetails.appliedVouchers.length > 0) {
      return false;
    }
    
    return true;
  };

  const removeVoucher = (voucherId?: string) => {
    if (!paymentDetails) return;

    let updatedVouchers = paymentDetails.appliedVouchers;
    let totalDiscount = 0;
    let finalAmount = paymentDetails.originalAmount;

    if (voucherId) {
      // Remove specific voucher
      updatedVouchers = paymentDetails.appliedVouchers.filter(
        voucher => voucher.id !== voucherId
      );
      
      // Recalculate total discount
      updatedVouchers.forEach(voucher => {
        const discount = (paymentDetails.originalAmount * voucher.discountPercentage) / 100;
        totalDiscount += discount;
      });
      
      finalAmount = paymentDetails.originalAmount - totalDiscount;
    } else {
      // Remove all vouchers (backward compatibility)
      updatedVouchers = [];
      totalDiscount = 0;
      finalAmount = paymentDetails.originalAmount;
    }

    updatePaymentDetails({
      appliedVoucher: updatedVouchers.length > 0 ? updatedVouchers[0] : undefined,
      appliedVouchers: updatedVouchers,
      discountAmount: totalDiscount,
      totalAmount: finalAmount
    });

    toast.success(voucherId ? 'Voucher removed' : 'All vouchers removed');
  };

  const selectTicketCategory = (categoryIndex: number) => {
    if (!paymentDetails?.ticketCategories || categoryIndex < 0 || categoryIndex >= paymentDetails.ticketCategories.length) {
      return;
    }

    const selectedCategory = paymentDetails.ticketCategories[categoryIndex];
    const newUnitPrice = selectedCategory.price;
    const newTotalAmount = newUnitPrice * paymentDetails.quantity;
    
    updatePaymentDetails({
      selectedCategoryIndex: categoryIndex,
      unitPrice: newUnitPrice,
      totalAmount: newTotalAmount,
      originalAmount: newTotalAmount,
      currency: selectedCategory.currency,
      discountAmount: 0, // Reset discount when changing category
      appliedVoucher: undefined,
      appliedVouchers: [] // Reset vouchers when changing category
    });
  };


  const value: PaymentContextType = {
    isPaymentModalOpen,
    paymentDetails,
    isLoading,
    verificationRequired,
    verificationMessage,
    openPaymentModal,
    closePaymentModal,
    updatePaymentDetails,
    processPayment,
    checkVerificationStatus,
    validateVoucher,
    applyVoucher,
    removeVoucher,
    canApplyVoucher,
    selectTicketCategory
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CreditCard, Smartphone, Shield, CheckCircle, XCircle, Banknote, Tag, Percent, X } from 'lucide-react';
import { usePayment, PaymentGateway } from '../contexts/PaymentContext';
import { QuantitySelector } from './QuantitySelector';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Voucher } from '../data/mockEvents';

export const PaymentModal: React.FC = () => {
  const { isPaymentModalOpen, paymentDetails, isLoading, closePaymentModal, processPayment, updatePaymentDetails, validateVoucher, applyVoucher, removeVoucher, canApplyVoucher, selectTicketCategory } = usePayment();
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [paymentResult, setPaymentResult] = useState<{ success: boolean; message: string } | null>(null);
  const [quantity, setQuantity] = useState(paymentDetails?.quantity || 1);
  const [voucherCode, setVoucherCode] = useState('');
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState('');

  // Update quantity when paymentDetails change
  useEffect(() => {
    if (paymentDetails) {
      setQuantity(paymentDetails.quantity);
    }
  }, [paymentDetails]);


  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    const newTotalAmount = paymentDetails!.originalAmount * newQuantity;
    updatePaymentDetails({ 
      quantity: newQuantity,
      totalAmount: newTotalAmount - (paymentDetails!.discountAmount || 0)
    });
  };

  const handleVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim() || !paymentDetails) return;

    setIsValidatingVoucher(true);
    setVoucherError('');

    try {
      const voucher = await validateVoucher(voucherCode, paymentDetails.eventId, paymentDetails.totalAmount);
      
      if (voucher) {
        // Check if voucher can be applied before applying
        if (canApplyVoucher(voucher)) {
          applyVoucher(voucher);
          setVoucherCode('');
        } else {
          if (paymentDetails.appliedVouchers.some(v => v.id === voucher.id)) {
            setVoucherError('This voucher has already been applied');
          } else if (paymentDetails.appliedVouchers.length > 0) {
            setVoucherError('Only one voucher can be applied per order');
          }
        }
      } else {
        setVoucherError('Invalid or expired voucher code');
      }
    } catch (error) {
      setVoucherError('Error validating voucher code');
    } finally {
      setIsValidatingVoucher(false);
    }
  };


  const handleRemoveVoucher = () => {
    removeVoucher();
    setVoucherError('');
  };

  if (!paymentDetails) return null;

  const handlePayment = async (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
    setPaymentResult(null);

    try {
      const result = await processPayment(gateway);
      
      if (result.success) {
        setPaymentResult({
          success: true,
          message: `Payment successful! Transaction ID: ${result.transactionId}`
        });
        toast.success('Payment completed successfully!');
        
        // Close modal after 3 seconds
        setTimeout(() => {
          closePaymentModal();
          setPaymentResult(null);
          setSelectedGateway(null);
        }, 3000);
      } else {
        setPaymentResult({
          success: false,
          message: result.error || 'Payment failed'
        });
        toast.error('Payment failed. Please try again.');
      }
    } catch (error) {
      setPaymentResult({
        success: false,
        message: 'An error occurred during payment'
      });
      toast.error('Payment failed. Please try again.');
    } finally {
      setSelectedGateway(null);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      closePaymentModal();
      setPaymentResult(null);
      setSelectedGateway(null);
    }
  };

  const formatPrice = (amount: number | undefined) => {
    const currency = paymentDetails?.currency || 'USD';
    const safeAmount = amount || 0;
    return `${currency} ${safeAmount.toLocaleString()}`;
  };

  // Don't render if no payment details
  if (!paymentDetails) {
    return null;
  }

  return (
    <Dialog open={isPaymentModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Complete Your Purchase
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Select your payment method and complete your ticket purchase
          </DialogDescription>
        </DialogHeader>

        {/* Event Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-lg mb-3">{paymentDetails.eventTitle}</h3>
          
          {/* Ticket Category Selection */}
          {paymentDetails.ticketCategories && paymentDetails.ticketCategories.length > 1 && (
            <div className="mb-4">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Select Ticket Category:</Label>
              <div className="space-y-2">
                {paymentDetails.ticketCategories.map((category, index) => (
                  <div
                    key={index}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      paymentDetails.selectedCategoryIndex === index
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                    }`}
                    onClick={() => selectTicketCategory(index)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{category.name}</h4>
                        {category.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {category.available} tickets available
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {category.currency} {category.price}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Quantity Selector */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Number of Tickets:</span>
            <QuantitySelector
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
              min={1}
              max={10}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Voucher Code Section */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Promo Code</h3>
          
          {paymentDetails.appliedVouchers.length > 0 ? (
            <div className="space-y-3">
              {paymentDetails.appliedVouchers.map((voucher) => (
                <div key={voucher.id} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span className="text-green-800 dark:text-green-200 font-medium">
                        {voucher.code}
                      </span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        {voucher.discountPercentage}% OFF
                      </Badge>
                      {voucher.maxUsesPerUser > 1 && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {voucher.userUsageCount || 0}/{voucher.maxUsesPerUser} uses
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeVoucher(voucher.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {voucher.description && (
                    <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                      {voucher.description}
                    </p>
                  )}
                </div>
              ))}
              <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-2">
                💡 Only one voucher can be applied per order
              </div>
            </div>
          ) : (
            <form onSubmit={handleVoucherSubmit} className="space-y-3">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="voucherCode" className="sr-only">Promo Code</Label>
                  <Input
                    id="voucherCode"
                    placeholder="Enter promo code"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    className="uppercase"
                  />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  disabled={!voucherCode.trim() || isValidatingVoucher}
                  className="flex items-center space-x-2"
                >
                  {isValidatingVoucher ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Tag className="w-4 h-4" />
                  )}
                  <span>Apply</span>
                </Button>
              </div>
              {voucherError && (
                <p className="text-sm text-red-600 dark:text-red-400">{voucherError}</p>
              )}
            </form>
          )}
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Unit Price:</span>
              <span>{formatPrice(paymentDetails.unitPrice)}</span>
            </div>
                   {paymentDetails.discountAmount > 0 && (
                     <div className="flex justify-between text-green-600">
                       <span>Discount ({paymentDetails.appliedVouchers[0]?.discountPercentage}%):</span>
                       <span>-{formatPrice(paymentDetails.discountAmount)}</span>
                     </div>
                   )}
            <div className="flex justify-between font-semibold text-base border-t pt-2">
              <span>Total Amount:</span>
              <span className="text-red-600">{formatPrice(paymentDetails.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Payment Result */}
        {paymentResult && (
          <Alert className={`mb-4 ${paymentResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center">
              {paymentResult.success ? (
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600 mr-2" />
              )}
              <AlertDescription className={paymentResult.success ? 'text-green-800' : 'text-red-800'}>
                {paymentResult.message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Payment Gateway Selection */}
        {!paymentResult && (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Choose Payment Method</h4>
            
            {/* Khalti */}
            <Card 
              className={`cursor-pointer transition-all ${
                selectedGateway === 'khalti' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
              }`}
              onClick={() => !isLoading && handlePayment('khalti')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h5 className="font-semibold">Khalti</h5>
                      <p className="text-sm text-gray-600">Digital Wallet</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">Popular</Badge>
                    {isLoading && selectedGateway === 'khalti' && (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm text-gray-600">
                  <Shield className="w-4 h-4 mr-1" />
                  <span>Secure & Fast</span>
                </div>
              </CardContent>
            </Card>

            {/* eSewa */}
            <Card 
              className={`cursor-pointer transition-all ${
                selectedGateway === 'esewa' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-md'
              }`}
              onClick={() => !isLoading && handlePayment('esewa')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h5 className="font-semibold">eSewa</h5>
                      <p className="text-sm text-gray-600">Digital Wallet</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">Trusted</Badge>
                    {isLoading && selectedGateway === 'esewa' && (
                      <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm text-gray-600">
                  <Shield className="w-4 h-4 mr-1" />
                  <span>Secure & Reliable</span>
                </div>
              </CardContent>
            </Card>

            {/* Credit/Debit Card */}
            <Card 
              className={`cursor-pointer transition-all ${
                selectedGateway === 'card' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
              }`}
              onClick={() => !isLoading && handlePayment('card')}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Banknote className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h5 className="font-semibold">Credit/Debit Card</h5>
                      <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">Global</Badge>
                    {isLoading && selectedGateway === 'card' && (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm text-gray-600">
                  <Shield className="w-4 h-4 mr-1" />
                  <span>Secure & Encrypted</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-600">
              Processing payment with {selectedGateway === 'khalti' ? 'Khalti' : selectedGateway === 'esewa' ? 'eSewa' : 'Card'}...
            </p>
          </div>
        )}

        {/* Security Notice */}
        <div className="text-center text-xs text-gray-500 mt-4">
          <p>🔒 Your payment information is secure and encrypted</p>
          <p>All transactions are processed through trusted payment gateways</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

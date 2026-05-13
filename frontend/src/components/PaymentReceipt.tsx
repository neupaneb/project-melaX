import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { 
  Receipt, 
  Calendar, 
  MapPin, 
  Clock, 
  CreditCard, 
  Download, 
  Share2,
  CheckCircle,
  QrCode
} from 'lucide-react';
import { generateReceiptPDF } from '../utils/pdfGenerator';

export interface PaymentReceiptData {
  receiptId: string;
  transactionId: string;
  purchaseDate: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  originalAmount?: number;
  discountAmount?: number;
  currency: string;
  paymentMethod: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  tickets: Array<{
    ticketId: string;
    seatNumber: string;
    qrCode: string;
  }>;
  appliedVouchers?: Array<{
    code: string;
    discountPercentage: number;
    discountAmount: number;
  }>;
  user: {
    name: string;
    email: string;
  };
}

interface PaymentReceiptProps {
  receipt: PaymentReceiptData;
  onDownload?: () => void;
  onShare?: () => void;
  showEventDetails?: boolean; // New prop to control event details display
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ 
  receipt, 
  onDownload, 
  onShare,
  showEventDetails = true
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Receipt className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Payment Receipt
              </CardTitle>
              <p className="text-sm text-gray-600">
                Receipt #{receipt.receiptId}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(receipt.status)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(receipt.status)}
              {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
            </div>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Event Details - Only show if showEventDetails is true */}
        {showEventDetails && (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Event Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Event</p>
                  <p className="text-lg font-semibold text-gray-900">{receipt.eventTitle}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(receipt.eventDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatTime(receipt.eventTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Venue</p>
                  <p className="text-lg font-semibold text-gray-900 flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    {receipt.venue}
                  </p>
                </div>
              </div>
            </div>

            <Separator />
          </>
        )}

        {/* Payment Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Payment Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Transaction ID</p>
              <p className="text-sm font-mono text-gray-900">{receipt.transactionId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Payment Method</p>
              <p className="text-sm font-semibold text-gray-900 capitalize">
                {receipt.paymentMethod.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Purchase Date</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(receipt.purchaseDate)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Quantity</p>
              <p className="text-sm font-semibold text-gray-900">{receipt.quantity} ticket(s)</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Voucher/Promo Code Details */}
        {receipt.appliedVouchers && receipt.appliedVouchers.length > 0 && (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="p-1 bg-green-100 rounded-lg">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                Applied Vouchers
              </h3>
              
              <div className="space-y-3">
                {receipt.appliedVouchers.map((voucher, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Code: {voucher.code}</p>
                        <p className="text-sm text-gray-600">{voucher.discountPercentage}% discount applied</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">
                        -{receipt.currency} {voucher.discountAmount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />
          </>
        )}

        {/* Ticket Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-600" />
            Your Tickets
          </h3>
          
          <div className="space-y-3">
            {receipt.tickets.map((ticket, index) => (
              <div key={ticket.ticketId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <QrCode className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Ticket #{index + 1}</p>
                    <p className="text-sm text-gray-600">Seat: {ticket.seatNumber}</p>
                    <p className="text-xs text-gray-500 font-mono">{ticket.ticketId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {receipt.currency} {receipt.unitPrice}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Price Breakdown</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Ticket Price × {receipt.quantity}</span>
              <span className="font-semibold">
                {receipt.currency} {receipt.originalAmount || (receipt.unitPrice * receipt.quantity)}
              </span>
            </div>
            
            {/* Show discount if applied */}
            {receipt.discountAmount && receipt.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount Applied</span>
                <span className="font-semibold">
                  -{receipt.currency} {receipt.discountAmount}
                </span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600">Service Fee</span>
              <span className="font-semibold">{receipt.currency} 0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="font-semibold">{receipt.currency} 0</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-blue-600">
                {receipt.currency} {receipt.totalAmount}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Customer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-sm font-semibold text-gray-900">{receipt.user.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-sm font-semibold text-gray-900">{receipt.user.email}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            onClick={() => {
              generateReceiptPDF(receipt);
              if (onDownload) onDownload();
            }}
            className="flex-1"
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button 
            onClick={onShare}
            className="flex-1"
            variant="outline"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Receipt
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pt-4 border-t">
          <p>Thank you for choosing melaX!</p>
          <p>Keep this receipt for your records.</p>
          <p>For support, contact us at support@melax.com</p>
        </div>
      </CardContent>
    </Card>
  );
};

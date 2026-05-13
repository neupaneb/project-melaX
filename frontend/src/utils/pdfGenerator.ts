import { PaymentReceiptData } from '../components/PaymentReceipt';

export const generateReceiptPDF = (receipt: PaymentReceiptData): void => {
  // Create a new window for PDF generation
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow popups to download the receipt');
    return;
  }

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
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Receipt - ${receipt.eventTitle}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
          color: #333;
        }
        .receipt-container {
          max-width: 600px;
          margin: 0 auto;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
        }
        .header p {
          margin: 5px 0 0 0;
          opacity: 0.9;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          background: ${getStatusColor(receipt.status)};
          color: white;
        }
        .content {
          padding: 20px;
        }
        .section {
          margin-bottom: 20px;
        }
        .section h3 {
          color: #3b82f6;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .info-item {
          margin-bottom: 10px;
        }
        .info-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 2px;
        }
        .info-value {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }
        .ticket-item {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 10px;
        }
        .ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .ticket-id {
          font-weight: bold;
          color: #111827;
        }
        .ticket-price {
          font-weight: bold;
          color: #3b82f6;
        }
        .ticket-details {
          font-size: 12px;
          color: #6b7280;
        }
        .price-breakdown {
          background: #f9fafb;
          border-radius: 6px;
          padding: 15px;
        }
        .price-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .price-row.total {
          border-top: 2px solid #e5e7eb;
          padding-top: 10px;
          margin-top: 10px;
          font-weight: bold;
          font-size: 16px;
          color: #3b82f6;
        }
        .footer {
          background: #f9fafb;
          padding: 15px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
        }
        @media print {
          body { margin: 0; }
          .receipt-container { border: none; }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <h1>Payment Receipt</h1>
          <p>Receipt #${receipt.receiptId}</p>
          <div class="status-badge">${receipt.status}</div>
        </div>
        
        <div class="content">
          <div class="section">
            <h3>Event Details</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Event</div>
                <div class="info-value">${receipt.eventTitle}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Date</div>
                <div class="info-value">${formatDate(receipt.eventDate)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Time</div>
                <div class="info-value">${formatTime(receipt.eventTime)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Venue</div>
                <div class="info-value">${receipt.venue}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Payment Details</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Transaction ID</div>
                <div class="info-value">${receipt.transactionId}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Payment Method</div>
                <div class="info-value">${receipt.paymentMethod.replace('_', ' ').toUpperCase()}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Purchase Date</div>
                <div class="info-value">${formatDate(receipt.purchaseDate)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Quantity</div>
                <div class="info-value">${receipt.quantity} ticket(s)</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Your Tickets</h3>
            ${receipt.tickets.map((ticket, index) => `
              <div class="ticket-item">
                <div class="ticket-header">
                  <div class="ticket-id">Ticket #${index + 1}</div>
                  <div class="ticket-price">${receipt.currency} ${receipt.unitPrice}</div>
                </div>
                <div class="ticket-details">
                  <div>Seat: ${ticket.seatNumber}</div>
                  <div>Ticket ID: ${ticket.ticketId}</div>
                  <div>QR Code: ${ticket.qrCode}</div>
                </div>
              </div>
            `).join('')}
          </div>

          ${receipt.appliedVouchers && receipt.appliedVouchers.length > 0 ? `
          <div class="section">
            <h3>Applied Vouchers</h3>
            <div class="space-y-3">
              ${receipt.appliedVouchers.map(voucher => `
                <div class="ticket-item">
                  <div class="ticket-header">
                    <div class="ticket-id">Code: ${voucher.code}</div>
                    <div class="ticket-price" style="color: #10b981;">-${receipt.currency} ${voucher.discountAmount}</div>
                  </div>
                  <div class="ticket-details">
                    <div>${voucher.discountPercentage}% discount applied</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <div class="section">
            <h3>Price Breakdown</h3>
            <div class="price-breakdown">
              <div class="price-row">
                <span>Ticket Price × ${receipt.quantity}</span>
                <span>${receipt.currency} ${receipt.originalAmount || (receipt.unitPrice * receipt.quantity)}</span>
              </div>
              ${receipt.discountAmount && receipt.discountAmount > 0 ? `
              <div class="price-row" style="color: #10b981;">
                <span>Discount Applied</span>
                <span>-${receipt.currency} ${receipt.discountAmount}</span>
              </div>
              ` : ''}
              <div class="price-row">
                <span>Service Fee</span>
                <span>${receipt.currency} 0</span>
              </div>
              <div class="price-row">
                <span>Tax</span>
                <span>${receipt.currency} 0</span>
              </div>
              <div class="price-row total">
                <span>Total</span>
                <span>${receipt.currency} ${receipt.totalAmount}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Customer Details</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Name</div>
                <div class="info-value">${receipt.user.name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${receipt.user.email}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for choosing melaX!</p>
          <p>Keep this receipt for your records.</p>
          <p>For support, contact us at support@melax.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
};

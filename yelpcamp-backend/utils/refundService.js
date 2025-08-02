class RefundService {
    /**
     * Process a simulated refund for an order or booking
     * @param {Object} item - Order or Booking object
     * @param {string} reason - Reason for refund
     * @param {number} amount - Optional partial refund amount
     */
    static async processRefund(item, reason = 'Cancelled by user', amount = null) {
        try {
            // For simulation, we don't need actual payment validation
            // Just simulate a successful payment scenario
            if (!item.payment) {
                // Create simulated payment data if it doesn't exist
                item.payment = {
                    method: 'simulated',
                    transactionId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    paymentIntentId: `pi_sim_${Date.now()}`,
                    paid: true,
                    paidAt: item.createdAt || new Date()
                };
            }

            // Calculate refund amount based on policy
            const refundAmount = amount || this.calculateRefundAmount(item);
            
            // Simulate processing delay (real-world refunds take time)
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Generate simulated refund ID
            const refundId = `re_sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Update item with refund information
            item.refund = {
                status: 'processed',
                amount: refundAmount,
                refundId: refundId,
                reason: reason,
                processedAt: new Date()
            };

            await item.save();

            return {
                success: true,
                refund: {
                    id: refundId,
                    amount: refundAmount,
                    currency: 'USD',
                    status: 'processed',
                    processedAt: new Date()
                }
            };

        } catch (error) {
            console.error('Simulated refund processing error:', error);

            // Update item with failed refund status
            item.refund = {
                status: 'failed',
                amount: 0,
                reason: reason,
                failureReason: error.message,
                processedAt: new Date()
            };

            await item.save();

            return {
                success: false,
                error: error.message,
                refund: {
                    status: 'failed',
                    failureReason: error.message
                }
            };
        }
    }

    /**
     * Calculate refund amount based on cancellation policy
     * @param {Object} item - Order or Booking object
     * @param {Date} cancellationDate - When the cancellation is happening
     */
    static calculateRefundAmount(item, cancellationDate = new Date()) {
        const totalAmount = item.totalAmount || item.totalPrice;
        const createdAt = new Date(item.createdAt);
        const hoursElapsed = Math.abs(cancellationDate - createdAt) / 36e5; // Convert to hours

        // Different refund policies for orders vs bookings
        if (item.totalAmount) {
            // ORDER REFUND POLICY
            if (item.status === 'pending') {
                return totalAmount; // 100% refund for pending orders
            } else if (item.status === 'processing' && hoursElapsed < 24) {
                return totalAmount * 0.9; // 90% refund within 24 hours
            } else if (item.status === 'processing' && hoursElapsed < 72) {
                return totalAmount * 0.5; // 50% refund within 72 hours
            } else {
                return 0; // No refund after processing > 72 hours
            }
        } else {
            // BOOKING REFUND POLICY
            if (hoursElapsed < 24) {
                return totalAmount; // 100% refund within 24 hours
            } else if (hoursElapsed < 168) { // 7 days
                return totalAmount * 0.8; // 80% refund within 7 days
            } else if (hoursElapsed < 720) { // 30 days
                return totalAmount * 0.5; // 50% refund within 30 days
            } else {
                return 0; // No refund after 30 days
            }
        }
    }

    /**
     * Get refund policy information for display
     * @param {string} type - 'order' or 'booking'
     */
    static getRefundPolicy(type) {
        if (type === 'order') {
            return {
                type: 'order',
                policy: [
                    { condition: 'Pending orders', refund: '100%' },
                    { condition: 'Processing (within 24 hours)', refund: '90%' },
                    { condition: 'Processing (24-72 hours)', refund: '50%' },
                    { condition: 'Processing (over 72 hours)', refund: '0%' },
                    { condition: 'Shipped or Delivered', refund: '0%' }
                ]
            };
        } else {
            return {
                type: 'booking',
                policy: [
                    { condition: 'Within 24 hours', refund: '100%' },
                    { condition: 'Within 7 days', refund: '80%' },
                    { condition: 'Within 30 days', refund: '50%' },
                    { condition: 'Over 30 days', refund: '0%' }
                ]
            };
        }
    }

    /**
     * Check if refund is allowed for an item
     * @param {Object} item - Order or Booking object
     */
    static isRefundAllowed(item) {
        // Already refunded
        if (item.refund && item.refund.status === 'processed') {
            return false;
        }

        // No payment made
        if (!item.payment || !item.payment.paid) {
            return false;
        }

        // Calculate potential refund amount
        const refundAmount = this.calculateRefundAmount(item);
        return refundAmount > 0;
    }
}

module.exports = RefundService;
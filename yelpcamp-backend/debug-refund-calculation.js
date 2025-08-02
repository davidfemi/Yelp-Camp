const RefundService = require('./utils/refundService');

// Test RefundService directly with mock order data
console.log('🔍 Debug RefundService Calculation\n');

// Mock order that matches our test case
const mockOrder = {
    _id: 'test123',
    totalAmount: 29.98,
    status: 'pending',
    createdAt: new Date(),
    payment: {
        method: 'simulated',
        transactionId: 'sim_test',
        paid: true,
        paidAt: new Date()
    },
    refund: {
        status: 'none',
        amount: 0
    }
};

console.log('📦 Mock Order:');
console.log('  Total Amount:', mockOrder.totalAmount);
console.log('  Status:', mockOrder.status);
console.log('  Created:', mockOrder.createdAt);
console.log('  Payment Paid:', mockOrder.payment.paid);
console.log('  Refund Status:', mockOrder.refund.status);

console.log('\n🧮 Refund Calculation Tests:');

// Test calculateRefundAmount
const refundAmount = RefundService.calculateRefundAmount(mockOrder);
console.log('  Calculated Refund Amount:', refundAmount);

// Test isRefundAllowed
const isAllowed = RefundService.isRefundAllowed(mockOrder);
console.log('  Is Refund Allowed:', isAllowed);

// Test with different statuses
console.log('\n📋 Testing Different Order Statuses:');

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
statuses.forEach(status => {
    const testOrder = { ...mockOrder, status };
    const amount = RefundService.calculateRefundAmount(testOrder);
    const allowed = RefundService.isRefundAllowed(testOrder);
    console.log(`  ${status}: $${amount} (allowed: ${allowed})`);
});

console.log('\n🏕️ Testing Booking (no totalAmount):');
const mockBooking = {
    _id: 'booking123',
    totalPrice: 135,
    status: 'confirmed',
    createdAt: new Date(),
    payment: {
        method: 'simulated',
        transactionId: 'sim_booking',
        paid: true,
        paidAt: new Date()
    },
    refund: {
        status: 'none',
        amount: 0
    }
};

const bookingRefund = RefundService.calculateRefundAmount(mockBooking);
const bookingAllowed = RefundService.isRefundAllowed(mockBooking);
console.log('  Booking Refund Amount:', bookingRefund);
console.log('  Booking Refund Allowed:', bookingAllowed);

console.log('\n🔄 Testing processRefund method:');
try {
    // Test the actual processRefund method
    console.log('  Testing processRefund with pending order...');
    RefundService.processRefund(mockOrder, 'Test refund').then(result => {
        console.log('  Process Refund Result:', result);
        console.log('  Updated Order Refund:', mockOrder.refund);
    }).catch(error => {
        console.log('  Process Refund Error:', error.message);
    });
} catch (error) {
    console.log('  Process Refund Error (sync):', error.message);
}
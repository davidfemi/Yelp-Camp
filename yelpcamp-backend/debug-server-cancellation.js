const RefundService = require('./utils/refundService');

// Test what happens when we cancel an order directly
console.log('🔍 Debug Server Cancellation Logic\n');

// Create a mock order that matches what we see in the test
const mockOrder = {
    _id: 'test123',
    totalAmount: 29.98,
    status: 'pending',  // Fresh order status
    createdAt: new Date(),
    payment: {
        method: 'simulated',
        transactionId: 'sim_1754092368262_7s949qhcd',
        paymentIntentId: 'pi_sim_1754092368262',
        paid: true,
        paidAt: new Date()
    },
    refund: {
        status: 'none',
        amount: 0
    },
    save: async function() {
        console.log('  📝 Mock save() called');
        return this;
    }
};

async function testCancellationLogic() {
    console.log('📦 Mock Order Before Cancellation:');
    console.log('  Status:', mockOrder.status);
    console.log('  Total Amount:', mockOrder.totalAmount);
    console.log('  Payment Paid:', mockOrder.payment?.paid);
    console.log('  Refund Status:', mockOrder.refund?.status);
    
    // Step 1: Update order status to cancelled (like server does)
    console.log('\n📋 Step 1: Update status to cancelled');
    mockOrder.status = 'cancelled';
    console.log('  New Status:', mockOrder.status);
    
    // Step 2: Check if refund is allowed
    console.log('\n📋 Step 2: Check if refund is allowed');
    const isAllowed = RefundService.isRefundAllowed(mockOrder);
    console.log('  Is Refund Allowed:', isAllowed);
    
    if (isAllowed) {
        console.log('\n📋 Step 3: Calculate refund amount');
        const refundAmount = RefundService.calculateRefundAmount(mockOrder);
        console.log('  Calculated Amount:', refundAmount);
        
        console.log('\n📋 Step 4: Process refund');
        try {
            const refundResult = await RefundService.processRefund(mockOrder, 'Order cancelled by user');
            console.log('  Refund Result:', refundResult);
            console.log('  Updated Order Refund:', mockOrder.refund);
        } catch (error) {
            console.log('  ❌ Refund Error:', error.message);
            console.log('  Error Stack:', error.stack);
        }
    } else {
        console.log('\n❌ Refund not allowed - checking why...');
        
        // Debug why refund isn't allowed
        console.log('  Already refunded?', mockOrder.refund?.status === 'processed');
        console.log('  Payment exists?', !!mockOrder.payment);
        console.log('  Payment paid?', mockOrder.payment?.paid);
        
        const calcAmount = RefundService.calculateRefundAmount(mockOrder);
        console.log('  Calculated amount:', calcAmount);
        console.log('  Amount > 0?', calcAmount > 0);
    }
}

testCancellationLogic();
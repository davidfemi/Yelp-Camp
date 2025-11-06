const { getIntercomMCPClient } = require('../services/intercomMCPClient');

/**
 * Sync booking data to Intercom via MCP client
 * Called automatically when bookings are created/updated
 */
exports.syncBookingToIntercom = async (booking, user) => {
  try {
    const intercomClient = getIntercomMCPClient();
    
    if (!intercomClient.isConnected()) {
      console.log('📊 Intercom MCP not connected, using REST API fallback');
      
      // Use REST API directly as fallback
      await intercomClient.trackEventViaAPI(
        user._id.toString(),
        'booking_created',
        {
          booking_id: booking._id.toString(),
          campground_id: booking.campground._id?.toString() || booking.campground,
          campground_name: booking.campground.title,
          campground_location: booking.campground.location,
          total_price: booking.totalPrice,
          days: booking.days,
          status: booking.status,
          created_at: booking.createdAt
        }
      );
      
      console.log('✅ Booking synced to Intercom via REST API');
      return;
    }
    
    // Use MCP if available
    await intercomClient.trackEvent(
      user._id.toString(),
      'booking_created',
      {
        booking_id: booking._id.toString(),
        campground_name: booking.campground.title,
        total_price: booking.totalPrice,
        days: booking.days
      }
    );
    
    console.log('✅ Booking synced to Intercom via MCP');
  } catch (error) {
    console.error('❌ Failed to sync booking to Intercom:', error.message);
    // Don't throw - we don't want to fail the booking if Intercom sync fails
  }
};

/**
 * Sync order data to Intercom
 */
exports.syncOrderToIntercom = async (order, user) => {
  try {
    const intercomClient = getIntercomMCPClient();
    
    await intercomClient.trackEventViaAPI(
      user._id.toString(),
      'order_created',
      {
        order_id: order._id.toString(),
        total_amount: order.totalAmount,
        item_count: order.items?.length || 0,
        status: order.status,
        created_at: order.createdAt
      }
    );
    
    console.log('✅ Order synced to Intercom');
  } catch (error) {
    console.error('❌ Failed to sync order to Intercom:', error.message);
  }
};

/**
 * Update user profile in Intercom with latest stats
 */
exports.updateIntercomUserProfile = async (user, bookings, orders) => {
  try {
    const intercomClient = getIntercomMCPClient();
    
    const totalBookingValue = bookings?.reduce((sum, b) => sum + (b.totalPrice || 0), 0) || 0;
    const totalOrderValue = orders?.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 0;
    
    await intercomClient.updateUserViaAPI({
      user_id: user._id.toString(),
      email: user.email,
      name: user.username,
      created_at: Math.floor(new Date(user.createdAt).getTime() / 1000),
      custom_attributes: {
        total_bookings: bookings?.length || 0,
        total_booking_value: totalBookingValue,
        total_orders: orders?.length || 0,
        total_order_value: totalOrderValue,
        total_lifetime_value: totalBookingValue + totalOrderValue,
        last_booking_date: bookings?.[0]?.createdAt,
        last_order_date: orders?.[0]?.createdAt
      }
    });
    
    console.log('✅ User profile synced to Intercom');
  } catch (error) {
    console.error('❌ Failed to sync user profile to Intercom:', error.message);
  }
};

/**
 * Endpoint to manually trigger Intercom sync for a user
 */
exports.syncUserToIntercom = async (req, res) => {
  try {
    const { userId } = req.params;
    const User = require('../models/user');
    const Booking = require('../models/booking');
    const Order = require('../models/order');
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const bookings = await Booking.find({ user: userId }).sort({ createdAt: -1 });
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    
    await exports.updateIntercomUserProfile(user, bookings, orders);
    
    res.json({
      success: true,
      message: 'User synced to Intercom successfully',
      data: {
        userId: user._id,
        bookingsCount: bookings.length,
        ordersCount: orders.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


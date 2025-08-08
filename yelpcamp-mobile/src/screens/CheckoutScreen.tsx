import * as React from 'react';
const { useState } = React;
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI } from '../services/api';
import Intercom from '@intercom/intercom-react-native';

type CheckoutScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Checkout'>;

interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function CheckoutScreen() {
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const { user } = useAuth();
  const { cart, getCartTotal, clearCart, getCartItemCount } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  const updateAddress = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateAddress = () => {
    const required = ['name', 'address', 'city', 'state', 'zipCode'];
    for (const field of required) {
      if (!shippingAddress[field as keyof ShippingAddress].trim()) {
        return false;
      }
    }
    return true;
  };

  const calculateShipping = () => {
    // Simple shipping calculation
    const cartTotal = getCartTotal();
    if (cartTotal >= 75) return 0; // Free shipping over $75
    return 9.99;
  };

  const calculateTax = () => {
    // Simple tax calculation (8.5%)
    return getCartTotal() * 0.085;
  };

  const calculateTotal = () => {
    return getCartTotal() + calculateShipping() + calculateTax();
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) {
      Alert.alert('Incomplete Address', 'Please fill in all shipping address fields.');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'No items in cart to order.');
      return;
    }

    Alert.alert(
      'Confirm Order',
      `Place order for $${calculateTotal().toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: submitOrder,
        },
      ]
    );
  };

  const submitOrder = async () => {
    setSubmitting(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress,
      };

      const response = await ordersAPI.create(orderData);
      
              // Track order in Intercom
        Intercom.logEvent('order_placed', {
          order_id: response.data?._id || response._id || 'unknown',
          order_total: calculateTotal(),
          items_count: getCartItemCount(),
          products: cart.map(item => ({
            product_id: item.product._id,
            product_name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
          })),
          user_id: user?.id || 'anonymous',
          shipping_city: shippingAddress.city,
          shipping_state: shippingAddress.state,
        });
      
      // Clear cart after successful order
      await clearCart();

      Alert.alert(
        'Order Placed!',
        'Your order has been successfully placed. You will receive a confirmation email shortly.',
        [
          {
            text: 'View Orders',
            onPress: () => navigation.navigate('Orders'),
          },
          {
            text: 'Continue Shopping',
            onPress: () => navigation.navigate('MainTabs'),
          },
        ]
      );
    } catch (error) {
      console.error('Order submission error:', error);
      Alert.alert(
        'Order Failed',
        'There was an error processing your order. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  return (
    <SafeAreaView style={styles.container} edges={['left','right','bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#4A5D23" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {cart.map((item, index) => (
              <View key={item.product._id} style={styles.orderItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.itemDetails}>
                    Qty: {item.quantity} × {formatPrice(item.product.price)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  {formatPrice(item.product.price * item.quantity)}
                </Text>
              </View>
            ))}
          </View>

          {/* Shipping Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Full Name"
              value={shippingAddress.name}
              onChangeText={(value) => updateAddress('name', value)}
              autoCapitalize="words"
            />
            
            <TextInput
              style={styles.textInput}
              placeholder="Street Address"
              value={shippingAddress.address}
              onChangeText={(value) => updateAddress('address', value)}
              autoCapitalize="words"
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.textInput, styles.halfInput]}
                placeholder="City"
                value={shippingAddress.city}
                onChangeText={(value) => updateAddress('city', value)}
                autoCapitalize="words"
              />
              <TextInput
                style={[styles.textInput, styles.halfInput]}
                placeholder="State"
                value={shippingAddress.state}
                onChangeText={(value) => updateAddress('state', value)}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.row}>
              <TextInput
                style={[styles.textInput, styles.halfInput]}
                placeholder="ZIP Code"
                value={shippingAddress.zipCode}
                onChangeText={(value) => updateAddress('zipCode', value)}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.textInput, styles.halfInput]}
                placeholder="Country"
                value={shippingAddress.country}
                onChangeText={(value) => updateAddress('country', value)}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Payment Note */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <View style={styles.paymentNote}>
              <Ionicons name="information-circle-outline" size={20} color="#4A5D23" />
              <Text style={styles.paymentNoteText}>
                This is a demo app. No actual payment will be processed.
              </Text>
            </View>
          </View>

          {/* Order Totals */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Total</Text>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>{formatPrice(getCartTotal())}</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Shipping:</Text>
              <Text style={styles.totalValue}>
                {calculateShipping() === 0 ? 'Free' : formatPrice(calculateShipping())}
              </Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax:</Text>
              <Text style={styles.totalValue}>{formatPrice(calculateTax())}</Text>
            </View>
            
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Total:</Text>
              <Text style={styles.grandTotalValue}>{formatPrice(calculateTotal())}</Text>
            </View>

            {getCartTotal() >= 75 && (
              <View style={styles.freeShippingNotice}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.freeShippingText}>You qualify for free shipping!</Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.placeOrderButton, submitting && styles.placeOrderButtonDisabled]}
            onPress={handlePlaceOrder}
            disabled={submitting}
          >
            <Text style={styles.placeOrderButtonText}>
              {submitting ? 'Processing...' : `Place Order - ${formatPrice(calculateTotal())}`}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A5D23',
    marginLeft: 16,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A5D23',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  paymentNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
  },
  paymentNoteText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#4A5D23',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A5D23',
  },
  freeShippingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  freeShippingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  placeOrderButton: {
    backgroundColor: '#4A5D23',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#ccc',
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 
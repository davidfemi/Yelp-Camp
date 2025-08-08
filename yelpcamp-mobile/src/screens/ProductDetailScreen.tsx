import * as React from 'react';
const { useState, useEffect } = React;
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, Product } from '../types';
import { productsAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';

type Props = StackScreenProps<RootStackParamList, 'ProductDetail'>;
type ProductDetailNavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetail'>;

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route }: Props) {
  const { productId } = route.params;
  const navigation = useNavigation<ProductDetailNavigationProp>();
  const { addToCart, isInCart, getCartItem, updateCartQuantity } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, []);

  useEffect(() => {
    // Update quantity if product is already in cart
    if (product && isInCart(product._id)) {
      const cartItem = getCartItem(product._id);
      if (cartItem) {
        setQuantity(cartItem.quantity);
      }
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(productId);
      setProduct(response.data?.product || response.product || response);
    } catch (error) {
      console.error('Error fetching product:', error);
      Alert.alert('Error', 'Failed to load product details. Please try again.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const adjustQuantity = (increment: number) => {
    const newQuantity = quantity + increment;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      if (isInCart(product._id)) {
        await updateCartQuantity(product._id, quantity);
        Alert.alert('Cart Updated', `${product.name} quantity updated in cart!`);
      } else {
        await addToCart(product, quantity);
        Alert.alert('Added to Cart', `${product.name} added to cart!`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'apparel': 'Apparel',
      'accessories': 'Accessories',
      'drinkware': 'Drinkware',
      'stationery': 'Stationery'
    };
    return categoryMap[category] || category;
  };

  const getStockStatus = () => {
    if (!product) return { text: 'Unknown', color: '#666' };
    
    if (!product.inStock) {
      return { text: 'Out of Stock', color: '#F44336' };
    }
    
    if (product.stockQuantity <= 5) {
      return { text: `Only ${product.stockQuantity} left!`, color: '#FF9800' };
    }
    
    return { text: 'In Stock', color: '#4CAF50' };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['left','right','bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#4A5D23" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container} edges={['left','right','bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#4A5D23" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stockStatus = getStockStatus();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#4A5D23" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="bag-outline" size={24} color="#4A5D23" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {product.image ? (
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={80} color="#ccc" />
              <Text style={styles.placeholderText}>No Image Available</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{getCategoryDisplayName(product.category)}</Text>
          </View>
          
          <Text style={styles.productName}>{product.name}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            <View style={[styles.stockBadge, { backgroundColor: stockStatus.color }]}>
              <Text style={styles.stockText}>{stockStatus.text}</Text>
            </View>
          </View>

          <Text style={styles.description}>{product.description}</Text>

          {/* Product Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            
            <View style={styles.detailRow}>
              <Ionicons name="pricetag-outline" size={16} color="#666" />
              <Text style={styles.detailLabel}>Category:</Text>
              <Text style={styles.detailValue}>{getCategoryDisplayName(product.category)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="cube-outline" size={16} color="#666" />
              <Text style={styles.detailLabel}>Stock:</Text>
              <Text style={styles.detailValue}>{product.stockQuantity} available</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.detailLabel}>Added:</Text>
              <Text style={styles.detailValue}>
                {new Date(product.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Quantity Selector */}
          {product.inStock && (
            <View style={styles.quantitySection}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => adjustQuantity(-1)}
                  disabled={quantity <= 1}
                >
                  <Ionicons 
                    name="remove" 
                    size={20} 
                    color={quantity <= 1 ? "#ccc" : "#4A5D23"} 
                  />
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{quantity}</Text>
                
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => adjustQuantity(1)}
                  disabled={quantity >= 10 || quantity >= product.stockQuantity}
                >
                  <Ionicons 
                    name="add" 
                    size={20} 
                    color={quantity >= 10 || quantity >= product.stockQuantity ? "#ccc" : "#4A5D23"} 
                  />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.totalPrice}>
                Total: ${(product.price * quantity).toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            (!product.inStock || addingToCart) && styles.addToCartButtonDisabled
          ]}
          onPress={handleAddToCart}
          disabled={!product.inStock || addingToCart}
        >
          <Ionicons 
            name={isInCart(product._id) ? "checkmark-circle" : "bag-add"} 
            size={20} 
            color="#fff" 
          />
          <Text style={styles.addToCartButtonText}>
            {addingToCart
              ? 'Adding...'
              : !product.inStock
              ? 'Out of Stock'
              : isInCart(product._id)
              ? `Update Cart - $${(product.price * quantity).toFixed(2)}`
              : `Add to Cart - $${(product.price * quantity).toFixed(2)}`
            }
          </Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
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
    flex: 1,
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  imageContainer: {
    width: '100%',
    height: width * 0.8,
    backgroundColor: '#fff',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  productInfo: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 1,
  },
  categoryContainer: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    color: '#4A5D23',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    lineHeight: 30,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A5D23',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    minWidth: 60,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  quantitySection: {
    marginBottom: 24,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 24,
    minWidth: 40,
    textAlign: 'center',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A5D23',
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addToCartButton: {
    backgroundColor: '#4A5D23',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 
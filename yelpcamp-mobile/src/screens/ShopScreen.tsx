import * as React from 'react';
const { useState, useEffect } = React;
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Product, RootStackParamList } from '../types';
import { productsAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import CartIndicator from '../components/CartIndicator';
import { SkeletonList } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchBar from '../components/SearchBar';

type ShopScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function ShopScreen() {
  const navigation = useNavigation<ShopScreenNavigationProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      // Backend returns { success: true, data: { products: [...] } }
      const productData = response.data?.products || response.products || response || [];
      setProducts(productData);
      setFilteredProducts(productData);
    } catch (error) {
      console.error('Error fetching products:', error);
      showError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredProducts(products);
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product._id });
  };

  const handleAddToCart = async (product: Product, event?: any) => {
    // Stop event propagation to prevent navigation when add to cart is pressed
    if (event) {
      event.stopPropagation();
    }
    
    try {
      await addToCart(product, 1);
      showSuccess(`${product.name} added to cart!`);
    } catch (error) {
      showError('Failed to add item to cart.');
    }
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const isOutOfStock = !item.inStock || item.stockQuantity <= 0;
    const isLowStock = item.inStock && item.stockQuantity <= 5 && item.stockQuantity > 0;
    
    return (
      <TouchableOpacity 
        style={[styles.productCard, isOutOfStock && styles.outOfStockCard]}
        onPress={() => handleProductPress(item)}
        disabled={isOutOfStock}
      >
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image 
              source={{ uri: item.image }} 
              style={[styles.productImage, isOutOfStock && styles.outOfStockImage]}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.productImagePlaceholder, isOutOfStock && styles.outOfStockImage]}>
              <Ionicons name="image-outline" size={50} color="#ccc" />
            </View>
          )}
          
          {/* Stock Status Indicator */}
          {isOutOfStock && (
            <View style={styles.stockBadge}>
              <Text style={styles.stockBadgeText}>Out of Stock</Text>
            </View>
          )}
          {isLowStock && (
            <View style={[styles.stockBadge, styles.lowStockBadge]}>
              <Text style={styles.stockBadgeText}>Only {item.stockQuantity} left</Text>
            </View>
          )}
          
          {/* Quick Add Button */}
          {!isOutOfStock && (
            <TouchableOpacity 
              style={styles.quickAddButton}
              onPress={(event) => handleAddToCart(item, event)}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productCategory}>{item.category}</Text>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          
          {item.description && (
            <Text style={styles.productDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>${item.price}</Text>
            <Text style={styles.stockText}>
              {item.inStock && item.stockQuantity > 0 ? `${item.stockQuantity} in stock` : 'Out of stock'}
            </Text>
          </View>
        </View>
        
        {/* View Details Indicator */}
        <View style={styles.viewDetailsIndicator}>
          <Ionicons name="chevron-forward" size={16} color="#999" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <CartIndicator />
        </View>
        <SkeletonList count={6} />
      </View>
    );
  }

      return (
      <View style={styles.container}>
        <View style={styles.header}>
          <CartIndicator />
        </View>
        <SearchBar
          placeholder="Search products..."
          onSearch={handleSearch}
          onClear={handleClearSearch}
          style={styles.searchBar}
        />
        
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          style={styles.list}
          numColumns={2}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <EmptyState
              icon={searchQuery ? "search-outline" : "storefront-outline"}
              title={searchQuery ? "No products found" : "No products available"}
              description={searchQuery 
                ? `No products match "${searchQuery}". Try a different search term.`
                : "Check back later for new camping gear and equipment."
              }
              actionText={searchQuery ? "Clear Search" : "Refresh"}
              onAction={searchQuery ? handleClearSearch : onRefresh}
            />
          }
        />
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBar: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },

  list: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 6,
    flex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  outOfStockCard: {
    opacity: 0.7,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    height: 160,
    width: '100%',
  },
  outOfStockImage: {
    opacity: 0.5,
  },
  productImagePlaceholder: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  stockBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  lowStockBadge: {
    backgroundColor: 'rgba(255, 149, 0, 0.95)',
  },
  stockBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  quickAddButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#4A5D23',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#4A5D23',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  productInfo: {
    padding: 16,
  },
  productCategory: {
    fontSize: 10,
    color: '#8e8e93',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1d1d1f',
    marginBottom: 6,
    lineHeight: 20,
  },
  productDescription: {
    fontSize: 13,
    color: '#6d6d70',
    marginBottom: 12,
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: 18,
    color: '#4A5D23',
    fontWeight: '800',
  },
  stockText: {
    fontSize: 11,
    color: '#8e8e93',
    fontWeight: '600',
  },
  viewDetailsIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
}); 
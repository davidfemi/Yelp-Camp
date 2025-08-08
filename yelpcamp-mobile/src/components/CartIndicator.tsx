import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCart } from '../contexts/CartContext';
import { RootStackParamList } from '../types';

type CartIndicatorNavigationProp = StackNavigationProp<RootStackParamList>;

interface CartIndicatorProps {
  color?: string;
  size?: number;
}

export default function CartIndicator({ color = "#4A5D23", size = 24 }: CartIndicatorProps) {
  const navigation = useNavigation<CartIndicatorNavigationProp>();
  const { getCartItemCount } = useCart();
  const itemCount = getCartItemCount();

  const handlePress = () => {
    navigation.navigate('Cart');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.iconContainer}>
        <Ionicons name="bag-outline" size={size} color={color} />
        {itemCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {itemCount > 99 ? '99+' : itemCount.toString()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 
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
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { campgroundsAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { SkeletonList } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchBar from '../components/SearchBar';

export default function ExploreScreen() {
  const [campgrounds, setCampgrounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<any>();
  const { showError } = useToast();

  useEffect(() => {
    fetchCampgrounds(1, true);
  }, []);

  const fetchCampgrounds = async (page = 1, replace = false, search = searchQuery) => {
    try {
      if (page === 1 && !replace) {
        setLoading(true);
      } else if (page > 1) {
        setLoadingMore(true);
      }

      const params: any = { 
        page, 
        limit: 20 
      };
      
      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await campgroundsAPI.getAll(params);
      
      // Backend returns { success: true, data: { campgrounds: [...], pagination: {...} } }
      const newCampgrounds = response.data?.campgrounds || [];
      const pagination = response.data?.pagination;
      
      if (replace || page === 1) {
        setCampgrounds(newCampgrounds);
      } else {
        setCampgrounds(prev => [...prev, ...newCampgrounds]);
      }
      
      setCurrentPage(page);
      setHasNextPage(pagination?.hasNextPage || false);
      if (pagination?.totalCampgrounds) {
        setTotalCount(pagination.totalCampgrounds);
      }
      
    } catch (error) {
      console.error('Error fetching campgrounds:', error);
      showError('Failed to load campgrounds. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasNextPage(true);
    await fetchCampgrounds(1, true, searchQuery);
    setRefreshing(false);
  };

  const loadMoreCampgrounds = async () => {
    if (!loadingMore && hasNextPage) {
      const nextPage = currentPage + 1;
      await fetchCampgrounds(nextPage, false, searchQuery);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setHasNextPage(true);
    await fetchCampgrounds(1, true, query);
  };

  const handleClearSearch = async () => {
    setSearchQuery('');
    setCurrentPage(1);
    setHasNextPage(true);
    await fetchCampgrounds(1, true, '');
  };

  const renderCampground = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.campgroundCard}
      onPress={() => navigation.navigate('CampgroundDetail', { campgroundId: item._id })}
    >
      <View style={styles.imageContainer}>
        {item.images && item.images.length > 0 ? (
          <Image 
            source={{ uri: item.images[0].url }} 
            style={styles.campgroundImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={50} color="#c7c7cc" />
            <Text style={styles.imageText}>No Image</Text>
          </View>
        )}
        
        {/* View Details Indicator */}
        <View style={styles.viewDetailsIndicator}>
          <Ionicons name="chevron-forward" size={16} color="#8e8e93" />
        </View>
      </View>
      
      <View style={styles.campgroundInfo}>
        <Text style={styles.campgroundTitle}>{item.title}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={16} color="#8e8e93" />
          <Text style={styles.campgroundLocation}>{item.location}</Text>
        </View>
        <Text style={styles.campgroundDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.campgroundPrice}>${item.price}/night</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <SkeletonList count={6} />;
  }

      return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Explore Campgrounds</Text>
          {totalCount > 0 && (
            <Text style={styles.countText}>
              Showing {campgrounds.length} of {totalCount} campgrounds
            </Text>
          )}
        </View>
        
        <SearchBar
          placeholder="Search campgrounds..."
          onSearch={handleSearch}
          onClear={handleClearSearch}
          style={styles.searchBar}
        />
        
      <FlatList
        data={campgrounds}
        renderItem={renderCampground}
        keyExtractor={(item) => item._id || item.id}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMoreCampgrounds}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <LoadingSpinner 
              size="small" 
              text="Loading more campgrounds..." 
              style={styles.loadMoreContainer}
            />
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon={searchQuery ? "search-outline" : "location-outline"}
            title={searchQuery ? "No results found" : "No campgrounds found"}
            description={searchQuery 
              ? `No campgrounds match "${searchQuery}". Try a different search term.`
              : "Try refreshing the page or check back later for new campgrounds."
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
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  countText: {
    fontSize: 15,
    color: '#8e8e93',
    fontWeight: '600',
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
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  campgroundCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 180,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  campgroundImage: {
    height: 180,
    width: '100%',
  },
  placeholderImage: {
    height: 180,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 6,
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
  campgroundInfo: {
    padding: 20,
  },
  campgroundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1d1d1f',
    marginBottom: 8,
    lineHeight: 24,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  campgroundLocation: {
    fontSize: 15,
    color: '#8e8e93',
    marginLeft: 4,
    fontWeight: '500',
  },
  campgroundDescription: {
    fontSize: 15,
    color: '#6d6d70',
    lineHeight: 22,
    marginBottom: 14,
  },
  campgroundPrice: {
    fontSize: 20,
    color: '#4A5D23',
    fontWeight: '800',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8e8e93',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    color: '#1d1d1f',
    marginTop: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#8e8e93',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadMoreContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadMoreText: {
    marginTop: 12,
    fontSize: 15,
    color: '#8e8e93',
    fontWeight: '600',
  },
}); 
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaSearch, FaShoppingCart, FaLeaf, FaFire, FaStar, FaHeart, FaHistory } from 'react-icons/fa';
import { getMenu } from '../../services/api';
import { addItem } from '../../store/slices/cartSlice';
import { selectCartCount } from '../../store/slices/cartSlice';
import FavoriteButton from '../../components/FavoriteButton';
import { selectLoyaltyPoints, selectLoyaltyLevel } from '../../store/slices/loyaltySlice';
import ItemCustomizationModal from '../../components/ItemCustomizationModal';
import { MenuItemSkeleton } from '../../components/SkeletonLoader';
import DarkModeToggle from '../../components/DarkModeToggle';
import ComboDeals from '../../components/ComboDeals';

const categories = ['All', 'Starters', 'Main Course', 'Drinks', 'Desserts'];

const MenuScreenEnhanced = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartCount = useSelector(selectCartCount) || 0;
  const loyaltyPoints = useSelector(selectLoyaltyPoints);
  const loyaltyLevel = useSelector(selectLoyaltyLevel);
  
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCombos, setShowCombos] = useState(true);
  const [customizationModal, setCustomizationModal] = useState({ isOpen: false, item: null });

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await getMenu();
      // Handle both array response and data property
      const menuData = Array.isArray(response.data) ? response.data : (response.data?.data || response.data || []);
      // Use data from backend, add defaults if missing
      const itemsWithBadges = menuData.map((item) => ({
        ...item,
        isVeg: item.isVeg !== undefined ? item.isVeg : Math.random() > 0.5,
        isBestseller: item.isBestseller || false,
        isRecommended: item.isRecommended || false,
        stock: item.stock !== undefined ? item.stock : Math.floor(Math.random() * 50) + 10,
        minStock: item.minStock || 10,
      }));
      setMenuItems(itemsWithBadges);
    } catch (error) {
      console.error('Error fetching menu:', error);
      toast.error('Failed to load menu. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search items
  const filteredItems = useMemo(() => {
    let filtered = menuItems;

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [menuItems, selectedCategory, searchQuery]);

  const handleAddItem = (item, customization = {}, customPrice = null) => {
    const itemToAdd = {
      ...item,
      price: customPrice || item.price,
      customization,
    };
    dispatch(addItem({ item: itemToAdd, customization }));
    toast.success(`${item.name} added to cart!`, {
      icon: '🛒',
    });
  };

  const handleAddCombo = (combo) => {
    // Create a combo item object that matches the cart structure
    const comboItem = {
      _id: combo.id, // Use combo id as _id
      name: combo.name,
      description: combo.description,
      price: combo.price,
      originalPrice: combo.originalPrice,
      category: 'Combo',
      imageUrl: combo.imageUrl,
      comboItems: combo.items, // Store the included items
      isCombo: true, // Flag to identify combo items
    };
    
    // Add combo as a single item to cart
    dispatch(addItem({ item: comboItem, customization: {} }));
    toast.success(`${combo.name} added to cart!`, { icon: '🎉' });
  };


  const handleCustomizeClick = (item) => {
    if (item.stock === 0) {
      toast.error('This item is out of stock');
      return;
    }
    setCustomizationModal({ isOpen: true, item });
  };

  const handleQuickAdd = (item) => {
    if (item.stock === 0) {
      toast.error('This item is out of stock');
      return;
    }
    handleAddItem(item);
  };

  // Generate consistent ratings for items (4.0 to 5.0)
  const itemRatings = useMemo(() => {
    const ratings = {};
    menuItems.forEach((item) => {
      // Use item ID to generate consistent rating
      const seed = item._id ? item._id.charCodeAt(0) : 0;
      ratings[item._id] = (4.0 + (seed % 10) / 10).toFixed(1);
    });
    return ratings;
  }, [menuItems]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold dark:text-white">Menu</h1>
            <div className="flex items-center gap-3">
              {loyaltyPoints > 0 && (
                <div className="bg-orange-100 dark:bg-orange-900/20 px-3 py-1.5 rounded-lg text-sm">
                  <span>⭐ {loyaltyLevel}</span>
                  <span className="ml-2 font-semibold">{loyaltyPoints} pts</span>
                </div>
              )}
              <DarkModeToggle />
              <button
                onClick={() => navigate('/orders')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Order History"
              >
                <FaHistory className="text-lg" />
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors relative"
              >
                <FaShoppingCart className="inline mr-1" />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Bar - Top */}
        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-white transition-all hover:border-orange-400"
            />
          </div>
        </div>

        {/* Combo Deals Section */}
        {showCombos && (
          <div id="combo-deals" className="mb-6">
            <ComboDeals onAddCombo={handleAddCombo} />
          </div>
        )}

        {/* Popular Food Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold dark:text-white">Popular Food</h2>
            <button 
              onClick={() => setSelectedCategory('All')}
              className="text-gray-500 dark:text-gray-400 text-sm hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              view all
            </button>
          </div>
          
          {/* Category Buttons - Horizontal Scroll */}
          <div className="flex gap-3 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {categories.filter(c => c !== 'All').map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-orange-300'
                }`}
              >
                <span className="text-lg">
                  {category === 'Starters' && '🍗'}
                  {category === 'Main Course' && '🍔'}
                  {category === 'Drinks' && '🥤'}
                  {category === 'Desserts' && '🍰'}
                </span>
                {category}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid - 3 Columns */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <MenuItemSkeleton key={i} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500 dark:text-gray-400">
              No items found. Try a different search or category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredItems.map((item, index) => {
              const rating = itemRatings[item._id] || '4.5';
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Food+Item';
                      }}
                    />
                    {/* Favorite Button - Top Left */}
                    <div className="absolute top-3 left-3">
                      <FavoriteButton item={item} />
                    </div>
                    {/* Out of Stock Overlay */}
                    {item.stock === 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                        <span className="text-white font-bold bg-red-600 px-4 py-2 rounded-lg">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {item.name}
                    </h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-orange-600 dark:text-orange-400 font-bold text-lg">
                          ₹{item.price}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <FaStar className="text-yellow-400 text-sm fill-yellow-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{rating}</span>
                        </div>
                      </div>
                      {item.stock > 0 ? (
                        <motion.button
                          onClick={() => handleQuickAdd(item)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-700 transition-colors shadow-md hover:shadow-lg"
                        >
                          Add
                        </motion.button>
                      ) : (
                        <button
                          disabled
                          className="bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 px-6 py-2.5 rounded-xl font-semibold cursor-not-allowed"
                        >
                          Unavailable
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Customization Modal */}
      <ItemCustomizationModal
        item={customizationModal.item}
        isOpen={customizationModal.isOpen}
        onClose={() => setCustomizationModal({ isOpen: false, item: null })}
        onAddToCart={handleAddItem}
      />
    </div>
  );
};

export default MenuScreenEnhanced;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMenu } from '../../services/api';
import { useCart } from '../../context/CartContext';

const categories = ['All', 'Starters', 'Main Course', 'Drinks', 'Desserts'];

const MenuScreen = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const { addItem, removeItem, updateQuantity, items: cartItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenu();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredItems(menuItems);
    } else {
      setFilteredItems(menuItems.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory, menuItems]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await getMenu();
      setMenuItems(response.data);
      setFilteredItems(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
      alert('Failed to load menu. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = (item) => {
    addItem(item);
  };

  const getItemQuantity = (itemId) => {
    const cartItem = cartItems.find(item => item._id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-primary-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-bold">Menu</h1>
          <button
            onClick={() => navigate('/cart')}
            className="bg-white text-primary-600 px-6 py-3 rounded-lg font-bold text-xl hover:bg-primary-50 relative"
          >
            Cart ({cartItemCount})
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 overflow-x-auto">
          <div className="flex space-x-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-lg font-semibold text-lg whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl text-gray-500">No items available in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const quantity = getItemQuantity(item._id);
              return (
                <div key={item._id} className="card p-4">
                  <div className="relative mb-4">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Food+Item';
                      }}
                    />
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">Unavailable</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                  {item.description && (
                    <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary-600">
                      ₹{item.price}
                    </span>
                    {item.isAvailable && (
                      <div className="flex items-center space-x-2">
                        {quantity > 0 && (
                          <>
                            <button
                              onClick={() => {
                                if (quantity > 1) {
                                  updateQuantity(item._id, quantity - 1);
                                } else {
                                  removeItem(item._id);
                                }
                              }}
                              className="bg-gray-200 text-gray-800 w-10 h-10 rounded-full font-bold hover:bg-gray-300"
                            >
                              −
                            </button>
                            <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                          </>
                        )}
                        <button
                          onClick={() => handleAddItem(item)}
                          className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700"
                        >
                          {quantity > 0 ? '+' : 'Add'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuScreen;


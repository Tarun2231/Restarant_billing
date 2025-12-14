import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFire, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const COMBO_DEALS = [
  {
    id: 'combo1',
    name: 'Chicken Combo',
    description: 'Chicken Burger + Fries + Drink',
    price: 599,
    originalPrice: 750,
    items: ['Grilled Chicken Burger', 'French Fries', 'Coca Cola'],
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
  },
  {
    id: 'combo2',
    name: 'Family Pack',
    description: '2 Burgers + 2 Fries + 2 Drinks',
    price: 999,
    originalPrice: 1200,
    items: ['2x Grilled Chicken Burger', '2x French Fries', '2x Coca Cola'],
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
  },
  {
    id: 'combo3',
    name: 'Breakfast Combo',
    description: 'Coffee + Sandwich + Hash Browns',
    price: 399,
    originalPrice: 480,
    items: ['Coffee', 'Grilled Chicken Wrap', 'Hash Browns'],
    imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400',
  },
];

const ComboDeals = ({ onAddCombo }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const containerRef = useRef(null);

  // Calculate items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerView(1);
      } else if (width < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, COMBO_DEALS.length - itemsPerView);

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const visibleCombos = COMBO_DEALS.slice(currentIndex, currentIndex + itemsPerView);

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4 dark:text-white flex items-center gap-2">
        <FaFire className="text-orange-500" />
        Combo Deals
      </h2>
      
      <div className="relative">
        {/* Navigation Buttons */}
        {currentIndex > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={goToPrevious}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-700"
            aria-label="Previous combos"
          >
            <FaChevronLeft className="text-orange-600 dark:text-orange-400 text-lg" />
          </motion.button>
        )}

        {currentIndex < maxIndex && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={goToNext}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-700"
            aria-label="Next combos"
          >
            <FaChevronRight className="text-orange-600 dark:text-orange-400 text-lg" />
          </motion.button>
        )}

        {/* Combo Cards Container */}
        <div 
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {visibleCombos.map((combo, index) => (
              <motion.div
                key={combo.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={combo.imageUrl}
                    alt={combo.name}
                    className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                    Save ₹{combo.originalPrice - combo.price}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-1 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {combo.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{combo.description}</p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 mb-3 space-y-0.5">
                    {combo.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-1">
                        <span className="text-orange-500">•</span> {item}
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-400 line-through text-sm">₹{combo.originalPrice}</span>
                      <span className="text-xl font-bold text-orange-600 dark:text-orange-400 ml-2">
                        ₹{combo.price}
                      </span>
                    </div>
                    <motion.button
                      onClick={() => onAddCombo(combo)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-orange-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-orange-700 text-sm transition-colors shadow-md hover:shadow-lg"
                    >
                      Add
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Dots Indicator */}
        {maxIndex > 0 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === index
                    ? 'w-8 bg-orange-600'
                    : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-orange-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComboDeals;


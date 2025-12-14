import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const ItemCustomizationModal = ({ item, isOpen, onClose, onAddToCart }) => {
  const [size, setSize] = useState('medium');
  const [addOns, setAddOns] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Mock add-ons based on item category
  const availableAddOns = {
    'Main Course': [
      { id: 'extra-cheese', name: 'Extra Cheese', price: 30 },
      { id: 'extra-sauce', name: 'Extra Sauce', price: 20 },
      { id: 'extra-toppings', name: 'Extra Toppings', price: 40 },
    ],
    'Drinks': [
      { id: 'ice-level', name: 'Ice Level: Normal', price: 0 },
      { id: 'sugar-level', name: 'Sugar Level: Normal', price: 0 },
      { id: 'extra-shot', name: 'Extra Shot', price: 50 },
    ],
    'Desserts': [
      { id: 'whipped-cream', name: 'Whipped Cream', price: 25 },
      { id: 'chocolate-sauce', name: 'Chocolate Sauce', price: 20 },
      { id: 'nuts', name: 'Nuts', price: 30 },
    ],
    'Starters': [
      { id: 'dip-sauce', name: 'Extra Dip', price: 15 },
      { id: 'spice-level', name: 'Spice Level: Medium', price: 0 },
    ],
  };

  const sizeOptions = [
    { value: 'small', label: 'Small', priceMultiplier: 0.8 },
    { value: 'medium', label: 'Medium', priceMultiplier: 1 },
    { value: 'large', label: 'Large', priceMultiplier: 1.3 },
  ];

  const handleAddOnToggle = (addOn) => {
    if (addOns.find((a) => a.id === addOn.id)) {
      setAddOns(addOns.filter((a) => a.id !== addOn.id));
    } else {
      setAddOns([...addOns, addOn]);
    }
  };

  const calculatePrice = () => {
    const basePrice = item.price;
    const sizeMultiplier = sizeOptions.find((s) => s.value === size)?.priceMultiplier || 1;
    const addOnsPrice = addOns.reduce((sum, addOn) => sum + addOn.price, 0);
    return Math.round(basePrice * sizeMultiplier + addOnsPrice);
  };

  const handleAdd = () => {
    const customization = {
      size,
      addOns,
      specialInstructions,
    };
    onAddToCart(item, customization, calculatePrice());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold dark:text-white">{item.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <label className="block font-semibold mb-3 dark:text-white">Size</label>
            <div className="grid grid-cols-3 gap-3">
              {sizeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSize(option.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    size === option.value
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <div className="font-semibold dark:text-white">{option.label}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    ₹{Math.round(item.price * option.priceMultiplier)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          {availableAddOns[item.category] && (
            <div className="mb-6">
              <label className="block font-semibold mb-3 dark:text-white">Add-ons</label>
              <div className="space-y-2">
                {availableAddOns[item.category].map((addOn) => (
                  <label
                    key={addOn.id}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={addOns.some((a) => a.id === addOn.id)}
                        onChange={() => handleAddOnToggle(addOn)}
                        className="w-5 h-5"
                      />
                      <span className="dark:text-white">{addOn.name}</span>
                    </div>
                    {addOn.price > 0 && (
                      <span className="text-primary-600 font-semibold">+₹{addOn.price}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 dark:text-white">
              Special Instructions
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
              rows="3"
              placeholder="Any special requests?"
            />
          </div>

          {/* Price and Add Button */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              <div className="text-2xl font-bold text-primary-600">₹{calculatePrice()}</div>
            </div>
            <button onClick={handleAdd} className="btn-primary">
              Add to Cart
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ItemCustomizationModal;


import React from 'react';

export const MenuItemSkeleton = () => {
  return (
    <div className="card p-4 animate-pulse">
      <div className="w-full h-48 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4"></div>
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-3 w-3/4"></div>
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
      </div>
    </div>
  );
};

export const CartItemSkeleton = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="flex items-center space-x-4 flex-1">
        <div className="w-20 h-20 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
    </div>
  );
};


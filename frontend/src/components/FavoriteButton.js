import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaHeart } from 'react-icons/fa';
import { toggleFavorite, selectIsFavorite } from '../store/slices/favoritesSlice';
import toast from 'react-hot-toast';

const FavoriteButton = ({ item }) => {
  const dispatch = useDispatch();
  const isFavorite = useSelector(selectIsFavorite(item._id));

  const handleToggle = (e) => {
    e.stopPropagation();
    dispatch(toggleFavorite(item));
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites', {
      icon: isFavorite ? '💔' : '❤️',
    });
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-full transition-colors ${
        isFavorite
          ? 'bg-red-500 text-white shadow-md'
          : 'bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20'
      }`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <FaHeart className={isFavorite ? 'fill-current' : ''} size={18} />
    </button>
  );
};

export default FavoriteButton;


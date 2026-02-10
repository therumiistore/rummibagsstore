import { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      ...notification,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after 5 seconds if not manually dismissed
    setTimeout(() => {
      removeNotification(id);
    }, 5000);

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const showCartNotification = (product, selectedSize, quantity = 1, action = 'added to cart', calculatedPrice = null) => {
    const displayName = selectedSize ? `${product.name} (${selectedSize})` : product.name;

    let title, message, type;

    if (action === 'added to wishlist') {
      title = 'Added to Wishlist!';
      message = `${displayName} has been saved to your wishlist`;
      type = 'wishlist';
    } else if (action === 'removed from wishlist') {
      title = 'Removed from Wishlist';
      message = `${displayName} has been removed from your wishlist`;
      type = 'wishlist';
    } else {
      title = 'Added to Cart!';
      message = `${displayName} has been added to your cart`;
      type = 'cart';
    }

    return addNotification({
      type,
      title,
      message,
      product: {
        id: product.id,
        name: product.displayName || product.name,
        image: product.image,
        price: calculatedPrice !== null ? calculatedPrice : product.price,
        selectedSize,
        quantity
      }
    });
  };

  const showSuccessNotification = (message) => {
    return addNotification({
      type: 'success',
      title: 'Success!',
      message
    });
  };

  const showErrorNotification = (message) => {
    return addNotification({
      type: 'error',
      title: 'Error',
      message
    });
  };

  const showInfoNotification = (message) => {
    return addNotification({
      type: 'info',
      title: 'Info',
      message
    });
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showCartNotification,
    showSuccessNotification,
    showErrorNotification,
    showInfoNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext; 
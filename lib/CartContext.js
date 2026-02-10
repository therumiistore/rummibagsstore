import { createContext, useContext, useReducer, useEffect } from 'react';

// Cart actions
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART',
  TOGGLE_CART: 'TOGGLE_CART'
};

// Helper function to clean corrupted cart data
const cleanCartData = (cartItems) => {
  if (!Array.isArray(cartItems)) return [];
  return cartItems.map(item => ({
    ...item,
    quantity: Number(item.quantity) || 1,
    price: Number(item.price) || 0,
    originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined
  })).filter(item => item.id && item.name);
};

// Helper function to build configuration payload
const buildConfiguration = (product, userSelections = {}) => {
  const config = {};
  if (product.sizes?.length > 0 && userSelections.size) {
    config.size = userSelections.size;
  }
  if (product.colors?.length > 0 && userSelections.color) {
    config.color = userSelections.color;
  }
  // Include any custom variant selections (beyond size and color)
  Object.entries(userSelections).forEach(([key, value]) => {
    if (key !== 'size' && key !== 'color' && value) {
      config[key] = value;
    }
  });
  return config;
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const existingItem = state.items.find(item => {
        const sameId = item.id === action.payload.id;
        const sameConfig = JSON.stringify(item.selectedConfiguration || {}) === JSON.stringify(action.payload.selectedConfiguration || {});
        return sameId && sameConfig;
      });

      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item => {
            const sameId = item.id === action.payload.id;
            const sameConfig = JSON.stringify(item.selectedConfiguration || {}) === JSON.stringify(action.payload.selectedConfiguration || {});
            return sameId && sameConfig
              ? { ...item, quantity: Number(item.quantity) + Number(action.payload.quantity) }
              : item;
          })
        };
      }

      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: Number(action.payload.quantity) || 1 }]
      };
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      return {
        ...state,
        items: state.items.filter(item => {
          const sameId = item.id === action.payload.id;
          const sameConfig = JSON.stringify(item.selectedConfiguration || {}) === JSON.stringify(action.payload.selectedConfiguration || {});
          return !(sameId && sameConfig);
        })
      };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      if (Number(action.payload.quantity) <= 0) {
        return {
          ...state,
          items: state.items.filter(item => {
            const sameId = item.id === action.payload.id;
            const sameConfig = JSON.stringify(item.selectedConfiguration || {}) === JSON.stringify(action.payload.selectedConfiguration || {});
            return !(sameId && sameConfig);
          })
        };
      }

      return {
        ...state,
        items: state.items.map(item => {
          const sameId = item.id === action.payload.id;
          const sameConfig = JSON.stringify(item.selectedConfiguration || {}) === JSON.stringify(action.payload.selectedConfiguration || {});
          return sameId && sameConfig
            ? { ...item, quantity: Number(action.payload.quantity) }
            : item;
        })
      };
    }

    case CART_ACTIONS.CLEAR_CART:
      return { ...state, items: [] };

    case CART_ACTIONS.LOAD_CART:
      return { ...state, items: action.payload };

    case CART_ACTIONS.TOGGLE_CART:
      return { ...state, isOpen: !state.isOpen };

    default:
      return state;
  }
};

const initialState = {
  items: [],
  isOpen: false
};

const CartContext = createContext();

export const CartProvider = ({ children, storeSlug }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Use store-specific storage key
  const storageKey = storeSlug ? `cart_${storeSlug}` : 'cart_default';

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(storageKey);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        const cleanedCart = cleanCartData(parsedCart);
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cleanedCart });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }, [storageKey]);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }, [state.items, storageKey]);

  const addItem = (product, quantity = 1, userSelections = {}) => {
    const selectedConfiguration = buildConfiguration(product, userSelections);

    // Calculate the final price including size and custom variant prices
    let finalPrice = product.price || 0;

    // If size is selected and has a price, use that price
    if (userSelections.size && product.sizes?.length > 0) {
      const selectedSizeObj = product.sizes.find(s =>
        (typeof s === 'object' ? s.size : s) === userSelections.size
      );
      if (selectedSizeObj && typeof selectedSizeObj === 'object' && selectedSizeObj.pricebysize) {
        finalPrice = parseFloat(selectedSizeObj.pricebysize) || finalPrice;
      }
    }

    // Add prices from custom variants
    Object.entries(userSelections).forEach(([key, value]) => {
      if (key !== 'size' && key !== 'color' && value && typeof value === 'object' && value.price) {
        finalPrice += parseFloat(value.price) || 0;
      }
    });

    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: {
        id: product.id,
        name: product.displayName || product.name,
        price: finalPrice,
        originalPrice: product.originalPrice || product.original_price,
        image: product.image || product.thumbnail,
        category: product.category || product.category_name,
        quantity: Number(quantity),
        selectedConfiguration: Object.keys(selectedConfiguration).length > 0 ? selectedConfiguration : null,
      }
    });
  };

  const removeItem = (id, selectedConfiguration = null) => {
    dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: { id, selectedConfiguration } });
  };

  const updateQuantity = (id, quantity, selectedConfiguration = null) => {
    dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { id, quantity, selectedConfiguration } });
  };

  const clearCart = () => dispatch({ type: CART_ACTIONS.CLEAR_CART });
  const toggleCart = () => dispatch({ type: CART_ACTIONS.TOGGLE_CART });

  const itemCount = state.items.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  const totalPrice = state.items.reduce((total, item) => total + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);
  const originalTotalPrice = state.items.reduce((total, item) =>
    total + (((Number(item.originalPrice) || Number(item.price)) || 0) * (Number(item.quantity) || 0)), 0
  );
  const totalSavings = originalTotalPrice - totalPrice;

  const value = {
    items: state.items,
    isOpen: state.isOpen,
    itemCount,
    totalPrice,
    originalTotalPrice,
    totalSavings,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
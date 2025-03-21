import Cart from '../models/Cart.js';
import Inventory from '../models/Inventory.js';

/**
 * Get the current user's cart
 * @route GET /api/cart
 * @access Private
 */
export const getUserCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    
    // If no cart exists yet, create an empty one
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalItems: 0,
        totalPrice: 0
      });
    }
    
    // Populate product information
    await cart.populate('items.product', 'name price stock');
    
    res.json(cart);
  } catch (error) {
    console.error('Error in getUserCart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Add an item to the cart
 * @route POST /api/cart
 * @access Private
 */
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    // Validate product exists
    const product = await Inventory.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: `Not enough stock. Available: ${product.stock}` 
      });
    }
    
    // Find user's cart or create one if it doesn't exist
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: []
      });
    }
    
    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (existingItemIndex > -1) {
      // Update quantity if item exists
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      // Ensure we don't exceed available stock
      if (newQuantity > product.stock) {
        return res.status(400).json({ 
          message: `Cannot add more. Available stock: ${product.stock}` 
        });
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        name: product.name,
        price: product.price,
        quantity
      });
    }
    
    // Save cart
    await cart.save();
    
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error in addToCart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update cart item quantity
 * @route PUT /api/cart/:productId
 * @access Private
 */
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    // Validate quantity
    if (!quantity || quantity < 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }
    
    // Find the cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Check if product exists in cart
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    // If quantity is 0, remove the item
    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Check stock availability
      const product = await Inventory.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      if (product.stock < quantity) {
        return res.status(400).json({ 
          message: `Not enough stock. Available: ${product.stock}` 
        });
      }
      
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }
    
    // Save cart
    await cart.save();
    
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error in updateCartItem:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Remove an item from the cart
 * @route DELETE /api/cart/:productId
 * @access Private
 */
export const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Find the cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Remove the item
    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    
    // Save cart
    await cart.save();
    
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error in removeCartItem:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Clear the entire cart
 * @route DELETE /api/cart
 * @access Private
 */
export const clearCart = async (req, res) => {
  try {
    // Find the cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Clear items
    cart.items = [];
    
    // Save cart
    await cart.save();
    
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error in clearCart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Sync cart items from localStorage to database
 * @route POST /api/cart/sync
 * @access Private
 */
export const syncCart = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Invalid cart data' });
    }
    
    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: []
      });
    }
    
    // Process each item
    for (const item of items) {
      if (!item._id) continue;
      
      // Validate product exists
      const product = await Inventory.findById(item._id);
      if (!product) continue;
      
      // Ensure quantity doesn't exceed stock
      const safeQuantity = Math.min(item.quantity, product.stock);
      if (safeQuantity <= 0) continue;
      
      // Check if product already exists in cart
      const existingItemIndex = cart.items.findIndex(
        cartItem => cartItem.product.toString() === item._id
      );
      
      if (existingItemIndex > -1) {
        // Update quantity
        cart.items[existingItemIndex].quantity = safeQuantity;
        cart.items[existingItemIndex].price = product.price; // Ensure price is up-to-date
      } else {
        // Add new item
        cart.items.push({
          product: item._id,
          name: product.name,
          price: product.price,
          quantity: safeQuantity
        });
      }
    }
    
    // Save cart
    await cart.save();
    
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error in syncCart:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 
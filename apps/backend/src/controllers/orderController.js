import Order from '../models/Order.js';
import Inventory from '../models/Inventory.js';
import InventoryLog from '../models/InventoryLog.js';
import Customer from '../models/Customer.js';

/**
 * Create a new order
 * @route POST /api/orders
 * @access Private
 */
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Find or create customer
    let customer;
    if (req.body.customerId) {
      customer = await Customer.findById(req.body.customerId);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
    } else {
      // First check if a customer with this email already exists
      customer = await Customer.findOne({ email: req.body.customerEmail });
      
      if (!customer) {
        // Only create a new customer if none exists with this email
        try {
          customer = await Customer.create({
            name: req.body.customerName,
            email: req.body.customerEmail,
            phone: req.body.customerPhone || '',
            address: shippingAddress,
            user: req.user._id,
          });
        } catch (err) {
          // If creation fails due to duplicate key, try to find the customer again
          if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
            customer = await Customer.findOne({ email: req.body.customerEmail });
            if (!customer) {
              return res.status(400).json({ message: 'Failed to create or find customer record' });
            }
          } else {
            throw err; // Re-throw if it's a different error
          }
        }
      } else {
        // Update the existing customer's information
        customer.name = req.body.customerName || customer.name;
        customer.phone = req.body.customerPhone || customer.phone;
        customer.address = shippingAddress || customer.address;
        await customer.save();
      }
    }

    // Check inventory and update stock
    for (const item of orderItems) {
      const product = await Inventory.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ 
          message: `Product not found: ${item.name}` 
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Not enough stock for ${product.name}. Available: ${product.stock}` 
        });
      }
      
      // Reduce inventory
      product.stock -= item.quantity;
      await product.save();
      
      // Log inventory change
      await InventoryLog.create({
        product: product._id,
        change: -item.quantity,
        reason: 'order',
        user: req.user._id,
      });
    }

    const order = await Order.create({
      customer: customer._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      status: 'pending',
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all orders
 * @route GET /api/orders
 * @access Private/Admin/Operator
 */
export const getOrders = async (req, res) => {
  try {
    // Build filter based on status query parameter
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
      .populate('customer', 'name email')
      .sort('-createdAt');
    
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get order by ID
 * @route GET /api/orders/:id
 * @access Private/Admin/Operator or Customer who owns the order
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate({
        path: 'orderItems.product',
        select: 'name price',
      });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if the order belongs to the authenticated customer (if not admin/operator)
    if (req.user.role === 'user') {
      const customer = await Customer.findOne({ user: req.user._id });
      if (!customer || order.customer._id.toString() !== customer._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to access this order' });
      }
    }
    
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update order status
 * @route PUT /api/orders/:id/status
 * @access Private/Admin/Operator
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const validStatuses = ['pending', 'packing', 'packed', 'shipped', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if we're trying to update to the same status
    if (order.status === status) {
      return res.status(400).json({ message: `Order is already in ${status} status` });
    }
    
    // Update the status
    order.status = status;
    
    // If status is shipped, mark as delivered
    if (status === 'shipped') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    
    const updatedOrder = await order.save();
    
    res.json({
      message: 'Order status updated',
      order: updatedOrder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get orders for the authenticated user
 * @route GET /api/orders/my-orders
 * @access Private
 */
export const getUserOrders = async (req, res) => {
  try {
    // Find customer record for the current user
    const customer = await Customer.findOne({ user: req.user._id });
    
    if (!customer) {
      // Create a basic customer record if none exists
      const newCustomer = await Customer.create({
        name: req.user.name,
        email: req.user.email,
        phone: '',
        address: {
          street: 'Please update',
          city: 'Please update',
          state: 'Please update',
          postalCode: 'Please update',
          country: 'United States'
        },
        user: req.user._id
      });
      
      // Return empty orders array since this is a new customer
      return res.json([]);
    }
    
    // Find all orders for this customer
    const orders = await Order.find({ customer: customer._id })
      .sort('-createdAt');
    
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 
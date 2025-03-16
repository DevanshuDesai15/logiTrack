import Inventory from '../models/Inventory.js';
import InventoryLog from '../models/InventoryLog.js';

/**
 * Get all inventory items
 * @route GET /api/inventory
 * @access Private/Admin/Operator
 */
export const getInventory = async (req, res) => {
  try {
    const inventoryItems = await Inventory.find({});
    res.json(inventoryItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get inventory item by ID
 * @route GET /api/inventory/:id
 * @access Private/Admin/Operator
 */
export const getInventoryById = async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id);
    
    if (inventoryItem) {
      res.json(inventoryItem);
    } else {
      res.status(404).json({ message: 'Inventory item not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new inventory item
 * @route POST /api/inventory
 * @access Private/Admin
 */
export const createInventoryItem = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    const newItem = await Inventory.create({
      name,
      description,
      price,
      stock,
      category,
    });

    // Create inventory log for initial stock
    if (stock > 0) {
      await InventoryLog.create({
        product: newItem._id,
        change: stock,
        reason: 'manual-adjustment',
        reasonDetails: 'Initial inventory',
        user: req.user._id,
      });
    }

    res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update an inventory item
 * @route PUT /api/inventory/:id
 * @access Private/Admin
 */
export const updateInventoryItem = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const inventoryItem = await Inventory.findById(req.params.id);
    
    if (inventoryItem) {
      inventoryItem.name = name || inventoryItem.name;
      inventoryItem.description = description || inventoryItem.description;
      inventoryItem.price = price || inventoryItem.price;
      inventoryItem.category = category || inventoryItem.category;
      
      const updatedItem = await inventoryItem.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Inventory item not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete an inventory item
 * @route DELETE /api/inventory/:id
 * @access Private/Admin
 */
export const deleteInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id);
    
    if (inventoryItem) {
      await Inventory.deleteOne({ _id: inventoryItem._id });
      res.json({ message: 'Inventory item removed' });
    } else {
      res.status(404).json({ message: 'Inventory item not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update inventory stock
 * @route PUT /api/inventory/:id/stock
 * @access Private/Admin
 */
export const updateInventoryStock = async (req, res) => {
  try {
    const { adjustment, reason, reasonDetails } = req.body;
    const inventoryItem = await Inventory.findById(req.params.id);
    
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    // Check if the adjustment would result in negative stock
    if (inventoryItem.stock + adjustment < 0) {
      return res.status(400).json({ 
        message: 'Cannot reduce stock below zero',
        currentStock: inventoryItem.stock 
      });
    }
    
    // Update stock
    inventoryItem.stock += adjustment;
    const updatedItem = await inventoryItem.save();
    
    // Log inventory change
    await InventoryLog.create({
      product: inventoryItem._id,
      change: adjustment,
      reason: reason || 'manual-adjustment',
      reasonDetails: reasonDetails || 'Manual stock adjustment',
      user: req.user._id,
    });
    
    res.json({
      message: 'Stock updated successfully',
      item: updatedItem
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get inventory logs for a product
 * @route GET /api/inventory/:id/logs
 * @access Private/Admin
 */
export const getInventoryLogs = async (req, res) => {
  try {
    const logs = await InventoryLog.find({ product: req.params.id })
      .sort({ createdAt: -1 })
      .populate('user', 'name')
      .populate('product', 'name');
    
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 
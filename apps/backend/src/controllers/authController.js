import User from '../models/User.js';
import Customer from '../models/Customer.js';
import generateToken from '../utils/generateToken.js';

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user (default role is 'user')
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      // Create a customer record for the user
      if (address) {
        await Customer.create({
          name,
          email,
          phone: phone || '',
          address: {
            street: address.street || '',
            city: address.city || '',
            state: address.state || '',
            postalCode: address.postalCode || '',
            country: address.country || 'United States',
          },
          user: user._id,
        });
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Authenticate user & get token
 * @route POST /api/auth/login
 * @access Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      // Only allow users with 'user' role to login through this endpoint
      if (user.role !== 'user') {
        return res.status(403).json({ message: 'Access denied. Please use the admin login.' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Authenticate admin/subadmin & get token
 * @route POST /api/auth/admin/login
 * @access Public
 */
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      // Only allow admins and subadmins to login through this endpoint
      if (user.role !== 'admin' && user.role !== 'subadmin') {
        return res.status(403).json({ message: 'Access denied. Please use the user login.' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get user profile
 * @route GET /api/auth/profile
 * @access Private
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create or update customer profile
 * @route POST /api/auth/create-profile
 * @access Private
 */
export const createCustomerProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    // Check if customer already exists for this user
    let customer = await Customer.findOne({ user: req.user._id });
    
    if (customer) {
      // Update existing customer
      customer.name = name || customer.name;
      customer.phone = phone || customer.phone;
      
      if (address) {
        customer.address = {
          street: address.street || customer.address.street,
          city: address.city || customer.address.city,
          state: address.state || customer.address.state,
          postalCode: address.postalCode || customer.address.postalCode,
          country: address.country || customer.address.country || 'United States',
        };
      }
      
      await customer.save();
      
      res.json({
        message: 'Customer profile updated',
        customer
      });
    } else {
      // Create new customer profile
      customer = await Customer.create({
        name: name || req.user.name,
        email: req.user.email,
        phone: phone || '',
        address: {
          street: address?.street || '',
          city: address?.city || '',
          state: address?.state || '',
          postalCode: address?.postalCode || '',
          country: address?.country || 'United States',
        },
        user: req.user._id,
      });
      
      res.status(201).json({
        message: 'Customer profile created',
        customer
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 
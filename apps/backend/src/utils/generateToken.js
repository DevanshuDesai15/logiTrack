import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Generate a JWT token for a user
 * @param {string} userId - The user's ID
 * @param {string} role - The user's role
 * @returns {string} JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'fallback_jwt_secret_do_not_use_in_production',
    {
      expiresIn: '30d',
    }
  );
};

export default generateToken; 
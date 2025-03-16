import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

// Custom hook to use the auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  
  // For backward compatibility with components using currentUser
  // and to keep names consistent
  return {
    ...context,
    currentUser: context.user
  };
};

export default useAuth; 
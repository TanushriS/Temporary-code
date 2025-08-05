import { createContext, useContext } from 'react';

// Create the context
const ThermoSenseContext = createContext();

// Custom hook for easy access
export const useThermoSense = () => useContext(ThermoSenseContext);

// Export the context itself and the Provider
export default ThermoSenseContext;

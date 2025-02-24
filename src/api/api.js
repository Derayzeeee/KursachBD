// api.js
const API_URL = 'http://localhost:3001/api';

export const getProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/pages`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};
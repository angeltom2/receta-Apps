const API = 'https://www.themealdb.com/api/json/v1/1';

export default {
  getCategories: async () => {
    const res = await fetch(`${API}/categories.php`);
    return res.json(); // { categories: [...] }
  },

  getMealsByCategory: async (category) => {
    const res = await fetch(`${API}/filter.php?c=${encodeURIComponent(category)}`);
    return res.json(); // { meals: [...] }
  },

  getMealDetails: async (id) => {
    const res = await fetch(`${API}/lookup.php?i=${encodeURIComponent(id)}`);
    return res.json(); // { meals: [ {...} ] }
  }
};

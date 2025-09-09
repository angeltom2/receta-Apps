import MealService from '../services/MealService';

export default {
  getCategories: async () => {
    const data = await MealService.getCategories();
    return data.categories || [];
  },

  getMealsByCategory: async (category) => {
    const data = await MealService.getMealsByCategory(category);
    return data.meals || [];
  },

  getMealDetails: async (id) => {
    const data = await MealService.getMealDetails(id);
    return (data.meals && data.meals[0]) || null;
  }
};

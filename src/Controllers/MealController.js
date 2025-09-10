// src/controllers/MealController.js
import MealService from '../services/MealService';

export default {
  getCategories: async () => {
    return await MealService.getCategories();
  },

  getMealsGroupedByArea: async (category) => {
    const meals = await MealService.getMealsByCategoryWithArea(category);
    const groups = {};
    for (const meal of meals) {
      const area = meal.strArea || "Unknown";
      if (!groups[area]) groups[area] = [];
      groups[area].push(meal);
    }

    const sectionPromises = Object.keys(groups).map(async (area) => {
      const countryInfo = await MealService.getCountryInfo(area);
      return {
        title: area,
        countryInfo,
        data: groups[area],
      };
    });

    const sections = await Promise.all(sectionPromises);
    sections.sort((a, b) => a.title.localeCompare(b.title));
    return sections;
  },

  getMealDetails: async (id) => {
    return await MealService.getMealDetails(id);
  },

  getMealsByIngredients: async (include, exclude) => {
    const results = await MealService.searchMealsByIngredients(include, exclude);
    return [
      {
        title: "Resultados",
        data: results,
      },
    ];
  },
};

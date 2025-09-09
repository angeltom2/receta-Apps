// src/controllers/MealController.js
import MealService from '../services/MealService';

export default {
  getCategories: async () => {
    return await MealService.getCategories();
  },

  // devuelve un array de secciones: [{ title: area, countryInfo, data: [meals...] }]
  getMealsGroupedByArea: async (category) => {
    const meals = await MealService.getMealsByCategoryWithArea(category);
    // agrupar por area
    const groups = {};
    for (const meal of meals) {
      const area = meal.strArea || "Unknown";
      if (!groups[area]) groups[area] = [];
      groups[area].push(meal);
    }

    // construir sections con countryInfo
    const sectionPromises = Object.keys(groups).map(async (area) => {
      const countryInfo = await MealService.getCountryInfo(area);
      return {
        title: area,
        countryInfo,
        data: groups[area]
      };
    });

    const sections = await Promise.all(sectionPromises);
    // opcional: ordenar secciones por título
    sections.sort((a, b) => a.title.localeCompare(b.title));
    return sections;
  },

  getMealDetails: async (id) => {
    return await MealService.getMealDetails(id);
  }
};


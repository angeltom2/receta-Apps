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

  /**
   * getMealsByIngredients(include, exclude)
   * - include: string "chicken, beef" -> busca recetas que contengan TODOS los ingredientes (intersección)
   * - exclude: string "pork, onion" -> filtra por ingredientes reales dentro de la receta (no solo nombre)
   *
   * Retorna un array de secciones: [{ title: 'Resultados', data: [...] }]
   */
  getMealsByIngredients: async (include, exclude) => {
    // normalizar listas
    const includes = include
      ? include.split(',').map(i => i.trim().toLowerCase()).filter(Boolean)
      : [];
    const excludes = exclude
      ? exclude.split(',').map(i => i.trim().toLowerCase()).filter(Boolean)
      : [];

    // Si no hay includes, no podemos buscar eficientemente (evitamos traer *todas* las recetas)
    if (includes.length === 0) {
      return [{ title: "Resultados", data: [] }];
    }

    // 1) Para cada ingrediente incluido, pedir la lista básica (filter.php?i=...)
    const sets = [];
    for (const ing of includes) {
      try {
        const res = await MealService.getMealsByIngredient(ing);
        sets.push(res || []);
      } catch (err) {
        console.warn("Error obteniendo por ingrediente:", ing, err.message);
        sets.push([]);
      }
    }

    // 2) Intersección: quedarnos solo con los idMeal que aparecen en todas las listas
    let intersection = [];
    if (sets.length > 0) {
      // starts from first set
      intersection = sets[0];
      for (let i = 1; i < sets.length; i++) {
        const current = sets[i];
        intersection = intersection.filter(a => current.some(b => b.idMeal === a.idMeal));
      }
    }

    // 3) Si hay exclusiones, cargar detalles y filtrar por ingredientes reales
    let final = intersection;
    if (excludes.length > 0 && final.length > 0) {
      // cargar detalles (lookup) para cada receta en 'final'
      const details = await Promise.all(final.map(m => MealService.getMealDetails(m.idMeal)));
      const filtered = [];

      for (let d of details) {
        if (!d) continue;
        // construir lista de ingredientes en minúsculas
        const ingList = [];
        for (let i = 1; i <= 20; i++) {
          const ing = d[`strIngredient${i}`];
          if (ing && ing.trim()) ingList.push(ing.toLowerCase());
        }

        // si alguna exclusión está incluida en ingList (substring), descartamos
        const hasExcluded = excludes.some(ex => ingList.some(ing => ing.includes(ex)));
        if (!hasExcluded) {
          // recuperar el objeto básico (idMeal, strMeal, strMealThumb)
          const basic = final.find(x => x.idMeal === d.idMeal);
          if (basic) filtered.push(basic);
        }
      }

      final = filtered;
    }

    // 4) eliminar duplicados por id (precaución)
    const unique = {};
    for (const m of final) {
      unique[m.idMeal] = m;
    }
    const resultArray = Object.values(unique);

    return [
      {
        title: "Resultados",
        data: resultArray,
      },
    ];
  },
};


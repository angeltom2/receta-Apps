// src/services/MealService.js
const API_MEAL = "https://www.themealdb.com/api/json/v1/1";
const API_COUNTRIES = "https://restcountries.com/v3.1";

const areaToCountryMap = {
  "American": "United States",
  "British": "United Kingdom",
  "Chinese": "China",
  "Canadian": "Canada",
  "Italian": "Italy",
  "Spanish": "Spain",
  "Mexican": "Mexico",
  "Thai": "Thailand",
  "Japanese": "Japan",
  "Irish": "Ireland",
  "French": "France",
  "Greek": "Greece",
  "Moroccan": "Morocco",
  "Indian": "India",
};

const countryCache = {};

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${url}`);
  return res.json();
}

// 👉 Categorías
async function getCategories() {
  const data = await fetchJson(`${API_MEAL}/categories.php`);
  return data.categories || [];
}

// 👉 Comidas por categoría (básico)
async function getMealsByCategoryBasic(category) {
  const data = await fetchJson(`${API_MEAL}/filter.php?c=${encodeURIComponent(category)}`);
  return data.meals || [];
}

// 👉 Detalles por ID
async function getMealDetails(id) {
  const data = await fetchJson(`${API_MEAL}/lookup.php?i=${encodeURIComponent(id)}`);
  return (data.meals && data.meals[0]) || null;
}

// 👉 Comidas con categoría + área
async function getMealsByCategoryWithArea(category) {
  const basic = await getMealsByCategoryBasic(category);
  const detailsPromises = basic.map(m => getMealDetails(m.idMeal));
  const details = await Promise.all(detailsPromises);

  return details.filter(Boolean).map(d => ({
    idMeal: d.idMeal,
    strMeal: d.strMeal,
    strMealThumb: d.strMealThumb,
    strCategory: d.strCategory,
    strArea: d.strArea,
    strInstructions: d.strInstructions,
  }));
}

// 👉 Info de país según área
async function getCountryInfo(area) {
  if (!area) return null;
  const countryName = areaToCountryMap[area] || area;
  if (countryCache[countryName]) return countryCache[countryName];

  try {
    const data = await fetchJson(`${API_COUNTRIES}/name/${encodeURIComponent(countryName)}?fullText=false`);
    if (Array.isArray(data) && data.length > 0) {
      const c = data[0];
      const info = {
        name: c.name?.common || countryName,
        flag: c.flags?.png || c.flags?.svg || null,
        region: c.region || null,
        population: c.population || null
      };
      countryCache[countryName] = info;
      return info;
    }
  } catch (err) {
    console.warn("RESTCountries fallo para:", countryName, err.message);
  }
  return null;
}

// 👉 Buscar por ingredientes
async function getMealsByIngredient(ingredient) {
  const data = await fetchJson(`${API_MEAL}/filter.php?i=${encodeURIComponent(ingredient)}`);
  return data.meals || [];
}

export default {
  getCategories,
  getMealsByCategoryBasic,
  getMealDetails,
  getMealsByCategoryWithArea,
  getCountryInfo,
  getMealsByIngredient, // ✅ añadida
};

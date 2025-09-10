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
let allMealsCache = null; 

/* util fetch */
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


async function getMealsByIngredient(ingredient) {
  const data = await fetchJson(`${API_MEAL}/filter.php?i=${encodeURIComponent(ingredient)}`);
  return data.meals || [];
}


async function fetchAllMealsDetailed() {
  if (allMealsCache) return allMealsCache;

  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  const all = [];

  for (const letter of letters) {
    try {
      const data = await fetchJson(`${API_MEAL}/search.php?f=${letter}`);
      if (data && Array.isArray(data.meals)) {
        all.push(...data.meals);
      }
    } catch (err) {
      // no abortar por errores puntuales en una letra
      console.warn(`Error fetching letter ${letter}:`, err.message);
    }
  }

  // deduplicar por idMeal (por si acaso)
  const map = {};
  for (const m of all) {
    if (m && m.idMeal) map[m.idMeal] = m;
  }
  allMealsCache = Object.values(map);
  return allMealsCache;
}

// revisa si un detalle de receta (mealDetail) contiene alguno de los términos excluidos
function mealHasExcludedIngredient(mealDetail, excludesLower) {
  if (!mealDetail) return false;
  for (let i = 1; i <= 20; i++) {
    const ing = mealDetail[`strIngredient${i}`];
    if (ing && ing.trim()) {
      const lower = ing.toLowerCase();
      if (excludesLower.some(ex => lower.includes(ex))) return true;
    }
  }
  return false;
}


async function searchMealsByIngredients(include, exclude) {
  const includeArr = include
    ? include.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
    : [];
  const excludeArr = exclude
    ? exclude.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
    : [];

  // -------- Caso A: hay includes -> hacemos llamadas filter.php?i= por cada include y hacemos INTERSECCIÓN
  if (includeArr.length > 0) {
    // obtener sets básicos (id, name, thumb)
    const sets = [];
    for (const ing of includeArr) {
      try {
        const res = await getMealsByIngredient(ing);
        // API devuelve null si no hay coincidencias; asegurar array
        sets.push(res || []);
      } catch (err) {
        console.warn("Error getMealsByIngredient for", ing, err.message);
        sets.push([]);
      }
    }

    // intersección estricta: solo platos que aparecen en todas las listas
    let intersection = sets.length > 0 ? sets[0] : [];
    for (let i = 1; i < sets.length; i++) {
      intersection = intersection.filter(a => sets[i].some(b => b.idMeal === a.idMeal));
    }

    // si no hay exclusión, devolver intersection (deduplicado)
    if (excludeArr.length === 0) {
      const unique = {};
      for (const m of intersection) unique[m.idMeal] = m;
      return Object.values(unique);
    }

    // si hay exclusiones -> necesitamos detalles para filtrar por ingredientes reales
    const details = await Promise.all(intersection.map(m => getMealDetails(m.idMeal)));
    const filtered = [];
    for (const d of details) {
      if (!d) continue;
      const hasExcluded = mealHasExcludedIngredient(d, excludeArr);
      if (!hasExcluded) {
        filtered.push({ idMeal: d.idMeal, strMeal: d.strMeal, strMealThumb: d.strMealThumb });
      }
    }
    return filtered;
  }

  // -------- Caso B: NO includes pero SÍ excludes -> debemos traer *todas* las recetas y filtrar
  if (excludeArr.length > 0) {
    // traer todas (por primera letra) - detalles completos para cada plato
    const allDetailed = await fetchAllMealsDetailed(); // array de objetos con ingredientes
    // filtrar por exclusiones (buscando substrings en ingredientes)
    const filtered = allDetailed.filter(d => !mealHasExcludedIngredient(d, excludeArr));
    // map a la forma básica
    return filtered.map(d => ({ idMeal: d.idMeal, strMeal: d.strMeal, strMealThumb: d.strMealThumb }));
  }

  // -------- Caso C: sin include ni exclude -> devolver vacío (sin criterio)
  return [];
}

/* ---------- exports ---------- */
export default {
  getCategories,
  getMealsByCategoryBasic,
  getMealDetails,
  getMealsByCategoryWithArea,
  getCountryInfo,
  getMealsByIngredient,
  searchMealsByIngredients, // <-- nueva función robusta
};


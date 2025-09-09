// src/screens/RecipeDetailScreen.js
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  Image,
  ActivityIndicator,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import MealController from "../Controllers/MealController";
import MealService from "../services/MealService";
import { useFavorites } from "../store/FavoritesContext";

export default function RecipeDetailScreen({ route }) {
  const { mealId } = route.params;
  const [meal, setMeal] = useState(null);
  const [countryInfo, setCountryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  // ---- personas: texto + número ----
  const [people, setPeople] = useState(1);        // número válido
  const [peopleText, setPeopleText] = useState("1"); // texto editable

  // baseServings será inferido por receta (si es posible)
  const [baseServings, setBaseServings] = useState(1);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await MealController.getMealDetails(mealId);
        if (!mounted) return;
        setMeal(data);

        // inferir base de porciones y setear people / peopleText si no lo cambió el usuario
        const inferred = inferBaseServings(data);
        setBaseServings(inferred);
        setPeople(inferred);
        setPeopleText(String(inferred));

        const area = data?.strArea;
        if (area) {
          const c = await MealService.getCountryInfo(area);
          if (mounted) setCountryInfo(c);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [mealId]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  if (!meal) return <Text style={{ padding: 16 }}>Receta no encontrada</Text>;

  // construir lista visible de ingredientes "measure + ingredient"
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];
    if (ing && ing.trim()) ingredients.push(`${meas ? meas + " " : ""}${ing}`);
  }

  // ---- funciones para parsear y escalar cantidades ----

  // intenta extraer y convertir cantidades comunes:
  // - mixed "1 1/2"
  // - fraction "1/2"
  // - range "4-5" -> usa promedio
  // - decimal "1.5" or integer "2"
  function parseQuantity(str) {
    if (!str) return null;

    // mixed "1 1/2"
    const mixed = str.match(/(\d+)\s+(\d+)\/(\d+)/);
    if (mixed) {
      const whole = parseInt(mixed[1], 10);
      const num = parseInt(mixed[2], 10);
      const den = parseInt(mixed[3], 10);
      if (den !== 0) return whole + num / den;
    }

    // fraction "1/2"
    const frac = str.match(/(\d+)\/(\d+)/);
    if (frac) {
      const num = parseInt(frac[1], 10);
      const den = parseInt(frac[2], 10);
      if (den !== 0) return num / den;
    }

    // range "4-5" or "4 - 5"
    const range = str.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
    if (range) {
      const a = parseFloat(range[1]);
      const b = parseFloat(range[2]);
      return (a + b) / 2;
    }

    // decimal or integer
    const dec = str.match(/(\d+(?:\.\d+)?)/);
    if (dec) {
      return parseFloat(dec[1]);
    }

    return null;
  }

  function formatNumber(n) {
    if (n == null || Number.isNaN(n)) return String(n);
    if (Math.abs(n - Math.round(n)) < 0.01) return String(Math.round(n));
    if (Math.abs(n * 10 - Math.round(n * 10)) < 0.01)
      return (Math.round(n * 10) / 10).toFixed(1);
    return n.toFixed(2);
  }

  function scaleIngredient(ingredient) {
    // busca la primera aparición de cantidad en la cadena
    const matchMixed = ingredient.match(/(\d+\s+\d+\/\d+)/);
    const matchFraction = ingredient.match(/(\d+\/\d+)/);
    const matchRange = ingredient.match(/(\d+(?:\.\d+)?\s*-\s*\d+(?:\.\d+)?)/);
    const matchNumber = ingredient.match(/(\d+(?:\.\d+)?)/);

    const token = matchMixed?.[0] || matchFraction?.[0] || matchRange?.[0] || matchNumber?.[0];

    if (!token) return ingredient; // nada que escalar

    const qty = parseQuantity(token);
    if (qty == null) return ingredient;

    // calcular scaled
    const scaled = (qty * people) / (baseServings || 1);
    const scaledStr = formatNumber(scaled);

    // reemplazar solo la primera aparición del token
    return ingredient.replace(token, scaledStr);
  }

  // ---- manejo del input de personas (mejor UX que forzar 1 al borrar) ----
  const onPeopleTextChange = (text) => {
    // permitir que el usuario borre y escriba; sólo actualizamos peopleNumber en onEndEditing
    setPeopleText(text);
  };

  const applyPeopleText = () => {
    // parsear texto al salir del input
    const n = parseInt(peopleText, 10);
    if (!n || n < 1) {
      // si no es válido, restauramos el valor anterior
      setPeopleText(String(people));
    } else {
      setPeople(n);
      setPeopleText(String(n));
    }
  };

  const incrementPeople = () => {
    const next = (people || 1) + 1;
    setPeople(next);
    setPeopleText(String(next));
  };

  const decrementPeople = () => {
    const next = Math.max(1, (people || 1) - 1);
    setPeople(next);
    setPeopleText(String(next));
  };

  return (
    <ScrollView style={{ padding: 16, backgroundColor: "#fdfdfd" }}>
      <Image
        source={{ uri: meal.strMealThumb }}
        style={styles.image}
        resizeMode="cover"
      />

      <Text style={styles.title}>{meal.strMeal}</Text>

      <View style={styles.metaRow}>
        {countryInfo?.flag ? (
          <Image
            source={{ uri: countryInfo.flag }}
            style={{ width: 40, height: 25, marginRight: 8 }}
          />
        ) : null}
        <Text style={styles.metaText}>
          {meal.strArea || "Origen desconocido"}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.favoriteButton,
          isFavorite(meal.idMeal) && styles.favoriteActive,
        ]}
        onPress={() =>
          isFavorite(meal.idMeal)
            ? removeFavorite(meal.idMeal)
            : addFavorite(meal)
        }
      >
        <Text style={styles.favoriteText}>
          {isFavorite(meal.idMeal)
            ? "💔 Quitar de Favoritos"
            : "❤️ Agregar a Favoritos"}
        </Text>
      </TouchableOpacity>

      {/* ---------- Selector de personas: stepper + input ---------- */}
      <View style={styles.peopleContainer}>
        <Text style={styles.peopleLabel}>Número de personas:</Text>

        <View style={styles.stepperRow}>
          <TouchableOpacity style={styles.stepBtn} onPress={decrementPeople}>
            <Text style={styles.stepText}>-</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.peopleInput}
            keyboardType="numeric"
            value={peopleText}
            onChangeText={onPeopleTextChange}
            onEndEditing={applyPeopleText}
            onSubmitEditing={applyPeopleText}
            returnKeyType="done"
            maxLength={3}
          />

          <TouchableOpacity style={styles.stepBtn} onPress={incrementPeople}>
            <Text style={styles.stepText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.baseText}>Base detectada: {baseServings} persona(s)</Text>
      </View>

      <Text style={styles.sectionTitle}>
        🥗 Ingredientes (para {people} persona{people > 1 ? "s" : ""})
      </Text>
      {ingredients.map((ing, idx) => (
        <Text key={idx} style={styles.ingredient}>
          • {scaleIngredient(ing)}
        </Text>
      ))}

      <Text style={styles.sectionTitle}>👨‍🍳 Preparación</Text>
      <Text style={styles.instructions}>{meal.strInstructions}</Text>
    </ScrollView>
  );
}

/* ---------- helpers fuera del componente ---------- */

// intenta inferir base de porciones desde las instrucciones u otras pistas
function inferBaseServings(meal) {
  if (!meal) return 1;
  const text = (meal.strInstructions || "").toLowerCase();

  // patrones comunes: "serves 4", "serves: 4", "makes 6", "serves 4 people"
  const p1 = text.match(/serves[:\s]*([0-9]{1,2})/i);
  if (p1 && p1[1]) return parseInt(p1[1], 10);

  const p2 = text.match(/makes[:\s]*([0-9]{1,2})/i);
  if (p2 && p2[1]) return parseInt(p2[1], 10);

  const p3 = text.match(/for\s+([0-9]{1,2})\s+people/i);
  if (p3 && p3[1]) return parseInt(p3[1], 10);

  // buscar números en medidas (si se ve claramente un número grande en una medida, no es determinante)
  // fallback: 1 persona
  return 1;
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 240,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 12,
    color: "#2c3e50",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  metaText: {
    fontWeight: "600",
    fontSize: 16,
    color: "#34495e",
  },
  favoriteButton: {
    marginTop: 16,
    backgroundColor: "#e74c3c",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  favoriteActive: {
    backgroundColor: "#95a5a6",
  },
  favoriteText: {
    color: "white",
    fontWeight: "700",
  },

  /* people */
  peopleContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  peopleLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepBtn: {
    width: 42,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#2980b9",
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },
  peopleInput: {
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    width: 70,
    textAlign: "center",
    fontSize: 16,
  },
  baseText: {
    marginTop: 8,
    color: "#7f8c8d",
    fontSize: 13,
  },

  sectionTitle: {
    marginTop: 18,
    fontWeight: "700",
    fontSize: 18,
    color: "#2980b9",
    marginBottom: 8,
  },
  ingredient: {
    fontSize: 15,
    marginBottom: 6,
    color: "#2c3e50",
  },
  instructions: {
    marginTop: 8,
    lineHeight: 22,
    fontSize: 15,
    color: "#555",
    textAlign: "justify",
  },
});


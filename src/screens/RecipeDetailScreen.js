// src/screens/RecipeDetailScreen.js
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  Image,
  ActivityIndicator,
  View,
  StyleSheet,
} from "react-native";
import MealController from "../Controllers/MealController";
import MealService from "../services/MealService";
import { useFavorites } from "../store/FavoritesContext";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function RecipeDetailScreen({ route }) {
  const { mealId } = route.params;
  const [meal, setMeal] = useState(null);
  const [countryInfo, setCountryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await MealController.getMealDetails(mealId);
        if (!mounted) return;
        setMeal(data);
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

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];
    if (ing && ing.trim())
      ingredients.push(`${meas ? meas + " " : ""}${ing}`);
  }

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
        <Text style={styles.metaText}>{meal.strArea || "Origen desconocido"}</Text>
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
          {isFavorite(meal.idMeal) ? "💔 Quitar de Favoritos" : "❤️ Agregar a Favoritos"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>🥗 Ingredientes</Text>
      {ingredients.map((ing, idx) => (
        <Text key={idx} style={styles.ingredient}>
          • {ing}
        </Text>
      ))}

      <Text style={styles.sectionTitle}>👨‍🍳 Preparación</Text>
      <Text style={styles.instructions}>{meal.strInstructions}</Text>
    </ScrollView>
  );
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
  sectionTitle: {
    marginTop: 18,
    fontWeight: "700",
    fontSize: 18,
    color: "#2980b9",
    marginBottom: 8,
  },
  ingredient: {
    fontSize: 15,
    marginBottom: 4,
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

// src/screens/FavoritesScreen.js
import React from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useFavorites } from "../store/FavoritesContext";

export default function FavoritesScreen({ navigation }) {
  const { favorites, removeFavorite } = useFavorites();

  if (favorites.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No tienes recetas en favoritos aún 🍽️</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favorites}
      keyExtractor={(item) => item.idMeal}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate("RecipeDetail", { mealId: item.idMeal })}
          style={styles.card}
        >
          <Image source={{ uri: item.strMealThumb }} style={styles.thumb} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.title}>{item.strMeal}</Text>
            <TouchableOpacity onPress={() => removeFavorite(item.idMeal)}>
              <Text style={styles.remove}>Quitar de favoritos ❌</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  thumb: { width: 80, height: 80, borderRadius: 8 },
  title: { fontSize: 16, fontWeight: "600" },
  remove: { color: "red", marginTop: 4 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, fontWeight: "500", color: "#555" },
});

// src/store/FavoritesContext.js
import React, { createContext, useContext, useState } from "react";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  const addFavorite = (meal) => {
    setFavorites((prev) => {
      if (prev.find((item) => item.idMeal === meal.idMeal)) return prev; // evitar duplicados
      return [...prev, meal];
    });
  };

  const removeFavorite = (mealId) => {
    setFavorites((prev) => prev.filter((item) => item.idMeal !== mealId));
  };

  const isFavorite = (mealId) => {
    return favorites.some((item) => item.idMeal === mealId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}

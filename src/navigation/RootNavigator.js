// src/navigation/RootNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import RecipeListScreen from "../screens/RecipeListScreen";
import RecipeDetailScreen from "../screens/RecipeDetailScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import SearchByIngredientScreen from "../screens/SearchByIngredientScreen";
import ListaComprasScreen from "../screens/ListaComprasScreens";
import MisRecetasScreen from "../screens/MyRecipesScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Recetas" }}
      />
      <Stack.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ title: "Categorías" }}
      />
      <Stack.Screen
        name="RecipeList"
        component={RecipeListScreen}
        options={({ route }) => ({
          title: route.params?.category || "Recetas",
        })}
      />
      <Stack.Screen
        name="RecipeDetail"
        component={RecipeDetailScreen}
        options={{ title: "Detalle" }}
      />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Inicio") iconName = "home";
          else if (route.name === "Favorites") iconName = "star";
          else if (route.name === "Buscar") iconName = "search";
          else if (route.name === "Compras") iconName = "cart";
          else if (route.name === "MisRecetas") iconName = "book";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeStack}
        options={{ title: "Inicio" }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: "Favoritos" }}
      />
      <Tab.Screen
        name="Buscar"
        component={SearchByIngredientScreen}
        options={{ title: "Buscar" }}
      />
      <Tab.Screen
        name="Compras"
        component={ListaComprasScreen}
        options={{ title: "Compras" }}
      />
      <Tab.Screen
        name="MisRecetas"
        component={MisRecetasScreen}
        options={{ title: "Mis Recetas" }}
      />
    </Tab.Navigator>
  );
}

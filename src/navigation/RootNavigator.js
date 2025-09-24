import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import RecipeListScreen from '../screens/RecipeListScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SearchByIngredientScreen from '../screens/SearchByIngredientScreen';
import ListaComprasScreen from '../screens/ListaComprasScreens';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Recetas' }} />
      <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Categorías' }} />
      <Stack.Screen name="RecipeList" component={RecipeListScreen} options={({route}) => ({ title: route.params?.category || 'Recetas' })} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: 'Detalle' }} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Mis Favoritos' }} />
      <Stack.Screen name="SearchByIngredient" component={SearchByIngredientScreen} options={{ title: 'Buscar por Ingredientes' }} /> 
      <Stack.Screen name="ListaCompras" component={ListaComprasScreen} options={{ title: "Lista de Compras" }} />
    </Stack.Navigator>
  );
}

import React, { useEffect, useState } from 'react';
import { SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import MealController from '../Controllers/MealController';
import RecipeCard from '../assets/components/RecipeCard';

export default function RecipeListScreen({ route, navigation }) {
  const { category } = route.params;
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await MealController.getMealsByCategory(category);
        setMeals(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [category]);

  if (loading) return <ActivityIndicator style={{flex:1}} size="large" />;

  return (
    <SafeAreaView style={{flex:1, padding: 12}}>
      <FlatList
        data={meals}
        keyExtractor={(item) => item.idMeal}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('RecipeDetail', { mealId: item.idMeal })}>
            <RecipeCard meal={item} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

import React, { useEffect, useState } from 'react';
import { ScrollView, Text, Image, ActivityIndicator } from 'react-native';
import MealController from '../Controllers/MealController';

export default function RecipeDetailScreen({ route }) {
  const { mealId } = route.params;
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await MealController.getMealDetails(mealId);
        setMeal(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [mealId]);

  if (loading) return <ActivityIndicator style={{flex:1}} size="large" />;
  if (!meal) return <Text style={{padding:16}}>Receta no encontrada</Text>;

  // extraer ingredientes
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];
    if (ing && ing.trim()) ingredients.push(`${meas ? meas + ' ' : ''}${ing}`);
  }

  return (
    <ScrollView style={{padding: 12}}>
      <Image source={{ uri: meal.strMealThumb }} style={{ width: '100%', height: 220, borderRadius: 8 }} />
      <Text style={{ fontSize: 22, fontWeight: '700', marginTop: 12 }}>{meal.strMeal}</Text>
      <Text style={{ marginTop: 10, fontWeight: '600' }}>Ingredientes:</Text>
      {ingredients.map((ing, idx) => <Text key={idx}>• {ing}</Text>)}
      <Text style={{ marginTop: 10, fontWeight: '600' }}>Preparación:</Text>
      <Text style={{ marginTop: 6, lineHeight: 20 }}>{meal.strInstructions}</Text>
    </ScrollView>
  );
}

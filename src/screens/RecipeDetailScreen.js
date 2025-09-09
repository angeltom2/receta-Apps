// src/screens/RecipeDetailScreen.js
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, Image, ActivityIndicator, View, StyleSheet } from 'react-native';
import MealController from '../Controllers/MealController';
import MealService from '../services/MealService';

export default function RecipeDetailScreen({ route }) {
  const { mealId } = route.params;
  const [meal, setMeal] = useState(null);
  const [countryInfo, setCountryInfo] = useState(null);
  const [loading, setLoading] = useState(true);

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
    return () => mounted = false;
  }, [mealId]);

  if (loading) return <ActivityIndicator style={{flex:1}} size="large" />;

  if (!meal) return <Text style={{padding:16}}>Receta no encontrada</Text>;

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];
    if (ing && ing.trim()) ingredients.push(`${meas ? meas + ' ' : ''}${ing}`);
  }

  return (
    <ScrollView style={{padding:12}}>
      <Image source={{ uri: meal.strMealThumb }} style={{ width: '100%', height: 220, borderRadius: 8 }} />
      <Text style={styles.title}>{meal.strMeal}</Text>

      <View style={{flexDirection:'row', alignItems:'center', marginTop:8}}>
        {countryInfo?.flag ? <Image source={{ uri: countryInfo.flag }} style={{ width: 40, height: 25, marginRight:8 }} /> : null}
        <Text style={{fontWeight:'600'}}>{meal.strArea || 'Origen desconocido'}</Text>
      </View>

      <Text style={{ marginTop: 10, fontWeight: '600' }}>Ingredientes:</Text>
      {ingredients.map((ing, idx) => <Text key={idx}>• {ing}</Text>)}

      <Text style={{ marginTop: 10, fontWeight: '600' }}>Preparación:</Text>
      <Text style={{ marginTop: 6, lineHeight: 20 }}>{meal.strInstructions}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', marginTop: 12 }
});

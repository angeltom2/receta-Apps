import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function RecipeCard({ meal }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: meal.strMealThumb }} style={styles.image} />
      <View style={{ padding: 8 }}>
        <Text style={styles.title}>{meal.strMeal}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', marginVertical: 8, borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff', elevation: 1 },
  image: { width: 120, height: 90 },
  title: { fontWeight: '600' }
});

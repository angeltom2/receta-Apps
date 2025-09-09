import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';

const w = (Dimensions.get('window').width / 2) - 24;

export default function CategoryCard({ category }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: category.strCategoryThumb }} style={styles.image} />
      <Text style={styles.title}>{category.strCategory}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: w,
    margin: 6,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
  },
  image: { width: '100%', height: 120 },
  title: { padding: 8, fontWeight: 'bold', textAlign: 'center' }
});

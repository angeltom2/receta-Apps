// src/screens/RecipeListScreen.js
import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, SectionList, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import MealController from '../Controllers/MealController';

export default function RecipeListScreen({ route, navigation }) {
  const { category } = route.params;
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const s = await MealController.getMealsGroupedByArea(category);
        if (mounted) setSections(s);
      } catch (err) {
        console.error("Error cargando recetas agrupadas:", err);
        if (mounted) setError(err.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => mounted = false;
  }, [category]);

  if (loading) return <ActivityIndicator style={{flex:1}} size="large" />;

  if (error) return (
    <SafeAreaView style={styles.center}>
      <Text>Error: {error}</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{flex:1}}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.idMeal}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('RecipeDetail', { mealId: item.idMeal })}>
            <Image source={{ uri: item.strMealThumb }} style={styles.thumb} />
            <Text style={styles.title}>{item.strMeal}</Text>
          </TouchableOpacity>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.header}>
            {section.countryInfo?.flag ? (
              <Image source={{ uri: section.countryInfo.flag }} style={styles.flag} />
            ) : null}
            <Text style={styles.headerText}>{section.title}</Text>
          </View>
        )}
        ListEmptyComponent={() => <Text style={{padding:16}}>No hay recetas</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#eee' },
  headerText: { fontWeight: '700', marginLeft: 8 },
  flag: { width: 28, height: 18, resizeMode: 'cover', borderRadius: 2 },
  item: { flexDirection: 'row', padding: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  thumb: { width: 80, height: 60, borderRadius: 6, marginRight: 12 },
  title: { fontSize: 16, flexShrink: 1 }
});

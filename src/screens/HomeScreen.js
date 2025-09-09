import React, { useEffect, useState } from 'react';
import { SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import MealController from '../Controllers/MealController';
import CategoryCard from '../assets/components/categoryCard';

export default function HomeScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const cats = await MealController.getCategories();
        setCategories(cats);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <ActivityIndicator style={{flex:1}} size="large" />;

  return (
    <SafeAreaView style={{flex:1, padding: 12}}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.idCategory}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('RecipeList', { category: item.strCategory })}>
            <CategoryCard category={item} />
          </TouchableOpacity>
        )}
        numColumns={2}
      />
    </SafeAreaView>
  );
}

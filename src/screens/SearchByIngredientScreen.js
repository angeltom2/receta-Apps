// src/screens/SearchByIngredientsScreen.js
import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

export default function SearchByIngredientsScreen({ navigation }) {
  const [include, setInclude] = useState("");
  const [exclude, setExclude] = useState("");

  const handleSearch = () => {
    navigation.navigate("RecipeList", {
      includeIngredients: include,
      excludeIngredients: exclude,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>🔍 Buscar por Ingredientes</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ingredientes a Incluir:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: chicken, beef..."
              value={include}
              onChangeText={setInclude}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ingredientes a Excluir:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: pork, onion..."
              value={exclude}
              onChangeText={setExclude}
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSearch}>
            <Text style={styles.buttonText}>🍽️ Buscar Recetas</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: "#2c3e50",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    color: "#34495e",
  },
  input: {
    borderWidth: 1,
    borderColor: "#dcdcdc",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#3498db",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});

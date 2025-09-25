// src/screens/SearchByIngredientsScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";

export default function SearchByIngredientsScreen({ navigation }) {
  const [include, setInclude] = useState("");
  const [exclude, setExclude] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    // Trim para evitar params vacíos con espacios
    const includeTrim = (include || "").trim();
    const excludeTrim = (exclude || "").trim();

    if (!includeTrim && !excludeTrim) {
      Alert.alert("Atención", "Ingresa al menos un ingrediente para incluir o excluir.");
      return;
    }

    setLoading(true);

    navigation.navigate("Inicio", {
      screen: "RecipeList",
      params: {
        includeIngredients: includeTrim,
        excludeIngredients: excludeTrim,
      },
    });

    setTimeout(() => setLoading(false), 600);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
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
              placeholder="Ej: chicken, beef"
              value={include}
              onChangeText={setInclude}
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ingredientes a Excluir:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: pork, onion"
              value={exclude}
              onChangeText={setExclude}
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSearch} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>🍽️ Buscar Recetas</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 36 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: "#2c3e50",
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 15, fontWeight: "600", marginBottom: 6, color: "#34495e" },
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
    elevation: 3,
  },
  buttonText: { color: "white", fontWeight: "700", fontSize: 16 },
});

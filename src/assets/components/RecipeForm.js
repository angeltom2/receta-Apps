import React, { useState, useEffect } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";

export default function RecipeForm({ onSubmit, initialData }) {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");


  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setIngredients(initialData.ingredients || "");
      setInstructions(initialData.instructions || "");
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      title,
      ingredients,
      instructions,
    });
    // Limpiar formulario si no es edición
    if (!initialData) {
      setTitle("");
      setIngredients("");
      setInstructions("");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Título de la receta"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Ingredientes (separados por coma)"
        value={ingredients}
        onChangeText={setIngredients}
      />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Instrucciones"
        multiline
        value={instructions}
        onChangeText={setInstructions}
      />
      <Button title={initialData ? "Actualizar" : "Agregar"} onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
});

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { FavoritesProvider } from "./src/store/FavoritesContext";

export default function App() {
  return (
    <FavoritesProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </FavoritesProvider>
  );
}

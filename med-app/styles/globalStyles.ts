// styles/globalStyles.ts

import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  // GLOBAL STYLES FOR THE APP HEADER AND TABS NAVIGATION BAR
  tabBar: {
    backgroundColor: '#ffffff', // TABS NAVIGATION BAR COLOR (light)
  },
  header: {
    backgroundColor: '#ffffff', // HEADER COLOR (light)
  },
  headerTint: {
    color: '#333', // HEADER TEXT COLOR
  },
  tabBarActiveTint: {
    color: '#6c5ce7', // TABS ACTIVE ICON COLOR (accent purple)
  },

  // GLOBAL STYLES FOR THE PAGES
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8', // NEW LIGHT BACKGROUND
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#333', // DARKER TEXT FOR LIGHT BACKGROUND
    fontSize: 16,
  },
});

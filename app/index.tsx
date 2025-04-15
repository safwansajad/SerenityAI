import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';

export default function LandingPage() {
  const router = useRouter();

  return (
    <ImageBackground 
      source={require('../assets/your-background-image.jpg')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.landingContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />

        <Text style={styles.heading}>SerenityAI</Text>
        <Text style={styles.subheading}>Your mental health assistant</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            console.log('📍 Button pressed');
            try {
              router.push('/homescreen'); // ✅ Keep this lowercase to match file path
            } catch (error) {
              console.error('🔥 Navigation error:', error);
              alert(`Navigation failed: ${error?.message || error}`);
            }
          }}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  landingContainer: {
    flex: 1,
    backgroundColor: 'rgba(79, 157, 232, 0.50)', // Ocean blue with 85% opacity
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  heading: {
    fontSize: 36,
    color: '#001F54', // Navy blue
    fontFamily: 'Poppins-Bold',
  },
  subheading: {
    fontSize: 18,
    color: '#001F54',
    fontFamily: 'Poppins-Regular',
    marginTop: 8,
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#001F54',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
});
import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';

const ProviderSearchScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, marginBottom: 20 }}>Provider Search Works!</Text>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ backgroundColor: '#10B981', padding: 15, borderRadius: 8 }}
        >
          <Text style={{ color: 'white' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProviderSearchScreen;
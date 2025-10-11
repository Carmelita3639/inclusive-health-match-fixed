// js/components/AiMatchChat.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Sample provider data for when Supabase isn't configured
const sampleProviders = [
  {
    npi: '1234567890',
    first_name: 'HAYDEE C.',
    last_name: 'BROWN',
    speciality: 'Foot and Ankle Surgery, Orthopaedic Surgery',
    gender: 'Female',
    cultural_identifiers: 'African-American',
    languages: ['English'],
    is_verified: true,
    lgbtq_affirming: false,
    board_certified: true,
    address: '40 Park Ave Ste 1, New York, NY 10016',
    phone: '646-455-1584',
  },
  {
    npi: '0987654321',
    first_name: 'ZOE B.',
    last_name: 'CHEUNG',
    speciality: 'Orthopaedic Trauma, Orthopaedic Surgery',
    gender: 'Female',
    cultural_identifiers: 'Asian',
    languages: ['English', 'Chinese'],
    is_verified: true,
    lgbtq_affirming: false,
    board_certified: true,
    address: '3333 Hylan Blvd., Staten Island, NY 10306',
    phone: '718-667-3333',
  }
];

const AiMatchChat = ({ navigation }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: "Hello! I'm your AI health match assistant.\nTell me the competencies you need — race/culture, gender, language(s), and specialty.",
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const scrollViewRef = useRef();

  // Auto scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Parse user query for search criteria
  const parseQuery = (query) => {
    const lowerQuery = query.toLowerCase();
    const criteria = {
      gender: null,
      specialty: null,
      cultural_identifiers: null,
      languages: null,
    };

    // Gender matching
    if (lowerQuery.includes('female') || lowerQuery.includes('woman')) {
      criteria.gender = 'Female';
    } else if (lowerQuery.includes('male') || lowerQuery.includes('man')) {
      criteria.gender = 'Male';
    }

    // Specialty matching
    const specialties = [
      'orthopedic', 'orthopaedic', 'cardiology', 'dermatology', 'psychiatry', 
      'pediatric', 'gynecology', 'oncology', 'neurology', 'surgery',
      'family medicine', 'internal medicine', 'emergency medicine'
    ];
    
    for (const specialty of specialties) {
      if (lowerQuery.includes(specialty)) {
        criteria.specialty = specialty;
        break;
      }
    }

    // Language matching
    const languages = ['spanish', 'chinese', 'hindi', 'arabic', 'french', 'russian'];
    for (const lang of languages) {
      if (lowerQuery.includes(lang)) {
        criteria.languages = lang;
        break;
      }
    }

    // Cultural identifiers
    const cultures = ['black', 'african american', 'hispanic', 'latino', 'asian', 'native american', 'middle eastern'];
    for (const culture of cultures) {
      if (lowerQuery.includes(culture)) {
        criteria.cultural_identifiers = culture;
        break;
      }
    }

    return criteria;
  };

  // Search providers (using sample data)
  const searchProviders = (criteria) => {
    let filtered = sampleProviders;

    // Apply filters based on criteria
    if (criteria.gender) {
      filtered = filtered.filter(p => 
        p.gender && p.gender.toLowerCase().includes(criteria.gender.toLowerCase())
      );
    }

    if (criteria.specialty) {
      filtered = filtered.filter(p => 
        p.speciality && p.speciality.toLowerCase().includes(criteria.specialty.toLowerCase())
      );
    }

    if (criteria.cultural_identifiers) {
      filtered = filtered.filter(p => 
        p.cultural_identifiers && p.cultural_identifiers.toLowerCase().includes(criteria.cultural_identifiers.toLowerCase())
      );
    }

    if (criteria.languages) {
      filtered = filtered.filter(p => 
        p.languages && p.languages.some(lang => 
          lang.toLowerCase().includes(criteria.languages.toLowerCase())
        )
      );
    }

    return filtered;
  };

  // Handle sending messages
  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    // Parse the query and search for providers
    const criteria = parseQuery(currentInput);
    const foundProviders = searchProviders(criteria);

    // Generate AI response
    let aiResponse = '';
    if (foundProviders.length > 0) {
      aiResponse = `I found ${foundProviders.length} healthcare provider${foundProviders.length > 1 ? 's' : ''} that match your criteria. Here are the results:`;
      setProviders(foundProviders);
    } else {
      aiResponse = "I couldn't find any providers that exactly match your criteria. Let me know if you'd like to try different search terms or expand your search parameters.";
      setProviders([]);
    }

    const aiMessage = {
      id: Date.now() + 1,
      type: 'ai',
      text: aiResponse,
      timestamp: new Date(),
    };

    setTimeout(() => {
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  // Quick response buttons
  const handleQuickResponse = (responseText) => {
    setInputText(responseText);
  };

  // Clear chat
  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'ai',
        text: "Hello! I'm your AI health match assistant.\nTell me the competencies you need — race/culture, gender, language(s), and specialty.",
        timestamp: new Date(),
      }
    ]);
    setProviders([]);
    setInputText('');
  };

  // Render provider cards
  const renderProviders = () => {
    if (providers.length === 0) return null;

    return (
      <View style={styles.providersContainer}>
        {providers.map((provider, index) => (
          <View key={provider.npi} style={styles.providerCard}>
            <Text style={styles.providerName}>
              {provider.first_name} {provider.last_name}, M.D.
            </Text>
            
            <View style={styles.providerInfo}>
              <Ionicons name="medical" size={16} color="#6B7280" />
              <Text style={styles.providerSpecialty}>
                Specialty: {provider.speciality}
              </Text>
            </View>

            {provider.address && (
              <View style={styles.providerInfo}>
                <Ionicons name="location-outline" size={16} color="#6B7280" />
                <Text style={styles.providerAddress}>{provider.address}</Text>
              </View>
            )}

            {provider.phone && (
              <View style={styles.providerInfo}>
                <Ionicons name="call-outline" size={16} color="#6B7280" />
                <Text style={styles.providerPhone}>{provider.phone}</Text>
              </View>
            )}

            <View style={styles.providerTags}>
              {provider.gender && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{provider.gender}</Text>
                </View>
              )}
              {provider.languages && provider.languages.length > 0 && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>
                    {provider.languages.join(', ')}
                  </Text>
                </View>
              )}
              {provider.cultural_identifiers && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{provider.cultural_identifiers}</Text>
                </View>
              )}
              {provider.is_verified && (
                <View style={[styles.tag, styles.verifiedTag]}>
                  <Text style={[styles.tagText, styles.verifiedTagText]}>Verified</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Render chat messages
  const renderMessage = (message) => {
    const isUser = message.type === 'user';
    
    return (
      <View key={message.id} style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.aiMessage
      ]}>
        <Text style={[
          styles.messageText,
          isUser ? styles.userMessageText : styles.aiMessageText
        ]}>
          {message.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>AI Health Match Assistant</Text>
          <Text style={styles.headerSubtitle}>Verified profiles appear first.</Text>
        </View>
        <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
          <Ionicons name="refresh-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
      >
        {messages.map(renderMessage)}
        
        {providers.length > 0 && renderProviders()}
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#10B981" />
            <Text style={styles.loadingText}>Processing your request...</Text>
          </View>
        )}

        {/* Quick Response Button */}
        {messages.length <= 2 && (
          <View style={styles.quickResponseContainer}>
            <TouchableOpacity 
              style={styles.quickResponseButton}
              onPress={() => handleQuickResponse('Female orthopedic surgeons')}
            >
              <Text style={styles.quickResponseText}>Female orthopedic surgeons</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask about finding physicians..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          onPress={handleSend}
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          disabled={!inputText.trim() || isLoading}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.navEmoji}>🏠</Text>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('ProviderSearchScreen')}
        >
          <Text style={styles.navEmoji}>🔍</Text>
          <Text style={styles.navText}>Provider</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Text style={styles.navEmoji}>💬</Text>
          <Text style={[styles.navText, styles.activeNavText]}>AI Match</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('ProfileScreen')}
        >
          <Text style={styles.navEmoji}>👤</Text>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('CulturalCalendar')}
        >
          <Text style={styles.navEmoji}>🗓️</Text>
          <Text style={styles.navText}>Calendar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  backText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  clearButton: {
    padding: 4,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  chatContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#10B981',
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: '#374151',
  },
  quickResponseContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  quickResponseButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  quickResponseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  providersContainer: {
    marginTop: 16,
  },
  providerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  providerSpecialty: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 14,
    flex: 1,
  },
  providerAddress: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 14,
    flex: 1,
  },
  providerPhone: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  providerTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  verifiedTag: {
    backgroundColor: '#DBEAFE',
  },
  verifiedTagText: {
    color: '#1E40AF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    color: '#6B7280',
    fontStyle: 'italic',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  sendButton: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 12,
    paddingBottom: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeNavItem: {
    borderTopWidth: 3,
    borderTopColor: '#10B981',
    marginTop: -1,
  },
  navEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeNavText: {
    color: '#10B981',
    fontWeight: '600',
  },
});

export default AiMatchChat;
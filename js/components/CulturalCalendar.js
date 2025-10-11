// js/components/CulturalCalendar.js
import React, { useState, useEffect } from 'react';
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

// Import Supabase
let supabase = null;
try {
  supabase = (require('../../supabase')?.default) ?? require('../../supabase');
} catch (e) {
  console.warn('Supabase not configured');
}

const CulturalCalendar = ({ navigation }) => {
  const [holidays, setHolidays] = useState([]);
  const [filteredHolidays, setFilteredHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedCulture, setSelectedCulture] = useState('All');

  const months = ['All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const cultures = ['All', 'Global', 'Christian', 'Hindu', 'Western', 'Islamic', 'Jewish', 'Buddhist', 'African American', 'Latino/Hispanic', 'Asian'];

  useEffect(() => {
    loadHolidays();
  }, []);

  useEffect(() => {
    filterHolidays();
  }, [holidays, searchText, selectedMonth, selectedCulture]);

  const loadHolidays = async () => {
    if (!supabase) {
      // Load sample data if Supabase not configured
      const sampleHolidays = [
        {
          id: '1',
          name: "National Women's Health Week",
          fixed_date: '2024-05-12',
          month_range: 'May 12-18',
          culture_religion: 'Global',
          description: 'Focus on women\'s health awareness',
          health_wellness_connection: 'Promotes preventive health screenings and wellness education for women',
          category: 'Health Awareness',
          dietary_considerations: 'Focus on nutrition for women\'s health',
          traditional_activities: ['Health screenings', 'Wellness workshops'],
          wellness_suggestions: ['Schedule preventive care', 'Focus on self-care']
        },
        {
          id: '2',
          name: 'Mental Health Awareness Month',
          fixed_date: null,
          month_range: 'May',
          culture_religion: 'Global',
          description: 'Promoting mental health awareness',
          health_wellness_connection: 'Reduces stigma and promotes mental wellness resources',
          category: 'Mental Health',
          dietary_considerations: 'Foods that support brain health',
          traditional_activities: ['Mental health education', 'Support groups'],
          wellness_suggestions: ['Practice mindfulness', 'Seek support when needed']
        },
        {
          id: '3',
          name: 'Pride Month',
          fixed_date: null,
          month_range: 'June',
          culture_religion: 'LGBTQ+',
          description: 'LGBTQ+ health and wellness focus',
          health_wellness_connection: 'Promotes inclusive healthcare and LGBTQ+ health awareness',
          category: 'Cultural Awareness',
          dietary_considerations: 'Inclusive nutrition education',
          traditional_activities: ['Pride celebrations', 'Health fairs'],
          wellness_suggestions: ['Find LGBTQ+ affirming healthcare', 'Build supportive community']
        },
        {
          id: '4',
          name: "Valentine's Day",
          fixed_date: '2024-02-14',
          month_range: 'February 14',
          culture_religion: 'Western/Christian',
          description: 'Day of love and affection',
          health_wellness_connection: 'Focus on relationships, emotional wellness',
          category: 'Cultural Holiday',
          dietary_considerations: 'Chocolate, romantic dinners',
          traditional_activities: ['Gift giving', 'Romantic dinners', 'Love expressions'],
          wellness_suggestions: ['Express gratitude to loved ones', 'Practice self-love', 'Strengthen relationships']
        }
      ];
      setHolidays(sampleHolidays);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cultural_holidays')
        .select('*')
        .eq('is_active', true)
        .order('fixed_date', { ascending: true });

      if (error) {
        console.error('Error loading holidays:', error);
        Alert.alert('Error', 'Failed to load cultural holidays');
      } else {
        setHolidays(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const filterHolidays = () => {
    let filtered = holidays;

    // Filter by search text
    if (searchText.trim()) {
      filtered = filtered.filter(holiday =>
        holiday.name.toLowerCase().includes(searchText.toLowerCase()) ||
        holiday.culture_religion.toLowerCase().includes(searchText.toLowerCase()) ||
        holiday.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by month
    if (selectedMonth !== 'All') {
      const monthNum = months.indexOf(selectedMonth);
      filtered = filtered.filter(holiday => {
        if (holiday.fixed_date) {
          const date = new Date(holiday.fixed_date);
          return date.getMonth() + 1 === monthNum;
        } else if (holiday.month_range) {
          return holiday.month_range.toLowerCase().includes(selectedMonth.toLowerCase());
        }
        return false;
      });
    }

    // Filter by culture
    if (selectedCulture !== 'All') {
      filtered = filtered.filter(holiday =>
        holiday.culture_religion.toLowerCase().includes(selectedCulture.toLowerCase())
      );
    }

    setFilteredHolidays(filtered);
  };

  const formatDate = (holiday) => {
    if (holiday.fixed_date) {
      const date = new Date(holiday.fixed_date);
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } else if (holiday.month_range) {
      return holiday.month_range;
    }
    return 'Date varies';
  };

  const renderFilterButtons = (options, selected, onSelect, maxShow = 5) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
      {options.slice(0, maxShow).map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.filterButton,
            selected === option && styles.filterButtonActive
          ]}
          onPress={() => onSelect(option)}
        >
          <Text style={[
            styles.filterButtonText,
            selected === option && styles.filterButtonTextActive
          ]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderHolidayCard = (holiday) => (
    <View key={holiday.id} style={styles.holidayCard}>
      <View style={styles.holidayHeader}>
        <Text style={styles.holidayName}>{holiday.name}</Text>
        <View style={[styles.cultureTag, getCultureTagStyle(holiday.culture_religion)]}>
          <Text style={[styles.cultureTagText, getCultureTagTextStyle(holiday.culture_religion)]}>
            {holiday.culture_religion}
          </Text>
        </View>
      </View>

      <Text style={styles.holidayDate}>{formatDate(holiday)}</Text>
      
      {holiday.category && (
        <Text style={styles.holidayCategory}>{holiday.category}</Text>
      )}

      <Text style={styles.holidayDescription}>{holiday.description}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health & Wellness Connection</Text>
        <Text style={styles.sectionContent}>{holiday.health_wellness_connection}</Text>
      </View>

      {holiday.dietary_considerations && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Considerations</Text>
          <Text style={styles.sectionContent}>{holiday.dietary_considerations}</Text>
        </View>
      )}

      {holiday.traditional_activities && holiday.traditional_activities.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Traditional Activities</Text>
          {holiday.traditional_activities.map((activity, index) => (
            <Text key={index} style={styles.listItem}>• {activity}</Text>
          ))}
        </View>
      )}

      {holiday.wellness_suggestions && holiday.wellness_suggestions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wellness Suggestions</Text>
          {holiday.wellness_suggestions.map((suggestion, index) => (
            <Text key={index} style={styles.listItem}>• {suggestion}</Text>
          ))}
        </View>
      )}
    </View>
  );

  const getCultureTagStyle = (culture) => {
    const lowerCulture = culture.toLowerCase();
    if (lowerCulture.includes('western') || lowerCulture.includes('christian')) {
      return { backgroundColor: '#10B981' };
    } else if (lowerCulture.includes('hindu')) {
      return { backgroundColor: '#F59E0B' };
    } else if (lowerCulture.includes('islamic')) {
      return { backgroundColor: '#3B82F6' };
    } else if (lowerCulture.includes('jewish')) {
      return { backgroundColor: '#8B5CF6' };
    } else {
      return { backgroundColor: '#6B7280' };
    }
  };

  const getCultureTagTextStyle = (culture) => {
    return { color: 'white' };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading cultural holidays...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Cultural Calendar</Text>
        <Text style={styles.headerSubtitle}>Health observances and cultural events</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search culture, name, wellness, dietary..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Month Filter */}
      <View style={styles.filterSection}>
        {renderFilterButtons(months, selectedMonth, setSelectedMonth, 6)}
      </View>

      {/* Culture Filter */}
      <View style={styles.filterSection}>
        {renderFilterButtons(cultures, selectedCulture, setSelectedCulture, 5)}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredHolidays.length > 0 ? (
          filteredHolidays.map(renderHolidayCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No holidays found for your filters</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        )}
      </ScrollView>

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

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('AiMatchChat')}
        >
          <Text style={styles.navEmoji}>💬</Text>
          <Text style={styles.navText}>AI Match</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('ProfileScreen')}
        >
          <Text style={styles.navEmoji}>👤</Text>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Text style={styles.navEmoji}>🗓️</Text>
          <Text style={[styles.navText, styles.activeNavText]}>Calendar</Text>
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
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterScrollView: {
    flexDirection: 'row',
  },
  filterButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#10B981',
  },
  filterButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  holidayCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
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
  holidayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  holidayName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    flex: 1,
    marginRight: 12,
  },
  cultureTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cultureTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  holidayDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  holidayCategory: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 8,
  },
  holidayDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  sectionContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  listItem: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
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

export default CulturalCalendar; 
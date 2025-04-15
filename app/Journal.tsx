import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';

type JournalEntry = {
  id: string;
  title: string;
  content: string;
  mood: string;
  createdAt: string;
};

export default function JournalScreen() {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  
  const navigation = useNavigation();

  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
    try {
      const journalData = await AsyncStorage.getItem('journals');
      if (journalData) {
        setJournals(JSON.parse(journalData));
      }
    } catch (error) {
      console.error('Failed to load journals:', error);
      Alert.alert('Error', 'Failed to load journals');
    }
  };

  const saveJournals = async (updatedJournals: JournalEntry[]) => {
    try {
      await AsyncStorage.setItem('journals', JSON.stringify(updatedJournals));
    } catch (error) {
      console.error('Failed to save journals:', error);
      Alert.alert('Error', 'Failed to save journals');
    }
  };

  const addJournal = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing Information', 'Please enter both title and content');
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title,
      content,
      mood,
      createdAt: new Date().toISOString(),
    };

    const updatedJournals = [newEntry, ...journals];
    setJournals(updatedJournals);
    await saveJournals(updatedJournals);
    
    setTitle('');
    setContent('');
    setMood('neutral');
    setIsModalVisible(false);
  };

  const updateJournal = async () => {
    if (!selectedEntry) return;
    
    const updatedEntry = {
      ...selectedEntry,
      title,
      content,
      mood,
    };

    const updatedJournals = journals.map(journal => 
      journal.id === selectedEntry.id ? updatedEntry : journal
    );

    setJournals(updatedJournals);
    await saveJournals(updatedJournals);
    
    setTitle('');
    setContent('');
    setMood('neutral');
    setSelectedEntry(null);
    setIsModalVisible(false);
  };

  const deleteJournal = async (id: string) => {
    Alert.alert(
      'Delete Journal',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedJournals = journals.filter(journal => journal.id !== id);
            setJournals(updatedJournals);
            await saveJournals(updatedJournals);
            
            if (selectedEntry?.id === id) {
              setSelectedEntry(null);
              setIsModalVisible(false);
            }
          }
        }
      ]
    );
  };

  const openNewEntryModal = () => {
    setTitle('');
    setContent('');
    setMood('neutral');
    setSelectedEntry(null);
    setIsViewMode(false);
    setIsModalVisible(true);
  };

  const viewJournalEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood);
    setIsViewMode(true);
    setIsModalVisible(true);
  };

  const editJournalEntry = () => {
    setIsViewMode(false);
  };

  const getMoodEmoji = (moodType: string) => {
    switch (moodType) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'anxious': return '😰';
      default: return '😐';
    }
  };

  const renderJournalItem = ({ item }: { item: JournalEntry }) => {
    const date = new Date(item.createdAt);
    const formattedDate = format(date, 'MMM dd, yyyy h:mm a');
    
    return (
      <TouchableOpacity 
        style={styles.journalItem}
        onPress={() => viewJournalEntry(item)}
      >
        <View style={styles.journalHeader}>
          <Text style={styles.journalTitle}>{item.title}</Text>
          <Text style={styles.journalMood}>{getMoodEmoji(item.mood)}</Text>
        </View>
        <Text style={styles.journalPreview} numberOfLines={2}>
          {item.content}
        </Text>
        <Text style={styles.journalDate}>{formattedDate}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#4F9DE8', '#357ABD']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Journal</Text>
        <View style={styles.placeholderView} />
      </LinearGradient>

      {journals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="book-open" size={64} color="#4F9DE8" />
          <Text style={styles.emptyText}>Your journal is empty</Text>
          <Text style={styles.emptySubText}>Start writing your thoughts and feelings</Text>
        </View>
      ) : (
        <FlatList
          data={journals}
          renderItem={renderJournalItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.journalList}
        />
      )}

      <TouchableOpacity style={styles.fabButton} onPress={openNewEntryModal}>
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedEntry ? (isViewMode ? 'Journal Entry' : 'Edit Entry') : 'New Entry'}
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Feather name="x" size={24} color="#001F54" />
              </TouchableOpacity>
            </View>

            {!isViewMode ? (
              <>
                <TextInput
                  style={styles.titleInput}
                  placeholder="Enter title"
                  value={title}
                  onChangeText={setTitle}
                  maxLength={50}
                />

                <TextInput
                  style={styles.contentInput}
                  placeholder="What's on your mind?"
                  value={content}
                  onChangeText={setContent}
                  multiline
                  textAlignVertical="top"
                />

                <View style={styles.moodSelector}>
                  <Text style={styles.moodLabel}>How are you feeling?</Text>
                  <View style={styles.moodOptions}>
                    <TouchableOpacity 
                      style={[styles.moodOption, mood === 'happy' && styles.selectedMood]} 
                      onPress={() => setMood('happy')}
                    >
                      <Text style={styles.moodEmoji}>😊</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.moodOption, mood === 'neutral' && styles.selectedMood]} 
                      onPress={() => setMood('neutral')}
                    >
                      <Text style={styles.moodEmoji}>😐</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.moodOption, mood === 'sad' && styles.selectedMood]} 
                      onPress={() => setMood('sad')}
                    >
                      <Text style={styles.moodEmoji}>😢</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.moodOption, mood === 'angry' && styles.selectedMood]} 
                      onPress={() => setMood('angry')}
                    >
                      <Text style={styles.moodEmoji}>😠</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.moodOption, mood === 'anxious' && styles.selectedMood]} 
                      onPress={() => setMood('anxious')}
                    >
                      <Text style={styles.moodEmoji}>😰</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={selectedEntry ? updateJournal : addJournal}
                >
                  <Text style={styles.saveButtonText}>
                    {selectedEntry ? 'Update' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.viewContainer}>
                  <View style={styles.viewHeader}>
                    <Text style={styles.viewTitle}>{title}</Text>
                    <Text style={styles.viewMood}>{getMoodEmoji(mood)}</Text>
                  </View>
                  
                  <Text style={styles.viewDate}>
                    {selectedEntry && format(new Date(selectedEntry.createdAt), 'MMMM dd, yyyy h:mm a')}
                  </Text>
                  
                  <Text style={styles.viewContent}>{content}</Text>
                </View>
                
                <View style={styles.viewActions}>
                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={editJournalEntry}
                  >
                    <Feather name="edit-2" size={20} color="#357ABD" />
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]} 
                    onPress={() => selectedEntry && deleteJournal(selectedEntry.id)}
                  >
                    <Feather name="trash-2" size={20} color="#FF6B6B" />
                    <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  placeholderView: {
    width: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#001F54',
    marginTop: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontFamily: 'Poppins-Regular',
  },
  journalList: {
    padding: 16,
  },
  journalItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  journalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001F54',
    flex: 1,
    fontFamily: 'Poppins-SemiBold',
  },
  journalMood: {
    fontSize: 20,
  },
  journalPreview: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  journalDate: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Poppins-Regular',
  },
  fabButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#357ABD',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#001F54',
    fontFamily: 'Poppins-SemiBold',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 12,
    height: 200,
    marginBottom: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  moodSelector: {
    marginBottom: 20,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: '#001F54',
    fontFamily: 'Poppins-Medium',
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodOption: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: '#F5F9FF',
  },
  selectedMood: {
    backgroundColor: '#DCF0FF',
    borderWidth: 2,
    borderColor: '#4F9DE8',
  },
  moodEmoji: {
    fontSize: 24,
  },
  saveButton: {
    backgroundColor: '#001F54',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  viewContainer: {
    backgroundColor: '#F5F9FF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  viewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  viewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#001F54',
    flex: 1,
    fontFamily: 'Poppins-SemiBold',
  },
  viewMood: {
    fontSize: 24,
  },
  viewDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  viewContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  viewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    backgroundColor: '#F0F7FF',
    marginHorizontal: 4,
  },
  deleteButton: {
    backgroundColor: '#FFF0F0',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#357ABD',
    marginLeft: 8,
    fontFamily: 'Poppins-Medium',
  },
  deleteText: {
    color: '#FF6B6B',
  },
});
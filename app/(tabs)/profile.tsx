import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { User, Settings, Bell, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight, CreditCard as Edit3, Target, Trophy, Calendar, Moon, Volume2, Mail, MessageSquare, FileText } from 'lucide-react-native';
import OptimizedImage from '@/components/OptimizedImage';
// import { useAuth } from '@/hooks/useAuth';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { user, logout, updateUser } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.preferences?.notifications ?? true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(user?.preferences?.darkMode ?? false);
  const [soundEnabled, setSoundEnabled] = useState(user?.preferences?.sound ?? true);

  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Edit profile form
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const userStats = [
    { 
      label: 'Sessions Completed', 
      value: user?.stats?.sessionsCompleted?.toString() || '0', 
      icon: <Calendar size={20} color={colors.primary} /> 
    },
    { 
      label: 'Current Streak', 
      value: user?.stats?.currentStreak ? `${user.stats.currentStreak} days` : '0 days', 
      icon: <Target size={20} color={colors.success} /> 
    },
    { 
      label: 'Best Score', 
      value: user?.stats?.bestScore ? `${user.stats.bestScore}%` : '0%', 
      icon: <Trophy size={20} color={colors.accent} /> 
    },
  ];

  const handleNotificationToggle = async (value: boolean) => {
    console.log('Notification toggle pressed:', value);
    setNotificationsEnabled(value);
    if (user) {
      await updateUser({
        preferences: {
          ...user.preferences,
          notifications: value,
        },
      });
    }
  };

  const handleDarkModeToggle = async (value: boolean) => {
    console.log('Dark mode toggle pressed:', value);
    setDarkModeEnabled(value);
    if (user) {
      await updateUser({
        preferences: {
          ...user.preferences,
          darkMode: value,
        },
      });
    }
  };

  const handleSoundToggle = async (value: boolean) => {
    console.log('Sound toggle pressed:', value);
    setSoundEnabled(value);
    if (user) {
      await updateUser({
        preferences: {
          ...user.preferences,
          sound: value,
        },
      });
    }
  };

  const handleEditProfile = () => {
    console.log('Edit profile pressed');
    setShowEditProfile(true);
  };

  const handleSaveProfile = async () => {
    console.log('Save profile pressed');
    if (user) {
      await updateUser({
        first_name: editForm.firstName,
        last_name: editForm.lastName,
        email: editForm.email,
      });
    }
    setShowEditProfile(false);
  };

  const handleGoals = () => {
    console.log('Speaking goals pressed');
    setShowGoals(true);
  };

  const handleHelp = () => {
    console.log('Help & Support pressed');
    setShowHelp(true);
  };

  const handlePrivacy = () => {
    console.log('Privacy Policy pressed');
    setShowPrivacy(true);
  };

  const handleLogout = () => {
    console.log('Logout pressed');
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            logout();
          }
        },
      ]
    );
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'edit-profile',
          label: 'Edit Profile',
          icon: <Edit3 size={20} color={colors.text} />,
          onPress: handleEditProfile,
        },
        {
          id: 'goals',
          label: 'Speaking Goals',
          icon: <Target size={20} color={colors.text} />,
          onPress: handleGoals,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'notifications',
          label: 'Push Notifications',
          icon: <Bell size={20} color={colors.text} />,
          rightComponent: (
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.gray[300], true: colors.primary + '40' }}
              thumbColor={notificationsEnabled ? colors.primary : colors.gray[500]}
            />
          ),
        },
        {
          id: 'dark-mode',
          label: 'Dark Mode',
          icon: <Moon size={20} color={colors.text} />,
          rightComponent: (
            <Switch
              value={darkModeEnabled}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: colors.gray[300], true: colors.primary + '40' }}
              thumbColor={darkModeEnabled ? colors.primary : colors.gray[500]}
            />
          ),
        },
        {
          id: 'sound',
          label: 'Sound Effects',
          icon: <Volume2 size={20} color={colors.text} />,
          rightComponent: (
            <Switch
              value={soundEnabled}
              onValueChange={handleSoundToggle}
              trackColor={{ false: colors.gray[300], true: colors.primary + '40' }}
              thumbColor={soundEnabled ? colors.primary : colors.gray[500]}
            />
          ),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          label: 'Help & Support',
          icon: <HelpCircle size={20} color={colors.text} />,
          onPress: handleHelp,
        },
        {
          id: 'privacy',
          label: 'Privacy Policy',
          icon: <Shield size={20} color={colors.text} />,
          onPress: handlePrivacy,
        },
      ],
    },
  ];

  const renderEditProfileModal = () => (
    <Modal
      visible={showEditProfile}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowEditProfile(false)}>
            <Text style={[styles.modalCancel, { color: colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSaveProfile}>
            <Text style={[styles.modalSave, { color: colors.primary }]}>Save</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>First Name</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.gray[300] }]}
              value={editForm.firstName}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, firstName: text }))}
              placeholder="Enter first name"
              placeholderTextColor={colors.gray[500]}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Last Name</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.gray[300] }]}
              value={editForm.lastName}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, lastName: text }))}
              placeholder="Enter last name"
              placeholderTextColor={colors.gray[500]}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.gray[300] }]}
              value={editForm.email}
              onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
              placeholder="Enter email"
              placeholderTextColor={colors.gray[500]}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderGoalsModal = () => (
    <Modal
      visible={showGoals}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowGoals(false)}>
            <Text style={[styles.modalCancel, { color: colors.primary }]}>Close</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Speaking Goals</Text>
          <View style={{ width: 50 }} />
        </View>
        
        <ScrollView style={styles.modalContent}>
          <Text style={[styles.sectionDescription, { color: colors.gray[600] }]}>
            Your current speaking goals and focus areas:
          </Text>
          
          {user?.preferences?.goals && user.preferences.goals.length > 0 ? (
            user.preferences.goals.map((goal, index) => (
              <View key={index} style={[styles.goalItem, { backgroundColor: colors.gray[100] }]}>
                <Target size={16} color={colors.primary} />
                <Text style={[styles.goalText, { color: colors.text }]}>
                  {goal.charAt(0).toUpperCase() + goal.slice(1)}
                </Text>
              </View>
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.gray[100] }]}>
              <Target size={48} color={colors.gray[400]} />
              <Text style={[styles.emptyStateText, { color: colors.text }]}>No goals set</Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.gray[500] }]}>
                Complete your onboarding to set speaking goals
              </Text>
            </View>
          )}
          
          {user?.preferences?.focusAreas && user.preferences.focusAreas.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Focus Areas</Text>
              {user.preferences.focusAreas.map((area, index) => (
                <View key={index} style={[styles.goalItem, { backgroundColor: colors.gray[100] }]}>
                  <Trophy size={16} color={colors.accent} />
                  <Text style={[styles.goalText, { color: colors.text }]}>
                    {area.charAt(0).toUpperCase() + area.slice(1).replace('-', ' ')}
                  </Text>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  const renderHelpModal = () => (
    <Modal
      visible={showHelp}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowHelp(false)}>
            <Text style={[styles.modalCancel, { color: colors.primary }]}>Close</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Help & Support</Text>
          <View style={{ width: 50 }} />
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.helpSection}>
            <Mail size={24} color={colors.primary} />
            <Text style={[styles.helpTitle, { color: colors.text }]}>Contact Support</Text>
            <Text style={[styles.helpDescription, { color: colors.gray[600] }]}>
              Get help with your account, sessions, or technical issues.
            </Text>
            <TouchableOpacity 
              style={[styles.helpButton, { backgroundColor: colors.primary }]}
              onPress={() => console.log('Contact support pressed')}
            >
              <Text style={styles.helpButtonText}>Send Email</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.helpSection}>
            <MessageSquare size={24} color={colors.secondary} />
            <Text style={[styles.helpTitle, { color: colors.text }]}>Live Chat</Text>
            <Text style={[styles.helpDescription, { color: colors.gray[600] }]}>
              Chat with our support team for immediate assistance.
            </Text>
            <TouchableOpacity 
              style={[styles.helpButton, { backgroundColor: colors.secondary }]}
              onPress={() => console.log('Live chat pressed')}
            >
              <Text style={styles.helpButtonText}>Start Chat</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.helpSection}>
            <FileText size={24} color={colors.accent} />
            <Text style={[styles.helpTitle, { color: colors.text }]}>FAQ</Text>
            <Text style={[styles.helpDescription, { color: colors.gray[600] }]}>
              Find answers to commonly asked questions.
            </Text>
            <TouchableOpacity 
              style={[styles.helpButton, { backgroundColor: colors.accent }]}
              onPress={() => console.log('FAQ pressed')}
            >
              <Text style={styles.helpButtonText}>View FAQ</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderPrivacyModal = () => (
    <Modal
      visible={showPrivacy}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowPrivacy(false)}>
            <Text style={[styles.modalCancel, { color: colors.primary }]}>Close</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Privacy Policy</Text>
          <View style={{ width: 50 }} />
        </View>
        
        <ScrollView style={styles.modalContent}>
          <Text style={[styles.privacyText, { color: colors.text }]}>
            <Text style={styles.privacyTitle}>Data Collection{'\n'}</Text>
            We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
            {'\n\n'}
            <Text style={styles.privacyTitle}>How We Use Your Information{'\n'}</Text>
            We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
            {'\n\n'}
            <Text style={styles.privacyTitle}>Information Sharing{'\n'}</Text>
            We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
            {'\n\n'}
            <Text style={styles.privacyTitle}>Data Security{'\n'}</Text>
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            {'\n\n'}
            <Text style={styles.privacyTitle}>Contact Us{'\n'}</Text>
            If you have any questions about this Privacy Policy, please contact us at privacy@confidencecoach.app
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );

  if (!user) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Please log in to view your profile</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.imageContainer}>
          <OptimizedImage
            source={{ 
              uri: user.image || 'https://cdn-icons-png.flaticon.com/512/8608/8608769.png?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' 
            }}
            style={styles.image}
          />
          <TouchableOpacity 
            style={[styles.editAvatarButton, { backgroundColor: colors.primary }]}
            onPress={() => console.log('Edit avatar pressed')}
          >
            <Edit3 size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.userName, { color: colors.text }]}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={[styles.userEmail, { color: colors.gray[600] }]}>
          {user.email}
        </Text>
        
        {user.subscription?.plan === 'free' && (
          <TouchableOpacity 
            style={[styles.upgradeButton, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
            onPress={() => console.log('Upgrade pressed')}
          >
            <Text style={[styles.upgradeButtonText, { color: colors.primary }]}>Upgrade to Pro</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats Section */}
      <View style={[styles.statsSection, { backgroundColor: colors.gray[100] }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Progress</Text>
        {user.stats && (user.stats.sessionsCompleted > 0 || user.stats.currentStreak > 0 || user.stats.bestScore > 0) ? (
          <View style={styles.statsContainer}>
            {userStats.map((stat, index) => (
              <View key={index} style={[styles.statCard, { backgroundColor: colors.background }]}>
                <View style={styles.statIcon}>
                  {stat.icon}
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.gray[600] }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyStats, { backgroundColor: colors.background }]}>
            <Trophy size={48} color={colors.gray[400]} />
            <Text style={[styles.emptyStatsTitle, { color: colors.text }]}>No Progress Yet</Text>
            <Text style={[styles.emptyStatsText, { color: colors.gray[500] }]}>
              Start your first practice session to see your progress here!
            </Text>
            <TouchableOpacity 
              style={[styles.startSessionButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/session')}
            >
              <Text style={styles.startSessionButtonText}>Start First Session</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Menu Sections */}
      {menuSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
          <View style={[styles.menuContainer, { backgroundColor: colors.gray[100] }]}>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  itemIndex < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.gray[200] }
                ]}
                onPress={'onPress' in item ? item.onPress : undefined}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuItemIcon, { backgroundColor: colors.gray[200] }]}>
                    {item.icon}
                  </View>
                  <Text style={[styles.menuItemLabel, { color: colors.text }]}>{item.label}</Text>
                </View>
                {'rightComponent' in item && item.rightComponent ? item.rightComponent : <ChevronRight size={20} color={colors.gray[400]} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.error + '15', borderColor: colors.error }]}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <LogOut size={20} color={colors.error} />
        <Text style={[styles.logoutButtonText, { color: colors.error }]}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.spacer} />

      {/* Modals */}
      {renderEditProfileModal()}
      {renderGoalsModal()}
      {renderHelpModal()}
      {renderPrivacyModal()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 16,
  },
  upgradeButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  emptyStats: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
  },
  emptyStatsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStatsText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  startSessionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  startSessionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  menuSection: {
    marginBottom: 24,
  },
  menuContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  spacer: {
    height: 40,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalCancel: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  goalText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  helpSection: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  helpDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  helpButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  helpButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  privacyTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
});
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User } from 'lucide-react-native';
// import { useAuth } from '@/hooks/useAuth';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUpScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { signup, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    // Clear previous errors and success messages
    setErrors({});
    setSuccessMessage('');

    const result = await signup({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      setSuccessMessage('Account created successfully! Redirecting to login...');
      // Clear form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      // Navigate to login after a brief delay to show success message
      setTimeout(() => {
        router.push('/(auth)/login');
      }, 1500);
    } else {
      setErrors({ general: result.error || 'Failed to create account. Please try again.' });
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleLoginPress = () => {
    router.push('/(auth)/login');
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear general error when user starts typing
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.gray[100] }]}
          onPress={handleBackPress}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Account</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={[styles.welcomeText, { color: colors.text }]}>
            Join thousands improving their confidence
          </Text>

          {/* Success Message */}
          {successMessage && (
            <View style={[styles.successContainer, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.successText, { color: colors.success }]}>
                {successMessage}
              </Text>
            </View>
          )}

          {/* General Error */}
          {errors.general && (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.general}
              </Text>
            </View>
          )}

          <View style={styles.nameRow}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <User size={20} color={colors.gray[500]} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: errors.firstName ? colors.error : colors.gray[300] }]}
                placeholder="First name"
                placeholderTextColor={colors.gray[500]}
                value={formData.firstName}
                onChangeText={(text) => updateFormData('firstName', text)}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: errors.lastName ? colors.error : colors.gray[300], paddingLeft: 16 }]}
                placeholder="Last name"
                placeholderTextColor={colors.gray[500]}
                value={formData.lastName}
                onChangeText={(text) => updateFormData('lastName', text)}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
          </View>
          {(errors.firstName || errors.lastName) && (
            <Text style={[styles.fieldErrorText, { color: colors.error }]}>
              {errors.firstName || errors.lastName}
            </Text>
          )}

          <View style={styles.inputContainer}>
            <Mail size={20} color={colors.gray[500]} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: errors.email ? colors.error : colors.gray[300] }]}
              placeholder="Email address"
              placeholderTextColor={colors.gray[500]}
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
          {errors.email && (
            <Text style={[styles.fieldErrorText, { color: colors.error }]}>
              {errors.email}
            </Text>
          )}

          <View style={styles.inputContainer}>
            <Lock size={20} color={colors.gray[500]} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: errors.password ? colors.error : colors.gray[300] }]}
              placeholder="Password"
              placeholderTextColor={colors.gray[500]}
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
              secureTextEntry={!showPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff size={20} color={colors.gray[500]} />
              ) : (
                <Eye size={20} color={colors.gray[500]} />
              )}
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={[styles.fieldErrorText, { color: colors.error }]}>
              {errors.password}
            </Text>
          )}

          <View style={styles.inputContainer}>
            <Lock size={20} color={colors.gray[500]} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: errors.confirmPassword ? colors.error : colors.gray[300] }]}
              placeholder="Confirm password"
              placeholderTextColor={colors.gray[500]}
              value={formData.confirmPassword}
              onChangeText={(text) => updateFormData('confirmPassword', text)}
              secureTextEntry={!showConfirmPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color={colors.gray[500]} />
              ) : (
                <Eye size={20} color={colors.gray[500]} />
              )}
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={[styles.fieldErrorText, { color: colors.error }]}>
              {errors.confirmPassword}
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.signUpButton,
              { 
                backgroundColor: colors.primary,
                opacity: isLoading ? 0.7 : 1
              }
            ]}
            onPress={handleSignUp}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.signUpButtonText}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginPrompt}>
            <Text style={[styles.loginPromptText, { color: colors.gray[600] }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={handleLoginPress} activeOpacity={0.7} disabled={isLoading}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  form: {
    paddingBottom: 40,
  },
  welcomeText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  successContainer: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  errorContainer: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  nameRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 18,
    zIndex: 1,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 48,
    paddingRight: 48,
    fontSize: 16,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 18,
  },
  fieldErrorText: {
    fontSize: 14,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 4,
  },
  signUpButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginPromptText: {
    fontSize: 16,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: '600',
  },
});
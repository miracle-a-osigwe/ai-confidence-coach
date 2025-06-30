import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
// import { useAuth } from '@/hooks/useAuth';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { login, isLoading, initializeAuth } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    // Clear previous errors
    setErrors({});

    // Initialize auth first to set up listeners
    await initializeAuth();

    const result = await login({
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      // Success - navigation will be handled by useAppNavigation
      // based on the user's onboarding status
      console.log('Login successful, navigation will be handled automatically');
      // router.push('/(auth)/onboarding');
    } else {
      // Show error and stay on login screen
      setErrors({ general: result.error || 'Login failed. Please try again.' });
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  const handleSignUpPress = () => {
    router.push('/(auth)/signup');
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
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Welcome Back</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.form}>
          <Text style={[styles.welcomeText, { color: colors.text }]}>
            Sign in to continue your confidence journey
          </Text>

          {/* General Error */}
          {errors.general && (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.general}
              </Text>
            </View>
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

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={handleForgotPassword}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
              Forgot your password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.loginButton,
              { 
                backgroundColor: colors.primary,
                opacity: isLoading ? 0.7 : 1
              }
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <View style={styles.signUpPrompt}>
            <Text style={[styles.signUpPromptText, { color: colors.gray[600] }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={handleSignUpPress} activeOpacity={0.7} disabled={isLoading}>
              <Text style={[styles.signUpLink, { color: colors.primary }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    justifyContent: 'center',
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
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signUpPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signUpPromptText: {
    fontSize: 16,
  },
  signUpLink: {
    fontSize: 16,
    fontWeight: '600',
  },
});
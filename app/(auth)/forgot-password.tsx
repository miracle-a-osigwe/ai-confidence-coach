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
import { ArrowLeft, Mail, CircleCheck as CheckCircle } from 'lucide-react-native';
// import { useAuth } from '@/hooks/useAuth';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { forgotPassword, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');

    const result = await forgotPassword(email);
    
    if (result.success) {
      setEmailSent(true);
    } else {
      setError(result.error || 'Failed to send reset email. Please try again.');
    }
  };

  if (emailSent) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.gray[100] }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Check Your Email</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.successContainer}>
            <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
              <CheckCircle size={48} color={colors.success} />
            </View>
            
            <Text style={[styles.successTitle, { color: colors.text }]}>
              Email Sent!
            </Text>
            
            <Text style={[styles.successMessage, { color: colors.gray[600] }]}>
              We've sent a password reset link to {email}. Please check your inbox and follow the instructions to reset your password.
            </Text>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Back to Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => setEmailSent(false)}
            >
              <Text style={[styles.resendButtonText, { color: colors.primary }]}>
                Didn't receive the email? Try again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.gray[100] }]}
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Reset Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.form}>
          <Text style={[styles.description, { color: colors.text }]}>
            Forgot your password? No worries! Enter your email address and we'll send you a link to reset it.
          </Text>

          <View style={styles.inputContainer}>
            <Mail size={20} color={colors.gray[500]} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: error ? colors.error : colors.gray[300] }]}
              placeholder="Email address"
              placeholderTextColor={colors.gray[500]}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
          {error && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.resetButton,
              { 
                backgroundColor: colors.primary,
                opacity: isLoading ? 0.7 : 1
              }
            ]}
            onPress={handleResetPassword}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.resetButtonText}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => router.push('/(auth)/login')}
            disabled={isLoading}
          >
            <Text style={[styles.backToLoginText, { color: colors.gray[600] }]}>
              Remember your password?{' '}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>
                Sign In
              </Text>
            </Text>
          </TouchableOpacity>
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
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
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
    paddingRight: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 14,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 4,
  },
  resetButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backToLogin: {
    alignItems: 'center',
    marginTop: 24,
  },
  backToLoginText: {
    fontSize: 16,
  },
  successContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  primaryButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 16,
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
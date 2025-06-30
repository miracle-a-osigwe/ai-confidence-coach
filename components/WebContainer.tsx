import React, { useEffect } from 'react';
import { Platform, View, StyleSheet } from 'react-native';

interface WebContainerProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  centered?: boolean;
}

export default function WebContainer({ 
  children, 
  width = 414, 
  height = 896, 
  centered = true 
}: WebContainerProps) {
  useEffect(() => {
    if (Platform.OS === 'web') {
      const applyWebStyles = () => {
        const body = document.body;
        const html = document.documentElement;
        
        // Only apply container styles on larger screens
        if (window.innerWidth > width + 100) {
          // Container styles
          body.style.width = `${width}px`;
          body.style.height = `${height}px`;
          body.style.margin = centered ? '20px auto' : '20px';
          body.style.border = '1px solid #e0e0e0';
          body.style.borderRadius = '20px';
          body.style.overflow = 'hidden';
          body.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
          
          // Page background
          html.style.backgroundColor = '#f5f5f5';
          html.style.minHeight = '100vh';
          html.style.padding = '0';
          html.style.margin = '0';
        } else {
          // Mobile/responsive styles
          body.style.width = '100%';
          body.style.height = '100vh';
          body.style.margin = '0';
          body.style.border = 'none';
          body.style.borderRadius = '0';
          body.style.boxShadow = 'none';
          body.style.overflow = 'auto';
          html.style.backgroundColor = 'white';
        }
      };

      applyWebStyles();
      window.addEventListener('resize', applyWebStyles);
      
      return () => {
        window.removeEventListener('resize', applyWebStyles);
      };
    }
  }, [width, height, centered]);

  // On web, return children directly since styling is applied to body
  if (Platform.OS === 'web') {
    return <>{children}</>;
  }

  // On mobile, return children in a container
  return (
    <View style={styles.mobileContainer}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  mobileContainer: {
    flex: 1,
  },
});
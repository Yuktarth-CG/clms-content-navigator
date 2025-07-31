import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Theme {
  id: string;
  state_name: string;
  logo_url?: string;
  background_url?: string;
  primary_color: string;
  secondary_color: string;
  button_color: string;
  created_at: string;
  updated_at: string;
}

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setTheme(data);
        // Apply theme colors to CSS variables
        applyThemeColors(data);
      }
    } catch (error) {
      console.log('No theme found, using defaults');
      // Apply default theme
      setTheme({
        id: 'default',
        state_name: 'Swift Chat CLMS',
        primary_color: '#3b82f6',
        secondary_color: '#64748b',
        button_color: '#059669',
        created_at: '',
        updated_at: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const applyThemeColors = (themeData: Theme) => {
    const root = document.documentElement;
    
    // Convert hex to HSL for CSS variables
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    root.style.setProperty('--primary', hexToHsl(themeData.primary_color));
    root.style.setProperty('--secondary', hexToHsl(themeData.secondary_color));
    root.style.setProperty('--accent', hexToHsl(themeData.button_color));
  };

  const getDefaultLogo = () => '/placeholder.svg';

  const getBrandingInfo = () => ({
    stateName: theme?.state_name || 'Swift Chat CLMS',
    logoUrl: theme?.logo_url || getDefaultLogo(),
    backgroundUrl: theme?.background_url,
    primaryColor: theme?.primary_color || '#3b82f6',
    secondaryColor: theme?.secondary_color || '#64748b',
    buttonColor: theme?.button_color || '#059669'
  });

  return {
    theme,
    loading,
    getBrandingInfo,
    refetchTheme: fetchTheme
  };
};
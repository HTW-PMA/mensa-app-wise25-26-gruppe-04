import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
    const colorScheme = useColorScheme() ?? 'light';

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme].primary,
                tabBarInactiveTintColor: Colors[colorScheme].icon,
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopColor: Colors[colorScheme].border,
                    height: 64,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="menu"
                options={{
                    title: 'Menü',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="fork.knife" color={color} />,
                }}
            />
            <Tabs.Screen
                name="waiting-times"
                options={{
                    title: 'Wartezeiten',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="ai-assistant"
                options={{
                    title: 'KI-Assistent',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="sparkles" color={color} />,
                }}
            />
            <Tabs.Screen
                name="favorites"
                options={{
                    title: 'Favoriten',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Einstellungen',
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    href: null, // ausgeblendet
                }}
            />
        </Tabs>
    );
}

//
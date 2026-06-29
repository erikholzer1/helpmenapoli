import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Platform } from 'react-native';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color, size }: { name: IoniconsName; color: string; size: number }) {
  return <Ionicons name={name} size={size} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor: 'rgba(212,168,67,0.18)',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 66,
          paddingBottom: Platform.OS === 'ios' ? 26 : 9,
          paddingTop: 9,
        },
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'DMSans-Medium',
          letterSpacing: 0.2,
          marginTop: 3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <TabIcon name="home-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="language"
        options={{
          title: 'Language',
          tabBarIcon: ({ color, size }) => <TabIcon name="chatbubble-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => <TabIcon name="compass-outline" color={color} size={size} />,
        }}
      />
      {/* Book hidden for now (kept as a route, removed from the tab bar) */}
      <Tabs.Screen name="book" options={{ href: null }} />
      <Tabs.Screen
        name="experiences"
        options={{
          title: 'Experiences',
          tabBarIcon: ({ color, size }) => <TabIcon name="sparkles-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "What's On",
          tabBarIcon: ({ color, size }) => <TabIcon name="calendar-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

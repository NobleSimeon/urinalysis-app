import { socketService } from '@/services/socket';
import { Tabs, useRouter } from 'expo-router';
import { ArrowBigLeftDashIcon, Camera, History, Power, User } from 'lucide-react-native';
import { Alert, TouchableOpacity } from 'react-native';

export default function TabLayout() {
    const router = useRouter();

      const handleShutdown = () => {
        Alert.alert("Shutdown System", "Are you sure you want to turn off the Pi?", [
          { text: "Cancel", style: "cancel" },
          { text: "Shutdown", style: "destructive", onPress: async() => {
      
              try {
                socketService.shutdown()
                
                // 2. Clear the navigation stack
                router.dismissAll();
                
                // 3. Replace current screen with Index (Login/Start)
                router.replace('/'); 
                
              } catch (error) {
                console.error("Shutdown failed", error);
              }
    
            } }
        ]);
      };
  return (
    <Tabs screenOptions={{
      headerStyle: { backgroundColor: '#F5F5F7' },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#888',
      headerLeft: () => (<TouchableOpacity onPress={()=> router.back()} style={{ marginInline: 15 }}>
                    <ArrowBigLeftDashIcon color="#000" size={24} />
                  </TouchableOpacity>),
      headerRight: () => (
                  <TouchableOpacity onPress={handleShutdown} style={{ marginRight: 15 }}>
                    <Power color="#FF3B30" size={24} />
                  </TouchableOpacity>
                ),
    }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'New Test',
          tabBarIcon: ({ color }) => <Camera color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <History color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
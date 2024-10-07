import React from 'react'; // Certifique-se de importar React
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'react-native';
import 'react-native-gesture-handler';
import fonts from './app/src/config/fonts';
import Routes from './app/src/routes/Routes';
import { UserProvider } from './app/src/components/UserContext';
import Toast from 'react-native-toast-message';

export default function App() {
    const [fontsLoaded] = useFonts(fonts);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />
            <UserProvider>
                <NavigationContainer>
                    <Routes />
                    <Toast />
                </NavigationContainer>
            </UserProvider>
        </>
    );
}

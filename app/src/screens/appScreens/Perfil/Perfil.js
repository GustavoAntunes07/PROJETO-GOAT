import React, { useState, useEffect } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome } from "@expo/vector-icons";
import { useUser } from "../../../components/UserContext";
import goatlogo from "../../../../../assets/goatlogo.png";
import axios from "axios";
import { db } from "../../../config/firebaseConfig"; // Ensure this import is correct
import { onSnapshot, doc } from "firebase/firestore"; // Import doc to fetch specific user

export default function Perfil({ navigation }) {
  const { userData, updateUserData } = useUser();
  const [profileImage, setProfileImage] = useState(userData.profileImage || "");
  const [favoriteTeams, setFavoriteTeams] = useState([]);
  const [nomeUser, setNomeUser] = useState('');
  const [emailUser, setEmailUser] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão necessária", "Precisamos de acesso à sua galeria.");
      }
    })();

    const fetchUserData = async () => {
      const user = auth.currentUser; // Ensure `auth` is defined and imported
      if (user) {
        const userDoc = doc(db, "Users", user.uid);
        const unsubscribe = onSnapshot(userDoc, (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            setNomeUser(userData.nome || ''); // Fallback in case nome is undefined
            setEmailUser(userData.email || ''); // Fallback in case email is undefined
          } else {
            console.log("No such document!");
          }
        });
        return () => unsubscribe();
      }
    };

    fetchUserData();
  }, []); // Removed the nested useEffect

  const loadFavorites = async () => {
    const storedFavorites = await AsyncStorage.getItem("favoriteTeams");
    if (storedFavorites) {
      const favoriteIds = JSON.parse(storedFavorites);
      console.log("Favorite IDs recuperados:", favoriteIds);

      const options = {
        method: "GET",
        url: "https://api-basketball.p.rapidapi.com/teams",
        params: {
          league: "12",
          season: "2023-2024",
        },
        headers: {
          "x-rapidapi-key": "YOUR_API_KEY", // Replace with your API key
          "x-rapidapi-host": "api-basketball.p.rapidapi.com",
        },
      };

      try {
        const response = await axios.request(options);
        const allTeams = response.data.response;

        const favoriteTeamsList = allTeams.filter((team) =>
          favoriteIds.includes(team.id)
        );
        setFavoriteTeams(favoriteTeamsList);
      } catch (error) {
        console.error("Erro ao buscar times:", error);
      }
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []); // Make sure loadFavorites is called once on mount

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedImageUri = result.assets[0].uri;
        setProfileImage(selectedImageUri);
        await updateUserData({ profileImage: selectedImageUri });
        Alert.alert("Sucesso", "Imagem de perfil atualizada com sucesso.");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao selecionar a imagem.");
    }
  };
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profile}>
          <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <Image source={goatlogo} style={styles.placeholder} />
            )}
          </TouchableOpacity>
          <Text style={styles.profileName}>{nomeUser}</Text>
          <Text style={styles.profileEmail}>{emailUser}</Text>
        </View>
        <View style={styles.FavoriteContainer}>
          <Text style={styles.header}>Favorite Teams</Text>
          {favoriteTeams.length > 0 ? (
            <FlatList
              data={favoriteTeams}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.teamCard}>
                  <Image
                    source={{ uri: item.logo }} // Agora estamos buscando a logo da API
                    style={styles.logo}
                    resizeMode="contain"
                  />
                  <Text style={styles.teamName}>{item.name}</Text>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noFavorites}>No favorite teams yet.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#333",
    justifyContent: "center",
  },
  scrollContainer: {
    alignItems: "center",
    padding: 20,
    paddingTop: 180,
  },
  profile: {
    alignItems: "center",
    marginBottom: 40,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    resizeMode: "cover",
  },
  placeholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  profileName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  actionButton: {
    padding: 10,
    alignItems: "center",
    marginHorizontal: 10,
  },
  card: {
    backgroundColor: "#7D7875",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  teamCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  teamName: {
    fontSize: 18,
    color: "#fff",
  },
  noFavorites: {
    fontSize: 16,
    color: "#888",
  },
  FavoriteContainer: {
    backgroundColor: "#444",
    borderRadius: 5,
    width: 275,
    height: 175
  }
});

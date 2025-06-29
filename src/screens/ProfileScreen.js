import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";

// Dummy data for the merchant profile
const merchantProfile = {
  storeName: "Toko Roti Enak",
  rating: 4.8,
  reviews: 125,
  description:
    "Kami menyajikan berbagai macam roti, kue, dan jajanan pasar yang dibuat setiap hari dengan bahan-bahan berkualitas. Cicipi kelezatan produk kami yang akan memanjakan lidah Anda.",
  profileImage: "https://via.placeholder.com/150", // Placeholder image
};

const ProfileScreen = ({ navigation }) => {
  const handleEditStore = () => {
    Alert.alert(
      "Edit Store",
      "Fitur untuk mengedit informasi toko sedang dalam pengembangan."
    );
  };

  const handleChangePassword = () => {
    Alert.alert(
      "Change Password",
      "Fitur untuk mengubah password sedang dalam pengembangan."
    );
  };

  const handleHelpAndFeedback = () => {
    Alert.alert(
      "Help & Feedback",
      "Fitur untuk bantuan dan masukan sedang dalam pengembangan."
    );
  };

  const handleLogout = () => {
    // In a real app, you would clear user session and navigate to the login screen
    Alert.alert("Logout", "Apakah Anda yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        onPress: () => {
          // For now, just navigate to Login. A real app would have more complex logic.
          navigation.navigate("Login");
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        <View style={styles.profileContainer}>
          <Image
            source={{ uri: merchantProfile.profileImage }}
            style={styles.profileImage}
          />
          <Text style={styles.storeName}>{merchantProfile.storeName}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>
              ★ {merchantProfile.rating.toFixed(1)}
            </Text>
            <Text style={styles.reviewsText}>
              ({merchantProfile.reviews} reviews)
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>About Us</Text>
          <Text style={styles.description}>{merchantProfile.description}</Text>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={handleEditStore}>
            <Text style={styles.menuItemText}>Edit Store Information</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleChangePassword}
          >
            <Text style={styles.menuItemText}>Change Password</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleHelpAndFeedback}
          >
            <Text style={styles.menuItemText}>Help & Feedback</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.actionButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  profileContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
    margin: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#2ECC71",
  },
  storeName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFC107", // Gold color for the star
    marginRight: 5,
  },
  reviewsText: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
  menuContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    overflow: "hidden", // Ensures the border radius is respected by children
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
  },
  menuItemArrow: {
    fontSize: 20,
    color: "#7F8C8D",
  },
  actionsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  actionButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#E74C3C", // Red
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;

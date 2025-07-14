import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from "react-native";
import { getMenuItemReviews } from "../api/apiClient";
import Ionicons from "react-native-vector-icons/Ionicons";

const COLORS = {
  primary: "#27AE60", // Green
  white: "#FFFFFF",
  black: "#000000",
  lightGray: "#F8F9FA",
  gray: "#BDC3C7",
  darkGray: "#7F8C8D",
  title: "#2C3E50",
  text: "#2C3E50",
  background: "#F8F9FA",
  card: "#FFFFFF",
  noteBg: "#FFF9E6",
};

const SIZES = {
  base: 8,
  font: 14,
  radius: 12,
  padding: 20,
  h1: 28,
  h2: 22,
  h3: 18,
  h4: 16,
  body2: 14,
  body3: 12,
  body4: 11,
};

const FONTS = {
  h1: { fontSize: SIZES.h1, fontWeight: "800" },
  h2: { fontSize: SIZES.h2, fontWeight: "700" },
  h3: { fontSize: SIZES.h3, fontWeight: "700" },
  h4: { fontSize: SIZES.h4, fontWeight: "700" },
  body2: { fontSize: SIZES.body2, fontWeight: "500" },
  body3: { fontSize: SIZES.body3, fontWeight: "700" },
  body4: { fontSize: SIZES.body4, fontWeight: "500" },
};

const ReviewListScreen = ({ route }) => {
  const { menuItemId } = route.params;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await getMenuItemReviews(menuItemId);
        setReviews(response.data.data);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        setError("Failed to load reviews. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [menuItemId]);

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image
          source={{
            uri: item.profileImageUrl || "https://via.placeholder.com/50",
          }} // Placeholder if no image
          style={styles.profileImage}
        />
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>
            {item.customerName || "Anonymous"}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
      <Text style={styles.reviewDate}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* <Text style={styles.title}>Customer Reviews</Text> */}
        {reviews.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>
              Belum ada ulasan untuk menu ini.
            </Text>
          </View>
        ) : (
          <FlatList
            data={reviews}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderReview}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingTop: SIZES.padding,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SIZES.base,
    color: COLORS.darkGray,
    ...FONTS.body2,
  },
  errorText: {
    color: COLORS.danger,
    ...FONTS.h4,
    textAlign: "center",
  },
  title: {
    ...FONTS.h2,
    color: COLORS.title,
    marginBottom: SIZES.padding,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: SIZES.padding,
    paddingHorizontal: SIZES.padding,
  },
  reviewCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.base * 2, // Increased margin for better separation
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.base,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  reviewerInfo: {
    flex: 1, // Take up remaining space
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewerName: {
    ...FONTS.h4,
    color: COLORS.title,
    flexShrink: 1, // Allow text to shrink if too long
    marginRight: SIZES.base,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.noteBg,
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.base,
  },
  ratingText: {
    marginLeft: SIZES.base / 2,
    ...FONTS.body3,
    color: "#E67E22",
  },
  reviewComment: {
    ...FONTS.body2,
    color: COLORS.text,
    marginBottom: SIZES.base,
    lineHeight: SIZES.body2 * 1.5, // Improved readability
  },
  reviewDate: {
    ...FONTS.body4,
    color: COLORS.gray,
    textAlign: "right",
    marginTop: SIZES.base, // Added margin for separation
  },
  emptyText: {
    ...FONTS.h4,
    color: COLORS.darkGray,
    textAlign: "center",
    marginTop: SIZES.padding * 2,
  },
});

export default ReviewListScreen;

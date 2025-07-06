import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

const Toast = ({ message, type, onHide }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const isMounted = useRef(true); // To track if the component is mounted

  useEffect(() => {
    isMounted.current = true; // Component is mounted

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (isMounted.current) { // Only call onHide if component is still mounted
        onHide();
      }
    });

    return () => {
      isMounted.current = false; // Component is unmounted
      // Stop any ongoing animations if the component unmounts
      fadeAnim.stopAnimation();
    };
  }, [fadeAnim, onHide]);

  const backgroundColor = type === "error" ? "#E74C3C" : "#2ECC71";

  return (
    <Animated.View
      style={[styles.container, { opacity: fadeAnim, backgroundColor }]}
    >
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  message: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Toast;

import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ToastAndroid,
} from "react-native";

import colors from "../theme/colors";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validateLogin = async () => {
    try {
      setLoading(true);

      const emailRegex = new RegExp(
        /^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/,
        "gm"
      );
      const isValidEmail = emailRegex.test(email);

      // Simulate a successful login with provided email and password
      if (!email || !password) {
        ToastAndroid.show("Enter email and password", ToastAndroid.SHORT);
      } else if (!isValidEmail) {
        ToastAndroid.show("Enter a valid email address", ToastAndroid.SHORT);
      } else if (password.length < 6) {
        ToastAndroid.show(
          "Password should be atleast 6 characters",
          ToastAndroid.SHORT
        );
      } else if (email === "test@task.com" && password === "123456") {
        ToastAndroid.show("Login successful!", ToastAndroid.SHORT);

        // Navigate to the desired screen after successful login
        navigation.navigate("MapView");
      } else {
        ToastAndroid.show("Invalid Email or Password..", ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show("ERROR: Login failed..", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor={colors.darkgray} barStyle={"light-content"} />

      <Image
        source={require("../../assets/logo.png")}
        style={styles.logoImage}
      />

      <>
        <View style={[styles.inputContainer]}>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            cursorColor={colors.black}
            autoCapitalize="none"
            style={[styles.textInput]}
          />
        </View>
      </>

      <>
        <View style={[styles.inputContainer]}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            cursorColor={colors.black}
            style={[styles.textInput]}
            secureTextEntry={true}
          />
        </View>
      </>

      <>
        <TouchableOpacity
          onPress={() => validateLogin()}
          style={styles.button}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Log In</Text>
          )}
        </TouchableOpacity>
      </>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: colors.darkgray,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },

  logoImage: {
    width: "50%",
    maxWidth: 300,
    marginTop: -50,
    height: undefined,
    aspectRatio: 1,
  },

  inputContainer: {
    width: "80%",
    minHeight: 55,
    flexDirection: "row",
    backgroundColor: colors.white,
    alignItems: "center",
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 5,
  },
  textInput: {
    height: "100%",
    width: "100%",
    color: colors.black,
    fontSize: 16,
  },
  seperatorLine: { height: 1, width: "50%", backgroundColor: colors.lightgray },

  button: {
    width: "80%",
    height: 50,
    backgroundColor: colors.yellow,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    borderRadius: 7,
    elevation: 5,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});

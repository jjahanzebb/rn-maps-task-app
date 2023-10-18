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

import * as Yup from "yup";
import { Formik } from "formik";

import colors from "../theme/colors";

const LoginScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Enter a valid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password should be at least 6 characters")
      .required("Password is required"),
  });

  const validateLogin = async (email, password) => {
    try {
      setLoading(true);

      // Simulate a successful login with dummy email and password
      console.log(email, password);
      if (email === "test@task.com" && password === "123456") {
        ToastAndroid.show("Login successful!", ToastAndroid.SHORT);

        // Navigate map screen after successful login
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

      {/* Logo Image */}
      <Image
        source={require("../../assets/logo.png")}
        style={styles.logoImage}
      />

      {/* Form with validation */}
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={(values, action) =>
          validateLogin(values.email, values.password)
        }
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          touched,
          errors,
        }) => (
          <>
            <View style={[styles.inputContainer]}>
              <TextInput
                placeholder="Email"
                value={values.email}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                cursorColor={colors.black}
                autoCapitalize="none"
                style={[styles.textInput]}
              />
            </View>
            {touched.email && errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <View style={[styles.inputContainer]}>
              <TextInput
                placeholder="Password"
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                cursorColor={colors.black}
                style={[styles.textInput]}
                secureTextEntry={true}
              />
            </View>
            {touched.password && errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            <TouchableOpacity
              onPress={handleSubmit}
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
        )}
      </Formik>
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
    marginBottom: 25,
    marginTop: 15,
  },
  textInput: {
    height: "100%",
    width: "100%",
    color: colors.black,
    fontSize: 16,
  },
  errorText: {
    color: colors.red,
    marginTop: -20,
    width: "75%",
    textAlign: "left",
  },

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

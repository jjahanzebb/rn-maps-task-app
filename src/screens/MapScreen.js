import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Modal,
  FlatList,
  TextInput,
  ToastAndroid,
} from "react-native";

import MapView, {
  Polygon,
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Entypo, MaterialIcons } from "@expo/vector-icons";

import colors from "../theme/colors";

const MapViewScreen = () => {
  const [isDrawing, setDrawing] = useState(false);
  const [drawingCoordinates, setDrawingCoordinates] = useState([]);
  const [polygons, setPolygons] = useState([]);

  const [isNameModalVisible, setNameModalVisible] = useState(false);
  const [listModalVisible, setListModalVisible] = useState(false);
  const [selectedArea, setSelectedArea] = useState({});
  const [name, setName] = useState("");

  const mapRef = useRef(null);

  // To get saved areas from Asyncstorage
  useEffect(() => {
    const fetchPolygons = async () => {
      const storedPolygons = await retrievePolygonsFromStorage();
      if (storedPolygons) {
        setPolygons(storedPolygons);
      }
    };

    fetchPolygons();
  }, []);

  const retrievePolygonsFromStorage = async () => {
    try {
      const serializedPolygons = await AsyncStorage.getItem("polygons");
      if (serializedPolygons) {
        const polygons = JSON.parse(serializedPolygons);
        return polygons;
      }
    } catch (error) {
      ToastAndroid.show("Error retrieving polygons", ToastAndroid.SHORT);
    }
    return [];
  };

  const toggleNameModal = () => {
    setNameModalVisible(!isNameModalVisible);
  };

  // Stops map scroll and allows drawing Polygon
  const handleStartDrawing = () => {
    setListModalVisible(false);
    setDrawing(true);
    setDrawingCoordinates([]);
  };

  // Calculates Area and adds object to list
  const handleStopDrawing = async () => {
    // for area in sqft
    let earth_radius = 6371000;

    if (drawingCoordinates.length >= 3) {
      let area = 0;

      for (let i = 0; i < drawingCoordinates.length; i++) {
        const j = (i + 1) % drawingCoordinates.length;
        const xi = drawingCoordinates[i].longitude;
        const yi = drawingCoordinates[i].latitude;
        const xj = drawingCoordinates[j].longitude;
        const yj = drawingCoordinates[j].latitude;

        area += xi * yj - xj * yi;
      }

      area = Math.round(Math.abs(area) * 100 * (earth_radius * 2));

      // new area object
      const newPolygon = {
        coordinates: drawingCoordinates,
        area: area,
        area_name: name,
      };

      setPolygons([...polygons, newPolygon]);
      await AsyncStorage.setItem(
        "polygons",
        JSON.stringify([...polygons, newPolygon])
      );

      // reset values
      setDrawing(false);
      toggleNameModal(false);
      setName("");
    } else {
      Alert.alert("Alert", "A polygon must have at least 3 points.");
    }
    setDrawingCoordinates([]);
  };

  let gap = 5;
  const handlePanDraw = (e) => {
    gap++;

    // to save every 10th point only
    if (isDrawing && gap % 10 === 0) {
      setDrawingCoordinates([...drawingCoordinates, e.nativeEvent.coordinate]);
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar translucent barStyle={"light-content"} />

      {/* Map on full screen */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        ref={mapRef}
        scrollEnabled={!isDrawing}
        minZoomLevel={15}
        maxZoomLevel={20}
        mapType={"satellite"}
        onPanDrag={(e) => {
          handlePanDraw(e);
        }}
        initialRegion={{
          latitude: 33.6296,
          longitude: 73.1123,
          latitudeDelta: 0.006,
          longitudeDelta: 0.004,
        }}
      >
        {/* Draws polygon on map */}
        {drawingCoordinates.map((polyline, index) => (
          <View key={index}>
            <Polyline
              coordinates={drawingCoordinates}
              strokeWidth={3}
              strokeColor={colors.red}
            />
            <Polygon
              coordinates={drawingCoordinates}
              strokeWidth={1}
              strokeColor={colors.black}
              fillColor={"rgba(255,0,0,0.01)"}
            />
          </View>
        ))}

        {/* Displays selected area from List */}
        {selectedArea?.coordinates?.map((polyline, index) => (
          <View key={index}>
            <Polygon
              coordinates={selectedArea?.coordinates}
              strokeWidth={3}
              strokeColor={colors.yellow}
              fillColor={"rgba(0,0,255,0.05)"}
            />

            <Marker
              anchor={{ x: 0.5, y: 0.5 }}
              centerOffset={{ x: 0.5, y: 0.5 }}
              zIndex={10}
              coordinate={selectedArea.coordinates[0]}
            >
              <Text style={{ color: colors.white }}>
                {selectedArea.area_name}
              </Text>
            </Marker>
          </View>
        ))}
      </MapView>

      {/* List Button - Top Right */}
      {isDrawing ? (
        <TouchableOpacity
          style={[styles.listButton, styles.finishButton]}
          onPress={toggleNameModal}
          activeOpacity={0.8}
        >
          <Text style={styles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.listButton]}
          onPress={() => setListModalVisible(true)}
          activeOpacity={0.8}
        >
          <Entypo name="list" size={20} color={colors.white} />

          <Text style={[styles.listButtonText, styles.finishButtonText]}>
            List
          </Text>
        </TouchableOpacity>
      )}

      {/* Modal for List View */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={listModalVisible}
      >
        <View style={styles.listModalContainer}>
          <View>
            <TouchableOpacity
              style={styles.createAreaButton}
              onPress={handleStartDrawing}
            >
              <Text style={styles.createAreaButtonText}>Create Area</Text>
            </TouchableOpacity>

            <FlatList
              data={polygons}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => {
                    setListModalVisible(false);
                    mapRef.current.animateToRegion(
                      {
                        latitude: item.coordinates[0].latitude,
                        longitude: item.coordinates[0].longitude,
                        latitudeDelta: 0.006,
                        longitudeDelta: 0.004,
                      },
                      1000 // animation to selected area will go for 1 second
                    );
                    setSelectedArea(item);
                  }}
                >
                  <Text style={styles.listItemPrimaryText}>
                    {item.area_name}
                  </Text>

                  <Text style={{ color: colors.gray }}>
                    {item.area + " SF"}
                  </Text>

                  <TouchableOpacity
                    style={styles.listItemDeleteButton}
                    onPress={async () => {
                      const updatedPolygons = polygons.filter(
                        (polygon) => polygon !== item
                      );
                      setPolygons(updatedPolygons);
                      await AsyncStorage.setItem(
                        "polygons",
                        JSON.stringify(updatedPolygons)
                      );
                    }}
                  >
                    <MaterialIcons
                      name="delete-forever"
                      size={24}
                      color={colors.white}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Close Button for List Modal */}
          <TouchableOpacity
            style={styles.listCloseButton}
            onPress={() => setListModalVisible(false)}
            activeOpacity={0.8}
          >
            <Text style={{ color: colors.white }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal for Area Name */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isNameModalVisible}
      >
        <View style={styles.nameModalContainer}>
          <Text style={styles.nameModalHeading}>Area Name</Text>

          <TextInput
            placeholder="Enter Area Name"
            value={name}
            onChangeText={(text) => setName(text)}
            style={styles.nameModalInput}
            autoFocus
          />

          {/* Save Area Button */}
          <TouchableOpacity
            style={styles.nameModalPrimaryButton}
            onPress={() => {
              if (name) {
                handleStopDrawing();
              } else {
                ToastAndroid.show(
                  "Cannot continue without area name..",
                  ToastAndroid.SHORT
                );
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.nameModalPrimaryButtonText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleNameModal}
            style={styles.nameModalSecondaryButton}
          >
            <Text style={{ color: "blue" }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, width: "100%" },
  map: {
    flex: 1,
  },

  // Top right buttons Styling
  listButton: {
    flexDirection: "row",
    width: 120,
    height: 50,
    position: "absolute",
    zIndex: 10,
    top: 60,
    right: 20,
    borderRadius: 10,
    alignItems: "center",
    elevation: 10,
    borderWidth: 2,
    borderColor: colors.lightgray,

    backgroundColor: colors.black,
    justifyContent: "flex-end",
  },
  finishButton: {
    backgroundColor: colors.red,
    justifyContent: "center",
  },
  listButtonText: { marginRight: "30%", marginLeft: "7%" },
  finishButtonText: {
    color: colors.white,
    fontSize: 18,
    letterSpacing: 1,
    textAlign: "center",
  },

  // List modal Styling
  listModalContainer: {
    flex: 1,
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: colors.white,
    padding: 24,
  },
  createAreaButton: {
    backgroundColor: colors.black,
    height: 60,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
  },
  createAreaButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 20,
    letterSpacing: 1,
  },
  listItem: {
    padding: 16,
    backgroundColor: colors.offwhite,
    height: 50,
    marginTop: 20,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
  },
  listItemPrimaryText: {
    color: colors.darkgray,
    fontWeight: "bold",
    marginRight: 30,
  },
  listItemDeleteButton: {
    position: "absolute",
    right: 0,
    height: 50,
    width: 50,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: colors.red,
    justifyContent: "center",
    alignItems: "center",
  },
  listCloseButton: {
    padding: 16,
    alignItems: "center",
    borderRadius: 9999,
    backgroundColor: colors.red,
    aspectRatio: 1,
    width: 100,
    justifyContent: "center",
    alignSelf: "center",
  },

  // Area Name modal Styling
  nameModalContainer: {
    backgroundColor: "white",
    padding: 20,
    marginTop: "50%",
    width: "90%",
    alignSelf: "center",
    borderRadius: 10,
  },
  nameModalHeading: { fontSize: 20, marginBottom: 10 },
  nameModalInput: {
    borderColor: colors.gray,
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  nameModalPrimaryButton: {
    width: "100%",
    height: 50,
    backgroundColor: colors.yellow,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  nameModalPrimaryButtonText: {
    letterSpacing: 1,
    fontSize: 18,
    color: colors.darkgray,
  },
  nameModalSecondaryButton: { marginTop: 10, alignSelf: "center" },
});

export default MapViewScreen;

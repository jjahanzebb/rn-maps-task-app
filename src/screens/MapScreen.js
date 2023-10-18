import React, { useState, useRef } from "react";
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
} from "react-native";
import MapView, { Polygon, Marker, Polyline } from "react-native-maps";
import { Entypo, MaterialIcons } from "@expo/vector-icons";

import colors from "../theme/colors";

const MapViewScreen = () => {
  const [isDrawing, setDrawing] = useState(false);
  const [drawingCoordinates, setDrawingCoordinates] = useState([]);
  const [polygons, setPolygons] = useState([]);

  const [isNameModalVisible, setNameModalVisible] = useState(false);
  const [name, setName] = useState("");

  const mapRef = useRef(null);

  const toggleNameModal = () => {
    setNameModalVisible(!isNameModalVisible);
  };

  const handleStartDrawing = () => {
    setListModalVisible(false);
    setDrawing(true);
    setDrawingCoordinates([]);
  };

  const handleStopDrawing = () => {
    setDrawing(false);
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

      const newPolygon = {
        coordinates: drawingCoordinates,
        area: area,
      };
      setPolygons([...polygons, newPolygon]);
    } else {
      Alert.alert("Alert", "A polygon must have at least 3 points.");
    }
    setDrawingCoordinates([]);
  };

  var gap = 5;
  const handlePanDraw = (e) => {
    gap++;

    if (isDrawing && gap % 10 === 0) {
      setDrawingCoordinates([...drawingCoordinates, e.nativeEvent.coordinate]);
    }
  };

  const [listModalVisible, setListModalVisible] = useState(false);
  const [selectedArea, setSelectedArea] = useState({});

  return (
    <SafeAreaView style={{ flex: 1, width: "100%" }}>
      <StatusBar translucent />
      <MapView
        style={styles.map}
        ref={mapRef}
        scrollEnabled={!isDrawing}
        minZoomLevel={15}
        maxZoomLevel={18}
        initialRegion={{
          latitude: 33.6296,
          longitude: 73.1123,
          latitudeDelta: 0.3,
          longitudeDelta: 0.3,
        }}
        zoomEnabled={true}
        zoomTapEnabled={true}
        mapType={"satellite"}
        onPanDrag={(e) => {
          handlePanDraw(e);
        }}
      >
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

        {selectedArea?.coordinates?.map((polyline, index) => (
          <View key={index}>
            <Polygon
              coordinates={selectedArea?.coordinates}
              strokeWidth={3}
              strokeColor={colors.yellow}
              fillColor={"rgba(0,0,255,0.05)"}
            />
          </View>
        ))}
      </MapView>

      {/* List Button - Top Right */}
      {isDrawing ? (
        <TouchableOpacity
          style={{
            flexDirection: "row",
            width: 120,
            height: 50,
            backgroundColor: colors.red,
            position: "absolute",
            zIndex: 10,
            top: 60,
            right: 20,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            elevation: 10,
            borderWidth: 2,
            borderColor: colors.lightgray,
          }}
          onPress={handleStopDrawing}
          activeOpacity={0.8}
        >
          <Text
            style={{
              color: colors.white,
              fontSize: 18,
              letterSpacing: 1,
              textAlign: "center",
            }}
          >
            Finish
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={{
            flexDirection: "row",
            width: 120,
            height: 50,
            backgroundColor: colors.black,
            position: "absolute",
            zIndex: 10,
            top: 60,
            right: 20,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "flex-end",
            elevation: 10,
            borderWidth: 2,
            borderColor: colors.lightgray,
          }}
          onPress={() => setListModalVisible(true)}
          activeOpacity={0.8}
        >
          <Entypo name="list" size={20} color={colors.white} />

          <Text
            style={{
              marginRight: "30%",
              marginLeft: "7%",
              color: colors.white,
              fontSize: 18,
              letterSpacing: 1,
              textAlign: "center",
            }}
          >
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
        <View
          style={{
            flex: 1,
            justifyContent: "space-between",
            width: "100%",
            backgroundColor: colors.white,
            padding: 24,
          }}
        >
          <View style={{}}>
            <TouchableOpacity
              style={{
                backgroundColor: colors.black,
                height: 60,
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
                elevation: 10,
              }}
              onPress={handleStartDrawing}
            >
              <Text
                style={{
                  color: colors.white,
                  fontWeight: "bold",
                  fontSize: 20,
                  letterSpacing: 1,
                }}
              >
                Create Area
              </Text>
            </TouchableOpacity>

            <FlatList
              data={polygons}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    padding: 16,
                    backgroundColor: colors.offwhite,
                    height: 50,
                    marginTop: 20,
                    borderRadius: 10,
                    alignItems: "center",
                    flexDirection: "row",
                  }}
                  onPress={() => {
                    setListModalVisible(false);
                    mapRef.current.animateToRegion(
                      {
                        latitude: item.coordinates[0].latitude,
                        longitude: item.coordinates[0].longitude,
                        latitudeDelta: 0.003,
                        longitudeDelta: 0.003,
                      },
                      1000
                    );
                    setSelectedArea(item);
                  }}
                >
                  <Text style={{ color: colors.gray }}>
                    {item.area + " SF"}
                  </Text>

                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      right: 0,
                      height: 50,
                      width: 50,
                      borderTopRightRadius: 10,
                      borderBottomRightRadius: 10,
                      backgroundColor: colors.red,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => {
                      const updatedPolygons = polygons.filter(
                        (polygon) => polygon !== item
                      );
                      setPolygons(updatedPolygons);
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

          <TouchableOpacity
            style={{
              padding: 16,
              alignItems: "center",
              borderRadius: 9999,
              backgroundColor: colors.red,
              aspectRatio: 1,
              width: 100,
              justifyContent: "center",
              alignSelf: "center",
            }}
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
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            marginTop: "50%",
          }}
        >
          <Text style={{ fontSize: 20, marginBottom: 10 }}>
            Enter Area Name
          </Text>
          <TextInput
            placeholder="Area Name"
            value={name}
            onChangeText={(text) => setName(text)}
            style={{
              borderColor: "gray",
              borderWidth: 1,
              padding: 10,
              marginBottom: 20,
            }}
          />
          <TouchableOpacity
            onPress={() => {
              if (name) {
                toggleNameModal(false);
                handleStopDrawing();
              }
            }}
          >
            <Text style={{ color: "blue" }}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleNameModal} style={{ marginTop: 10 }}>
            <Text style={{ color: "blue" }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
  },
});

export default MapViewScreen;

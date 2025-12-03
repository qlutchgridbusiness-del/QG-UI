"use client";

import { GoogleMap, Circle, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Spin } from "antd";

export default function MapRadius({ radius, onRadiusChange, center, onCenterChange }: any) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  });

  if (!isLoaded) return <Spin />;

  const containerStyle = {
    width: "100%",
    height: "350px",
    borderRadius: "12px",
    overflow: "hidden",
  };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      onClick={(e) =>
        onCenterChange({ lat: e.latLng?.lat()!, lng: e.latLng?.lng()! })
      }
    >
      <Marker position={center} />

      <Circle
        center={center}
        radius={radius * 1000}
        options={{
          fillColor: "#3b82f6",
          fillOpacity: 0.2,
          strokeColor: "#1d4ed8",
          strokeOpacity: 0.5,
          strokeWeight: 2,
          draggable: false,
        }}
      />
    </GoogleMap>
  );
}

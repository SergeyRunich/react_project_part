import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import styles from "../styles/Map.module.css";
import { useIntl } from "react-intl";

const loader = new Loader({
  apiKey: "Here_is_google_maps_key",
  version: "weekly",
});

const MapStyles = [
  {
    featureType: "poi",
    elementType: "all",
    stylers: [{ visibility: "off" }],
  },
];

const MAX_MARKER_LABEL_LENGTH = 12;

const truncatedMarkerLabel = (label, max_length = MAX_MARKER_LABEL_LENGTH) => {
  if (typeof label === "string" && label.length > max_length)
    return label.substring(0, max_length - 3) + "...";
  else return label;
};

function Map({ options = {}, markers = [] }) {
  const mapRef = useRef(null);
  const map = useRef();
  const markerRefs = useRef({});

  const { formatMessage: f } = useIntl();

  useEffect(() => {
    loader.load().then(() => {
      const google = window.google;

      if (mapRef.current) {
        if (map.current) map.current.setOptions(options);
        else
          map.current = new google.maps.Map(mapRef.current, {
            disableDefaultUI: true,
            styles: MapStyles,
            mapId: "Here_is_map_id",
            ...options,
          });
      }

      if (map.current) {
        if (
          Object.keys(markerRefs.current).length > 0 &&
          Object.keys(markerRefs.current).length !== markers.length
        ) {
          console.log("---CLEARING ALL MARKERS---");
          Object.values(markerRefs.current).forEach((marker) =>
            marker.setMap(null)
          );
          markerRefs.current = [];
        }

        markers.forEach((marker) => {
          const SVGs = {
            dayIcon: `data:image/svg+xml;utf-8,
              <svg width="74" height="79" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 66c0-6.627 5.373-12 12-12h48c6.627 0 12 5.373 12 12s-5.373 12-12 12H13C6.373 78 1 72.627 1 66z" fill="${encodeURIComponent(
                "#"
              )}${marker.isActive ? "EB6012" : "fff"}"/>
              <path d="M13 55h48v-2H13v2zm48 22H13v2h48v-2zm-48 0C6.925 77 2 72.075 2 66H0c0 7.18 5.82 13 13 13v-2zm59-11c0 6.075-4.925 11-11 11v2c7.18 0 13-5.82 13-13h-2zM61 55c6.075 0 11 4.925 11 11h2c0-7.18-5.82-13-13-13v2zm-48-2C5.82 53 0 58.82 0 66h2c0-6.075 4.925-11 11-11v-2z" fill="${encodeURIComponent(
                "#"
              )}${marker.isActive ? "EB6012" : "fff"}"/>
  
              <text class="mapText" style="font-family: Roboto; font-weight: 500; font-size: 12px;" x="16" y="70" fill="${encodeURIComponent(
                "#"
              )}${marker.isActive ? "fff" : "434343"}">${
              f({ id: "day" }) + " " + marker.dayIndex
            }</text>
  
              <path d="M17 23c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z" fill="${encodeURIComponent(
                "#"
              )}${marker.isActive ? "EB6012" : "fff"}"/>
              <path d="M37 33a.947.947 0 01-.748-.36C31.709 26.8 29.5 22.73 29.5 20.19c0-3.965 3.365-7.19 7.5-7.19s7.5 3.226 7.5 7.19c0 2.54-2.208 6.61-6.752 12.448A.947.947 0 0137 33zm0-18.182c-3.102 0-5.625 2.41-5.625 5.372 0 1.372 1 4.28 5.625 10.38 4.626-6.1 5.625-9.007 5.625-10.38 0-2.962-2.523-5.372-5.625-5.372zm0 9.091c-2.068 0-3.75-1.63-3.75-3.636 0-2.006 1.682-3.637 3.75-3.637s3.75 1.631 3.75 3.637c0 2.005-1.682 3.636-3.75 3.636zm0-5.454c-1.034 0-1.875.815-1.875 1.818 0 1.003.84 1.818 1.875 1.818 1.034 0 1.875-.816 1.875-1.818 0-1.003-.84-1.819-1.875-1.819z" fill="${encodeURIComponent(
                "#"
              )}${marker.isActive ? "ffffff" : "434343"}"/>
              <path d="M37 40c-9.389 0-17-7.611-17-17h-6c0 12.703 10.297 23 23 23v-6zm17-17c0 9.389-7.611 17-17 17v6c12.703 0 23-10.297 23-23h-6zM37 6c9.389 0 17 7.611 17 17h6C60 10.297 49.703 0 37 0v6zm0-6C24.297 0 14 10.297 14 23h6c0-9.389 7.611-17 17-17V0z" fill="${encodeURIComponent(
                "#"
              )}${marker.isActive ? "EB6012" : "fff"}"/>
              </svg>
            `,
            dayIconSelected: `data:image/svg+xml;utf-8,
              <svg width="74" height="79" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 66c0-6.627 5.373-12 12-12h48c6.627 0 12 5.373 12 12s-5.373 12-12 12H13C6.373 78 1 72.627 1 66z" fill="${encodeURIComponent(
                  "#"
                )}${marker.isSelected ? "C55110" : "EB6012"}"/>
                <path d="M13 55h48v-2H13v2zm48 22H13v2h48v-2zm-48 0C6.925 77 2 72.075 2 66H0c0 7.18 5.82 13 13 13v-2zm59-11c0 6.075-4.925 11-11 11v2c7.18 0 13-5.82 13-13h-2zM61 55c6.075 0 11 4.925 11 11h2c0-7.18-5.82-13-13-13v2zm-48-2C5.82 53 0 58.82 0 66h2c0-6.075 4.925-11 11-11v-2z" fill="${encodeURIComponent(
                  "#"
                )}${marker.isSelected ? "C55110" : "EB6012"}"/>

                <text class="mapText" style="font-family: Roboto; font-weight: 500; font-size: 12px;" x="16" y="70" fill="${encodeURIComponent(
                  "#"
                )}${marker.isSelected ? "ffffff" : "ffffff"}">${
              f({ id: "day" }) + " " + marker.dayIndex
            }</text>

                <path d="M17 23c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z" fill="${encodeURIComponent(
                  "#"
                )}${marker.isSelected ? "C55110" : "EB6012"}"/>
                <path d="M37 33a.947.947 0 01-.748-.36C31.709 26.8 29.5 22.73 29.5 20.19c0-3.965 3.365-7.19 7.5-7.19s7.5 3.226 7.5 7.19c0 2.54-2.208 6.61-6.752 12.448A.947.947 0 0137 33zm0-18.182c-3.102 0-5.625 2.41-5.625 5.372 0 1.372 1 4.28 5.625 10.38 4.626-6.1 5.625-9.007 5.625-10.38 0-2.962-2.523-5.372-5.625-5.372zm0 9.091c-2.068 0-3.75-1.63-3.75-3.636 0-2.006 1.682-3.637 3.75-3.637s3.75 1.631 3.75 3.637c0 2.005-1.682 3.636-3.75 3.636zm0-5.454c-1.034 0-1.875.815-1.875 1.818 0 1.003.84 1.818 1.875 1.818 1.034 0 1.875-.816 1.875-1.818 0-1.003-.84-1.819-1.875-1.819z" fill="${encodeURIComponent(
                  "#"
                )}${marker.isSelected ? "ffffff" : "ffffff"}"/>
                <path d="M37 40c-9.389 0-17-7.611-17-17h-6c0 12.703 10.297 23 23 23v-6zm17-17c0 9.389-7.611 17-17 17v6c12.703 0 23-10.297 23-23h-6zM37 6c9.389 0 17 7.611 17 17h6C60 10.297 49.703 0 37 0v6zm0-6C24.297 0 14 10.297 14 23h6c0-9.389 7.611-17 17-17V0z" fill="${encodeURIComponent(
                  "#"
                )}${marker.isSelected ? "C55110" : "EB6012"}"/>
              </svg>
            `,
            dayIconHover: `data:image/svg+xml;utf-8,
              <svg width="74" height="79" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 66c0-6.627 5.373-12 12-12h48c6.627 0 12 5.373 12 12s-5.373 12-12 12H13C6.373 78 1 72.627 1 66z" fill="${encodeURIComponent(
                  "#"
                )}0468FF"/>
                <path d="M13 55h48v-2H13v2zm48 22H13v2h48v-2zm-48 0C6.925 77 2 72.075 2 66H0c0 7.18 5.82 13 13 13v-2zm59-11c0 6.075-4.925 11-11 11v2c7.18 0 13-5.82 13-13h-2zM61 55c6.075 0 11 4.925 11 11h2c0-7.18-5.82-13-13-13v2zm-48-2C5.82 53 0 58.82 0 66h2c0-6.075 4.925-11 11-11v-2z" fill="${encodeURIComponent(
                  "#"
                )}0468FF"/>
      
                <text class="mapText" style="font-family: Roboto; font-weight: 500; font-size: 12px;" x="16" y="70" fill="${encodeURIComponent(
                  "#"
                )}fff">${f({ id: "day" }) + " " + marker.dayIndex}</text>
      
                <path d="M17 23c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z" fill="${encodeURIComponent(
                  "#"
                )}0468FF"/>
                <path d="M37 33a.947.947 0 01-.748-.36C31.709 26.8 29.5 22.73 29.5 20.19c0-3.965 3.365-7.19 7.5-7.19s7.5 3.226 7.5 7.19c0 2.54-2.208 6.61-6.752 12.448A.947.947 0 0137 33zm0-18.182c-3.102 0-5.625 2.41-5.625 5.372 0 1.372 1 4.28 5.625 10.38 4.626-6.1 5.625-9.007 5.625-10.38 0-2.962-2.523-5.372-5.625-5.372zm0 9.091c-2.068 0-3.75-1.63-3.75-3.636 0-2.006 1.682-3.637 3.75-3.637s3.75 1.631 3.75 3.637c0 2.005-1.682 3.636-3.75 3.636zm0-5.454c-1.034 0-1.875.815-1.875 1.818 0 1.003.84 1.818 1.875 1.818 1.034 0 1.875-.816 1.875-1.818 0-1.003-.84-1.819-1.875-1.819z" fill="${encodeURIComponent(
                  "#"
                )}ffffff"/>
                <path d="M37 40c-9.389 0-17-7.611-17-17h-6c0 12.703 10.297 23 23 23v-6zm17-17c0 9.389-7.611 17-17 17v6c12.703 0 23-10.297 23-23h-6zM37 6c9.389 0 17 7.611 17 17h6C60 10.297 49.703 0 37 0v6zm0-6C24.297 0 14 10.297 14 23h6c0-9.389 7.611-17 17-17V0z" fill="${encodeURIComponent(
                  "#"
                )}0468FF"/>
              </svg>
            `,
            poiIcon: `data:image/svg+xml;utf-8,
            <svg width="72" height="69" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 21C16 9.954 24.954 1 36 1s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z" fill="${encodeURIComponent(
              "#"
            )}fff"/>
            <path d="M36 31a.947.947 0 01-.748-.36C30.709 24.8 28.5 20.73 28.5 18.19c0-3.965 3.365-7.19 7.5-7.19s7.5 3.226 7.5 7.19c0 2.54-2.208 6.61-6.752 12.448A.947.947 0 0136 31zm0-18.182c-3.102 0-5.625 2.41-5.625 5.372 0 1.372 1 4.28 5.625 10.38 4.626-6.1 5.625-9.007 5.625-10.38 0-2.962-2.523-5.372-5.625-5.372zm0 9.091c-2.068 0-3.75-1.63-3.75-3.636 0-2.006 1.682-3.637 3.75-3.637s3.75 1.631 3.75 3.637c0 2.005-1.682 3.636-3.75 3.636zm0-5.454c-1.034 0-1.875.815-1.875 1.818 0 1.003.84 1.818 1.875 1.818 1.034 0 1.875-.816 1.875-1.818 0-1.003-.84-1.819-1.875-1.819z" fill="${encodeURIComponent(
              "#"
            )}434343"/>
            </svg>
            `,
            poiIconHover: `data:image/svg+xml;utf-8,
            <svg width="72" height="69" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 21C16 9.954 24.954 1 36 1s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z" fill="${encodeURIComponent(
              "#"
            )}0468FF"/>
            <path d="M36 31a.947.947 0 01-.748-.36C30.709 24.8 28.5 20.73 28.5 18.19c0-3.965 3.365-7.19 7.5-7.19s7.5 3.226 7.5 7.19c0 2.54-2.208 6.61-6.752 12.448A.947.947 0 0136 31zm0-18.182c-3.102 0-5.625 2.41-5.625 5.372 0 1.372 1 4.28 5.625 10.38 4.626-6.1 5.625-9.007 5.625-10.38 0-2.962-2.523-5.372-5.625-5.372zm0 9.091c-2.068 0-3.75-1.63-3.75-3.636 0-2.006 1.682-3.637 3.75-3.637s3.75 1.631 3.75 3.637c0 2.005-1.682 3.636-3.75 3.636zm0-5.454c-1.034 0-1.875.815-1.875 1.818 0 1.003.84 1.818 1.875 1.818 1.034 0 1.875-.816 1.875-1.818 0-1.003-.84-1.819-1.875-1.819z" fill="${encodeURIComponent(
              "#"
            )}f5f5f5"/>
            <path d="M0 57c0-6.627 5.373-12 12-12h48c6.627 0 12 5.373 12 12s-5.373 12-12 12H12C5.373 69 0 63.627 0 57z" fill="${encodeURIComponent(
              "#"
            )}0468FF"/>
            <text class="mapText" style="font-family: Roboto; font-weight: 500; font-size: 12px;" x="10" y="62" fill="${encodeURIComponent(
              "#"
            )}fff">${truncatedMarkerLabel(marker.name, 11)}</text>
            </svg>
            `,
            poiIconSelected: `data:image/svg+xml;utf-8,
            <svg width="72" height="69" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 21C16 9.954 24.954 1 36 1s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z" fill="${encodeURIComponent(
              "#"
            )}0468FF"/>
            <path d="M36 31a.947.947 0 01-.748-.36C30.709 24.8 28.5 20.73 28.5 18.19c0-3.965 3.365-7.19 7.5-7.19s7.5 3.226 7.5 7.19c0 2.54-2.208 6.61-6.752 12.448A.947.947 0 0136 31zm0-18.182c-3.102 0-5.625 2.41-5.625 5.372 0 1.372 1 4.28 5.625 10.38 4.626-6.1 5.625-9.007 5.625-10.38 0-2.962-2.523-5.372-5.625-5.372zm0 9.091c-2.068 0-3.75-1.63-3.75-3.636 0-2.006 1.682-3.637 3.75-3.637s3.75 1.631 3.75 3.637c0 2.005-1.682 3.636-3.75 3.636zm0-5.454c-1.034 0-1.875.815-1.875 1.818 0 1.003.84 1.818 1.875 1.818 1.034 0 1.875-.816 1.875-1.818 0-1.003-.84-1.819-1.875-1.819z" fill="${encodeURIComponent(
              "#"
            )}f5f5f5"/>
            <path d="M0 57c0-6.627 5.373-12 12-12h48c6.627 0 12 5.373 12 12s-5.373 12-12 12H12C5.373 69 0 63.627 0 57z" fill="${encodeURIComponent(
              "#"
            )}0468FF"/>
            <text class="mapText" style="font-family: Roboto; font-weight: 500; font-size: 12px;" x="10" y="62" fill="${encodeURIComponent(
              "#"
            )}fff">${truncatedMarkerLabel(marker.name, 11)}</text>
            </svg>
            `,
            placeIcon: `data:image/svg+xml;utf-8,
            <svg width="72" height="69" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 21C16 9.954 24.954 1 36 1s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z" fill="${encodeURIComponent(
              "#"
            )}EB6012"/>
            <path d="M36 31a.947.947 0 01-.748-.36C30.709 24.8 28.5 20.73 28.5 18.19c0-3.965 3.365-7.19 7.5-7.19s7.5 3.226 7.5 7.19c0 2.54-2.208 6.61-6.752 12.448A.947.947 0 0136 31zm0-18.182c-3.102 0-5.625 2.41-5.625 5.372 0 1.372 1 4.28 5.625 10.38 4.626-6.1 5.625-9.007 5.625-10.38 0-2.962-2.523-5.372-5.625-5.372zm0 9.091c-2.068 0-3.75-1.63-3.75-3.636 0-2.006 1.682-3.637 3.75-3.637s3.75 1.631 3.75 3.637c0 2.005-1.682 3.636-3.75 3.636zm0-5.454c-1.034 0-1.875.815-1.875 1.818 0 1.003.84 1.818 1.875 1.818 1.034 0 1.875-.816 1.875-1.818 0-1.003-.84-1.819-1.875-1.819z" fill="${encodeURIComponent(
              "#"
            )}f5f5f5"/>
            </svg>
            `,
            placeIconSelected: `data:image/svg+xml;utf-8,
            <svg width="72" height="69" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 21C16 9.954 24.954 1 36 1s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z" fill="${encodeURIComponent(
              "#"
            )}${marker.isSelected ? "C55110" : "EB6012"}"/>
            <path d="M36 31a.947.947 0 01-.748-.36C30.709 24.8 28.5 20.73 28.5 18.19c0-3.965 3.365-7.19 7.5-7.19s7.5 3.226 7.5 7.19c0 2.54-2.208 6.61-6.752 12.448A.947.947 0 0136 31zm0-18.182c-3.102 0-5.625 2.41-5.625 5.372 0 1.372 1 4.28 5.625 10.38 4.626-6.1 5.625-9.007 5.625-10.38 0-2.962-2.523-5.372-5.625-5.372zm0 9.091c-2.068 0-3.75-1.63-3.75-3.636 0-2.006 1.682-3.637 3.75-3.637s3.75 1.631 3.75 3.637c0 2.005-1.682 3.636-3.75 3.636zm0-5.454c-1.034 0-1.875.815-1.875 1.818 0 1.003.84 1.818 1.875 1.818 1.034 0 1.875-.816 1.875-1.818 0-1.003-.84-1.819-1.875-1.819z" fill="${encodeURIComponent(
              "#"
            )}f5f5f5"/>
            </svg>
            `,
            placeIconHover: `data:image/svg+xml;utf-8,
            <svg width="72" height="69" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 21C16 9.954 24.954 1 36 1s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z" fill="${encodeURIComponent(
              "#"
            )}EB6012"/>
            <path d="M36 31a.947.947 0 01-.748-.36C30.709 24.8 28.5 20.73 28.5 18.19c0-3.965 3.365-7.19 7.5-7.19s7.5 3.226 7.5 7.19c0 2.54-2.208 6.61-6.752 12.448A.947.947 0 0136 31zm0-18.182c-3.102 0-5.625 2.41-5.625 5.372 0 1.372 1 4.28 5.625 10.38 4.626-6.1 5.625-9.007 5.625-10.38 0-2.962-2.523-5.372-5.625-5.372zm0 9.091c-2.068 0-3.75-1.63-3.75-3.636 0-2.006 1.682-3.637 3.75-3.637s3.75 1.631 3.75 3.637c0 2.005-1.682 3.636-3.75 3.636zm0-5.454c-1.034 0-1.875.815-1.875 1.818 0 1.003.84 1.818 1.875 1.818 1.034 0 1.875-.816 1.875-1.818 0-1.003-.84-1.819-1.875-1.819z" fill="${encodeURIComponent(
              "#"
            )}f5f5f5"/>
            <path d="M0 51c0-3.314 2.102-6 4.696-6h62.608C69.898 45 72 47.686 72 51v12c0 3.314-2.102 6-4.696 6H4.696C2.102 69 0 66.314 0 63V51z" fill="${encodeURIComponent(
              "#"
            )}000000" fill-opacity=".7"/>
                <text style="font-family: Roboto; font-weight: 400; font-size: 13px;" x="6" y="62" fill="${encodeURIComponent(
                  "#"
                )}fff">${truncatedMarkerLabel(marker.name, 10)}</text>
              </svg>
            `,
          };

          const mainMapPlaceIcons = {
            defaultIcon: {
              anchor: new google.maps.Point(37, 39.5),
              url: SVGs.dayIcon,
            },
            selectedIcon: {
              anchor: new google.maps.Point(37, 39.5),
              url: SVGs.dayIconSelected,
            },
            hoverIcon: {
              anchor: new google.maps.Point(37, 39.5),
              url: SVGs.dayIconHover,
            },
          };

          const detailMapPoiIcons = {
            defaultIcon: {
              anchor: new google.maps.Point(37, 39.5),
              url: SVGs.poiIcon,
            },
            selectedIcon: {
              anchor: new google.maps.Point(37, 39.5),
              url: SVGs.poiIconSelected,
            },
            hoverIcon: {
              anchor: new google.maps.Point(37, 39.5),
              url: SVGs.poiIconHover,
            },
          };

          const detailMapPlaceIcons = {
            defaultIcon: {
              anchor: new google.maps.Point(37, 39.5),
              url: SVGs.placeIcon,
            },
            selectedIcon: {
              anchor: new google.maps.Point(37, 39.5),
              url: SVGs.placeIconSelected,
            },
            hoverIcon: {
              anchor: new google.maps.Point(37, 39.5),
              url: SVGs.placeIconHover,
            },
          };

          const icons = {
            defaultIcon: marker.isMain
              ? mainMapPlaceIcons.defaultIcon
              : marker.isPlace
              ? detailMapPlaceIcons.defaultIcon
              : detailMapPoiIcons.defaultIcon,
            hoverIcon: marker.isMain
              ? mainMapPlaceIcons.hoverIcon
              : marker.isPlace
              ? detailMapPlaceIcons.hoverIcon
              : detailMapPoiIcons.hoverIcon,
            selectedIcon: marker.isMain
              ? mainMapPlaceIcons.selectedIcon
              : marker.isPlace
              ? detailMapPlaceIcons.selectedIcon
              : marker.isPoi && marker.isSelected
              ? detailMapPoiIcons.selectedIcon
              : detailMapPoiIcons.defaultIcon,
          };

          let markerEl;

          if (markerRefs.current[marker.id]) {
            console.log("---UPDATING EXISTING MARKER---", marker);
            markerEl = markerRefs.current[marker.id];
            markerEl.setOptions({
              map: map.current,
              draggable: false,
              animation: null,
              icon: marker.isSelected ? icons.selectedIcon : icons.defaultIcon,
              ...marker,
            });
          } else {
            console.log("---CREATING NEW MARKER---", marker);
            markerEl = new google.maps.Marker({
              map: map.current,
              draggable: false,
              animation: null,
              icon: marker.isSelected ? icons.selectedIcon : icons.defaultIcon,
              ...marker,
            });
          }

          markerEl.addListener("mouseover", (e) => {
            markerEl.setIcon(icons.hoverIcon);
          });

          markerEl.addListener("mouseout", (e) => {
            markerEl.setIcon(
              marker.isSelected ? icons.selectedIcon : icons.defaultIcon
            );
          });

          if (marker.onClick)
            markerEl.addListener("click", (e) => {
              marker.onClick(e);
            });

          markerRefs.current[marker.id] = markerEl;
        });
      }
    });
  }, [options, mapRef.current, map.current, markers]);

  return (
    <div className={styles.MapContainer}>
      <div className={styles.Map} ref={mapRef} />
    </div>
  );
}

export default React.memo(Map);

import React, { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyDaX3PUNyVdgWjw5b6YrR_aj9HA-iRafrs";
const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_ID || "f40e70ae77b0a8b0f9542d30";

if (typeof window !== "undefined" && !window.__googleMapsOptionsSet) {
    setOptions({ key: API_KEY, v: "weekly" });
    window.__googleMapsOptionsSet = true;
}

// 1. RECIBIMOS LAS PROPS AQUÍ
const SelectorUbicacion = ({ onLocationSelect, ubicacionInicial }) => {
    const mapRef = useRef(null);
    const inputRef = useRef(null);
    
    // 2. USAMOS LA UBICACIÓN INICIAL DEL BACKEND (o Santiago por defecto)
    const [coordenadas, setCoordenadas] = useState(
        ubicacionInicial || { lat: -33.4489, lng: -70.6693 }
    );
    
    const mapInstance = useRef(null);
    const markerInstance = useRef(null);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current || !mapRef.current || !inputRef.current) return;

        const init = async () => {
            try {
                const { Map } = await importLibrary("maps");
                const { AdvancedMarkerElement } = await importLibrary("marker");
                const { Autocomplete } = await importLibrary("places");

                mapInstance.current = new Map(mapRef.current, {
                    center: coordenadas,
                    zoom: 14,
                    mapId: MAP_ID,
                });

                markerInstance.current = new AdvancedMarkerElement({
                    map: mapInstance.current,
                    position: coordenadas,
                    gmpDraggable: true,
                });

                const autocomplete = new Autocomplete(inputRef.current, {
                    fields: ["geometry", "name", "formatted_address"], 
                });

                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();

                    if (!place.geometry || !place.geometry.location) {
                        console.log("No hay coordenadas para este lugar.");
                        return;
                    }

                    const newPos = {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    };

                    mapInstance.current.setCenter(newPos);
                    mapInstance.current.setZoom(17);
                    markerInstance.current.position = newPos;
                    
                    setCoordenadas(newPos);
                    
                    if (onLocationSelect) {
                        onLocationSelect(newPos);
                    }
                });

                markerInstance.current.addListener('dragend', () => {
                    const pos = markerInstance.current.position;
                    const finalPos = {
                        lat: typeof pos.lat === 'function' ? pos.lat() : pos.lat,
                        lng: typeof pos.lng === 'function' ? pos.lng() : pos.lng
                    };
                    setCoordenadas(finalPos);
                    
                    if (onLocationSelect) {
                        onLocationSelect(finalPos);
                    }
                });

                initialized.current = true;
            } catch (e) {
                console.error("Error en Google Maps:", e);
            }
        };

        init();
    }, []);

    return (
        <div className="card shadow p-3 mb-4" style={{ width: '100%' }}>
            <h5 className="text-center mb-3 text-primary">Selecciona tu Ubicación</h5>

            <div className="mb-2">
                <input 
                    ref={inputRef} 
                    type="text" 
                    className="form-control" 
                    placeholder="Busca una dirección en el mundo..." 
                    style={{ padding: '8px', fontSize: '15px' }}
                />
            </div>

            <div 
                ref={mapRef} 
                style={{ width: '100%', height: '300px', borderRadius: '8px', border: '1px solid #ccc' }} 
            />

            <div className="mt-2 text-center text-muted" style={{ fontSize: '12px' }}>
                Lat: {coordenadas.lat.toFixed(4)} | Lng: {coordenadas.lng.toFixed(4)}
            </div>
        </div>
    );
};

export default SelectorUbicacion;
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- FIX PARA ICONOS DE LEAFLET EN VITE ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;
// ------------------------------------------

const LectoresUbi = ({ lectores }) => {
    // Coordenadas iniciales (Centro del mundo aprox)
    const posicionInicial = [20, -10]; 

    return (
        <div style={{ height: "400px", width: "100%", borderRadius: "10px", overflow: "hidden" }}>
            <MapContainer center={posicionInicial} zoom={2} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />
                
                {lectores && lectores.map((lector) => (
                    lector.latitud && lector.longitud && (
                        <Marker 
                            key={lector.id} 
                            position={[parseFloat(lector.latitud), parseFloat(lector.longitud)]}
                        >
                            <Popup>
                                <div className="text-center">
                                    <strong>{lector.nombre} {lector.apellido}</strong><br/>
                                    <small>{lector.pais_donde_reside}</small>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
};

// IMPORTANTE: Exportamos el componente con el nombre del archivo
export default LectoresUbi;
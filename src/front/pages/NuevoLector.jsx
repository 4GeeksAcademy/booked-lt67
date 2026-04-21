import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

// IMPORTAMOS EL MAPA
import SelectorUbicacion from "./24_Georreferenciacion"; 

const NuevoLector = () => {
    const { store } = useGlobalReducer();
    const navigate = useNavigate();

    // 1. Definimos la base limpia una sola vez para este componente
    const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "") + "/api";

    // Protección de ruta para Admin
    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [paisdondereside, setPaisDondeReside] = useState("");
    const [password, setPassword] = useState("");
    const [ubicacion, setUbicacion] = useState(null);

    function sendData(e) {
        e.preventDefault();

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "email": email,
                "username": username,
                "nombre": nombre,
                "apellido": apellido,
                "pais donde reside": paisdondereside,
                "password": password,
                "latitud": ubicacion ? ubicacion.lat : null,
                "longitud": ubicacion ? ubicacion.lng : null
            })
        };

        // 2. Usamos la API_URL blindada aquí
        fetch(`${API_URL}/lector`, requestOptions)
            .then(async response => {
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Error al crear el lector");
                }
                return response.json();
            })
            .then(data => {
                alert("¡Lector creado con éxito!");
                navigate("/lector"); 
            })
            .catch(err => alert(err.message));
    }

    return (
        <div className="container mt-5 mb-5">
            <h2 className="mb-4">Registro de Lector Nuevo</h2>
            
            <form onSubmit={sendData} className="col-md-8 border p-4 shadow-sm bg-white rounded">
                
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Email</label>
                        <input type="email" name="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Username</label>
                        <input type="text" name="username" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Nombre</label>
                        <input type="text" name="nombre" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Apellido</label>
                        <input type="text" name="apellido" className="form-control" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">País donde reside</label>
                        <input type="text" name="pais donde reside" className="form-control" value={paisdondereside} onChange={(e) => setPaisDondeReside(e.target.value)} required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Password</label>
                        <input type="password" name="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                </div>

                {/* INTEGRACIÓN DEL MAPA */}
                <div className="mb-4">
                    <label className="form-label fw-bold">Ubicación del Lector (Opcional)</label>
                    <SelectorUbicacion onLocationSelect={setUbicacion} />
                </div>

                <div className="d-flex justify-content-end">
                    <Link to="/lector" className="btn btn-secondary me-2">Cancelar</Link>
                    <button type="submit" className="btn btn-primary">Crear Lector</button>
                </div>
            </form>
        </div>
    );  
};

export default NuevoLector;
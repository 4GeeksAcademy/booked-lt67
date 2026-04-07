import React, { useEffect, useState } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

// IMPORTAMOS EL MAPA (Ajusta la ruta según dónde esté guardado)
import SelectorUbicacion from "./24_Georreferenciacion"; 

const EditarLector = () => {
    const { theId } = useParams();
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();
    
    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [paisdondereside, setPaisDondeReside] = useState("");
    
    // NUEVOS ESTADOS PARA EL MAPA
    const [ubicacion, setUbicacion] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "api/lector/" + theId)
            .then(response => {
                if (!response.ok) throw new Error("Error al cargar datos");
                return response.json();
            })
            .then(data => {
                setEmail(data.email || "");
                setUsername(data.username || "");
                setNombre(data.nombre || "");
                setApellido(data.apellido || "");
                setPaisDondeReside(data.pais_donde_reside || "");
                
                // Cargamos las coordenadas actuales del usuario para el mapa
                if (data.latitud && data.longitud) {
                    setUbicacion({ lat: data.latitud, lng: data.longitud });
                } else {
                    setUbicacion({ lat: -33.4489, lng: -70.6693 }); // Santiago por defecto
                }
                
                setCargando(false);
            })
            .catch(err => {
                console.error(err);
                setCargando(false);
            });
    }, [theId]);

    const updateData = (e) => {
        e.preventDefault();
        
        const requestOptions = {
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "email": email,
                "username": username,
                "nombre": nombre,
                "apellido": apellido,
                "pais donde reside": paisdondereside,
                // ENVIAMOS LAS COORDENADAS
                "latitud": ubicacion.lat,
                "longitud": ubicacion.lng
            })
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/lector/" + theId, requestOptions)
            .then(response => {
                if (response.status === 409) {
                    throw new Error("Ese username o email ya está en uso por otro lector");
                }
                if (response.ok) {
                    alert("¡Lector actualizado con éxito!");
                    navigate("/lector"); 
                } else {
                    throw new Error("Ocurrió un error al actualizar");
                }
            })
            .catch(err => alert(err.message));
    };

    if (cargando) return <div className="container mt-5 text-center">Cargando datos del lector...</div>;

    return (
        <div className="container mt-5 mb-5">
            <h2 className="mb-4">Editar Lector #{theId}</h2>
            <form onSubmit={updateData} className="col-md-8 border p-4 shadow-sm bg-white rounded">
                
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Email</label>
                        {/* El admin SÍ puede editar este campo */}
                        <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Username</label>
                        <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Nombre</label>
                        <input type="text" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Apellido</label>
                        <input type="text" className="form-control" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
                    </div>
                </div>
                
                <div className="mb-4">
                    <label className="form-label">País donde reside</label>
                    <input type="text" className="form-control" value={paisdondereside} onChange={(e) => setPaisDondeReside(e.target.value)} required />
                </div>

                {/* INTEGRACIÓN DEL MAPA */}
                {ubicacion && (
                    <div className="mb-4">
                        <label className="form-label fw-bold">Ubicación del Lector</label>
                        <SelectorUbicacion 
                            ubicacionInicial={ubicacion} 
                            onLocationSelect={setUbicacion} 
                        />
                    </div>
                )}

                <div className="d-flex justify-content-end">
                    <Link to="/lector" className="btn btn-secondary me-2">Cancelar</Link>
                    <button type="submit" className="btn btn-success">Actualizar Lector</button>
                </div>
            </form>
        </div>
    );
};

export default EditarLector;
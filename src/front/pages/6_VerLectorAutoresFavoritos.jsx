import React, { useEffect, useState, } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const VerLectorAutoresFavoritos = () => {
    const { theId } = useParams();
    const [lectorAutoresFavoritos, setLectorAutoresFavoritos] = useState(null);
    const { store } = useGlobalReducer();

    // --- 1. Definimos la base limpia ---
    const API_BASE = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "") + "/api";

    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }
    
    useEffect(() => {
        // --- 2. Fetch con URL blindada ---
        fetch(`${API_BASE}/lector_autores_favoritos/${theId}`)
            .then(response => {
                if (!response.ok) throw new Error("No se pudo cargar la relación");
                return response.json();
            })
            .then(data => setLectorAutoresFavoritos(data))
            .catch(err => console.error("Error en VerLectorAutoresFavoritos:", err));
    }, [theId, API_BASE]);

    if (lectorAutoresFavoritos === null) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p>Buscando la información de la relación {theId}...</p>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="card shadow-sm">
                <div className="card-body">
                    <h1 className="display-4">Detalles de la LectorAutoresFavoritos</h1>
                    <hr className="my-4" />
                    
                    <div className="row">
                        <div className="col-md-6">
                            <p><strong>id:</strong> {lectorAutoresFavoritos.id}</p>
                            <p><strong>nombre_autor:</strong> {lectorAutoresFavoritos.nombre_autor}</p>
                            <p><strong>nombre_lector:</strong> {lectorAutoresFavoritos.nombre_lector}</p>
                        </div>
                    </div>

                    <hr />
                    <Link to="/lector_autores_favoritos">
                        <button className="btn btn-secondary">Volver a la lista</button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerLectorAutoresFavoritos;

import React, { useEffect, useState, } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const VerAutor = () => {
    const { theId } = useParams();
    const [autor, setautor] = useState(null);
    const { store } = useGlobalReducer();
    const navigate = useNavigate();

    // --- 1. Definimos la base limpia ---
    const API_BASE = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "") + "/api";

    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }

    useEffect(() => {
        // --- 2. Fetch con URL blindada ---
        fetch(`${API_BASE}/autor/${theId}`)
            .then(response => {
                if (!response.ok) throw new Error("No se pudo cargar el autor");
                return response.json();
            })
            .then(data => setautor(data))
            .catch(err => console.error("Error en VerAutor:", err));
    }, [theId, API_BASE]);

    if (autor === null) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p>Buscando la información de la autor {theId}...</p>
            </div>
        );
    }

    // Usamos el objeto "autor" que ya cargamos con la URL correcta
    const imagenFinal = autor.foto || `https://ui-avatars.com/api/?name=${autor.nombre}+${autor.apellido}&background=random`;


    return (
        <div className="container mt-5">
            <div className="card shadow-sm">
                <div className="card-body">
                    <h1 className="display-4">Detalles del autor</h1>
                    <hr className="my-3" />
                    <img
                        src={imagenFinal}
                        alt={autor.nombre}
                        className="img-thumbnail"
                        style={{ width: "200px", height: "200px", objectFit: "cover" }}
                    />

                    <div className="row">
                        <div className="col-md-6">
                            <p><strong>Nombre:</strong> {autor.nombre}</p>
                            <p><strong>Apellido:</strong> {autor.apellido}</p>
                            <p><strong>Email:</strong> {autor.email}</p>
                            {/* <p><strong>Password:</strong> {autor.password}</p> */}
                        </div>
                        <div className="col-md-6">
                            <p><strong>País:</strong> {autor.pais}</p>
                        </div>
                    </div>

                    <hr />
                    <Link to="/autor">
                        <button className="btn btn-secondary">Volver a la lista</button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerAutor;
import React, { useEffect, useState, } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const VerLector = () => {
    const { theId } = useParams();
    const [lector, setLector] = useState(null);
    const { store, dispatch } = useGlobalReducer();

    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }

    useEffect(() => {
        // 1. Limpiamos la base
        const base = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

        // 2. Construimos la URL completa para el detalle del lector
        const urlFinal = `${base}/api/lector/${theId}`;

        fetch(urlFinal)
            .then(response => {
                if (!response.ok) throw new Error("No se pudo obtener el lector");
                return response.json();
            })
            .then(data => setLector(data))
            .catch(err => console.error("Error cargando detalle:", err));
    }, [theId]);

    if (lector === null) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p>Buscando la información del lector {theId}...</p>
            </div>
        );
    }

    const fotoUrl = lector.foto_url;
    const nombre = lector.nombre || "Lector";
    const apellido = lector.apellido || "";

    const imagenFinal = fotoUrl || `https://ui-avatars.com/api/?name=${nombre}+${apellido}&background=random`;


    return (
        <div className="container mt-5">
            <div className="card shadow-sm">
                <div className="card-body">
                    <h1 className="display-4">Detalles del Lector</h1>
                    <hr className="my-4" />
                    <img
                        src={imagenFinal}
                        alt={lector.nombre}
                        className="img-thumbnail"
                        style={{ width: "200px", height: "200px", objectFit: "cover" }}
                    />

                    <div className="row">
                        <div className="col-md-6">
                            <p><strong>Nombre:</strong> {lector.nombre}</p>
                            <p><strong>Apellido:</strong> {lector.apellido}</p>
                            <p><strong>Email:</strong> {lector.email}</p>
                        </div>
                        <div className="col-md-6">
                            <p><strong>Username:</strong> {lector.username}</p>
                            <p><strong>País:</strong> {lector.pais_donde_reside}</p>
                        </div>
                    </div>
                    <Link to={`/lector/${theId}/favoritos`}>
                        <button className="btn btn-primary">Ver Libros Favoritos</button>
                    </Link>

                    <hr />
                    <Link to="/lector">
                        <button className="btn btn-secondary">Volver a la lista</button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerLector;
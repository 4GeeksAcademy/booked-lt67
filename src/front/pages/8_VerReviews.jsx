import React, { useEffect, useState, } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const VerReviews = () => {
    const { theId } = useParams();
    const [review, setReview] = useState(null);
    const { store } = useGlobalReducer();

    // --- 1. Definimos la base limpia ---
    const API_BASE = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "") + "/api";

    
    /* if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    } */
   

    useEffect(() => {
        // --- 2. Fetch con URL blindada ---
        fetch(`${API_BASE}/reviews/${theId}`)
            .then(response => {
                if (!response.ok) throw new Error("No se pudo cargar la review");
                return response.json();
            })
            .then(data => setReview(data))
            .catch(err => console.error("Error cargando review:", err));
    }, [theId, API_BASE]);

    if (review === null) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p>Buscando la información de la Review {theId}...</p>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="card shadow-sm">
                <div className="card-body">
                    <h1 className="display-4">Detalles de la Review</h1>
                    <hr className="my-4" />

                    <div className="row">
                        <div className="col-md-6">
                            <p><strong>id:</strong> {review.libro.nombre}</p>
                            <p><strong>nombre_lector:</strong> {review.nombre_lector}</p>
                            <p><strong>texto:</strong> {review.texto}</p>
                            <p><strong>puntuacion:</strong> {review.puntuacion}</p>
                        </div>
                    </div>

                    <hr />
                    <Link to="/review">
                        <button className="btn btn-secondary">Volver a la lista</button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerReviews;

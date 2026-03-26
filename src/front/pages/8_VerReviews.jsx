import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

const VerReviews = () => {
    const { theId } = useParams();
    const [review, setReview] = useState(null);

    
    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "api/reviews/" + theId)
            .then(response => {
                return response.json();
            })
            .then(data => setReview(data))
    }, [theId]);

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

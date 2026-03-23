import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

const VerLector = () => {
    const { theId } = useParams();
    const [lector, setLector] = useState(null);

    
    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "api/lector/" + theId)
            .then(response => {
                return response.json();
            })
            .then(data => setLector(data))
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

    return (
        <div className="container mt-5">
            <div className="card shadow-sm">
                <div className="card-body">
                    <h1 className="display-4">Detalles del Lector</h1>
                    <hr className="my-4" />
                    
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
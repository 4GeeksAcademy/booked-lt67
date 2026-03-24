import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

const VerLectorAutoresFavoritos = () => {
    const { theId } = useParams();
    const [lectorAutoresFavoritos, setLectorAutoresFavoritos] = useState(null);

    
    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "api/lector_autores_favoritos/" + theId)
            .then(response => {
                return response.json();
            })
            .then(data => setLectorAutoresFavoritos(data))
    }, [theId]);

    if (lectorAutoresFavoritos === null) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p>Buscando la información de la LectorAutoresFavoritos {theId}...</p>
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
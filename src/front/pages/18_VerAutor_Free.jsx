import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

const VerAutorFree = () => {
    const { theId } = useParams();
    const [autor, setautor] = useState(null);

    
    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "api/autor/" + theId)
            .then(response => {
                return response.json();
            })
            .then(data => setautor(data))
    }, [theId]);

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

    return (
        <div className="container mt-5">
            <div className="card shadow-sm">
                <div className="card-body">
                    <h1 className="display-4">Detalles de la autor</h1>
                    <hr className="my-4" />
                    
                    <div className="row">
                        <div className="col-md-6">
                            <p><strong>Nombre:</strong> {autor.nombre}</p>
                            <p><strong>Apellido:</strong> {autor.apellido}</p>
                            <p><strong>Email:</strong> {autor.email}</p>
                            <p><strong>Password:</strong> {autor.password}</p>
                        </div>
                        <div className="col-md-6">
                            <p><strong>País:</strong> {autor.pais}</p>
                        </div>
                    </div>

                    <hr />
                    <Link to="/ver_autor_editorial">
                        <button className="btn btn-secondary">Volver a la lista</button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerAutorFree;
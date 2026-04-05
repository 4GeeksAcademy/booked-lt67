import React, { useEffect, useState, } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const VerEditorial = () => {
    const { theId } = useParams();
    const [editorial, setEditorial] = useState(null);
    const { store, dispatch } = useGlobalReducer()

    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }


    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "api/editorial/" + theId)
            .then(response => {
                return response.json();
            })
            .then(data => setEditorial(data))
    }, [theId]);

    if (editorial === null) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p>Buscando la información de la editorial {theId}...</p>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="card shadow-sm">
                <div className="card-body">
                    <h1 className="display-4">Detalles de la Editorial</h1>
                    <hr className="my-4" />

                    <div className="row">
                        <div className="col-md-6">
                            <p><strong>Nombre:</strong> {editorial.nombre}</p>
                            <p><strong>Email:</strong> {editorial.email}</p>
                            <p><strong>Password:</strong> {editorial.password}</p>
                        </div>
                        <div className="col-md-6">
                            <p><strong>País:</strong> {editorial.pais}</p>
                        </div>
                    </div>

                    <hr />
                    <Link to="/editorial">
                        <button className="btn btn-secondary">Volver a la lista</button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerEditorial;
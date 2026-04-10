import React, { useEffect, useState, } from "react";
import { Link, useParams, useNavigate, Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const VerEditorial = () => {
    const { theId } = useParams();
    const [editorial, setEditorial] = useState(null);
    const { store, dispatch } = useGlobalReducer()

    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }


    const navigate = useNavigate();

    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "api/editorial/" + theId)
            .then(response => {
                return response.json();
            })
            .then(data => {
                const editorialData = Array.isArray(data) ? data[0] : data;
                setEditorial(editorialData);
            })
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
                        <div className="col-md-4 mb-3">
                            <div className="ratio ratio-1x1 bg-light rounded shadow-sm border overflow-hidden">
                                {editorial.image_url ? (
                                    <img src={editorial.image_url} alt={editorial.nombre} className="w-100 h-100 object-fit-contain p-2"/>
                                ) : (
                                    <div className="d-flex flex-column align-items-center justify-content-center text-muted h-100">
                                        <i className="fas fa-building fa-3x mb-2 opacity-25"></i>
                                        <span className="small">Sin Logo</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="col-md-8">
                            <div className="row">
                                <div className="col-md-6">
                                    <p><strong>Nombre:</strong> {editorial.nombre}</p>
                                    <p><strong>Email:</strong> {editorial.email}</p>
                                </div>
                                <div className="col-md-6">
                                    <p><strong>País:</strong> {editorial.pais}</p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <button onClick={() => navigate(-1)} className="btn btn-secondary">
                                    <i className="fas fa-arrow-left me-2"></i>Volver
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerEditorial;
import React, { useEffect, useState, } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";


const VerLibro = () => {
    const { theId } = useParams();
    const [libro, setLibro] = useState(null);
    const { store, dispatch } = useGlobalReducer()
                    


    const navigate = useNavigate();


    useEffect(() => {
        setLibro(null);
        fetch(import.meta.env.VITE_BACKEND_URL + "api/libro/" + theId)
            .then(response => {
                if (!response.ok) throw new Error("No se encontró el libro");
                return response.json();
            })
            .then(data => {
                const libroData = Array.isArray(data) ? data[0] : data;
                setLibro(libroData);
            })
            }, [theId]);

    if (libro === null) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p>Buscando la información del Libro {theId}...</p>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="card shadow-sm">
                <div className="card-body">
                    <h1 className="display-4">Detalles del Libro</h1>
                    <hr className="my-4" />
                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <div className="ratio ratio-1x1 bg-light rounded shadow-sm border overflow-hidden">
                                {libro.image_url ? (
                                    <img src={libro.image_url} alt={libro.nombre} className="w-100 h-100 object-fit-contain p-2"/>
                                ) : (
                                    <div className="d-flex flex-column align-items-center justify-content-center text-muted h-100">
                                        <i className="fas fa-book fa-3x mb-2 opacity-25"></i>
                                        <span className="small">Sin Portada</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-md-8">
                            <div className="row">
                                <div className="col-md-6">
                                    <p><strong>Nombre:</strong> {libro.nombre}</p>
                                    <p><strong>Género:</strong> {libro.genero}</p>
                                    <p><strong>Autor:</strong> {libro.nombre_autor}</p>
                                    <p><strong>Sinopsis:</strong> {libro.descripcion}</p>
                                </div>
                                <div className="col-md-6">
                                    <p><strong>Editorial:</strong> {libro.nombre_editorial}</p>
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

export default VerLibro;
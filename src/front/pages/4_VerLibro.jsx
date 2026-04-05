import React, { useEffect, useState, } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";


const VerLibro = () => {
    const { theId } = useParams();
    const [libro, setLibro] = useState(null);
    const { store, dispatch } = useGlobalReducer()
                    


    const navigate = useNavigate();


    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "api/libro/" + theId)
            .then(response => {
                return response.json();
            })
            .then(data => setLibro(data))
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
                        <div className="col-md-6">
                            <p><strong>Nombre:</strong> {libro.nombre}</p>
                            <p><strong>Genero:</strong> {libro.genero}</p>
                            <p><strong>Autor:</strong> {libro.nombre_autor}</p>
                        </div>
                        <div className="col-md-6">
                            <p><strong>Editorial:</strong> {libro.nombre_editorial}</p>
                        </div>
                    </div>
                    <hr />
                    <button onClick={() => navigate(-1)} className="btn btn-secondary">Volver</button>
            </div>
        </div>
        </div >
    );
};

export default VerLibro;
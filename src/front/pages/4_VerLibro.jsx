import React, { useEffect, useState, } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";


const VerLibro = () => {
    const { theId } = useParams();
    const [libro, setLibro] = useState(null);
    const { store, dispatch } = useGlobalReducer()
    const navigate = useNavigate();

    const [summary, setSummary] = useState("");
    const [loadingAI, setLoadingAI] = useState(false);


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

    const handleGenerateSummary = async () => {
    // 1. Verificación de seguridad
    if (!libro || !libro.nombre) {
        alert("El libro no tiene un título válido para resumir.");
        return;
    }

    // 2. ¿Cómo se llama tu token? 
    // Si en tu store se guarda diferente, cámbialo aquí (ej. store.access_token)
    const token = localStorage.getItem("token_lector");

    if (!token) {
        alert("No se encontró el token de sesión. Por favor, reingresa.");
        return;
    }

    setLoadingAI(true);
    try {
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + "api/ai-summary", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // <--- Asegúrate que esto no sea "Bearer undefined"
            },
            body: JSON.stringify({ title: libro.nombre })
        });

        const data = await response.json();
        if (response.ok) {
            setSummary(data.summary);
        } else {
            console.error("Detalle del error:", data);
            alert(data.msg || data.error || "Error 422: Problema con el token o los datos");
        }
    } catch (error) {
        console.error("Error llamando a la IA:", error);
    } finally {
        setLoadingAI(false);
    }
};


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

    console.log("Estado del store en VerLibro:", store);

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
                                    <img src={libro.image_url} alt={libro.nombre} className="w-100 h-100 object-fit-contain p-2" />
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

                            <div className="mt-4 p-3 border rounded bg-light">
                                <h5 className="text-primary"><i className="fas fa-robot me-2"></i>Resumen Inteligente</h5>

                                {store.auth_lector ? (
                                    <>
                                        {summary || libro.resumen_ia ? (
                                            <p className="fst-italic animate__animated animate__fadeIn"
                                            style={{ whiteSpace: "pre-line" }}>
                                                "{summary || libro.resumen_ia}"
                                            </p>
                                        ) : (
                                            <button
                                                onClick={handleGenerateSummary}
                                                className="btn btn-primary btn-sm"
                                                disabled={loadingAI}
                                            >
                                                {loadingAI ? (
                                                    <><span className="spinner-border spinner-border-sm me-2"></span>Generando...</>
                                                ) : "Generar resumen con IA"}
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="alert alert-secondary mb-0 py-2">
                                        <p className="text-muted small mb-0">
                                            <i className="fas fa-lock me-2"></i>
                                            Inicia sesión como <strong>lector</strong> para desbloquear el resumen generado por IA.
                                        </p>
                                    </div>
                                )}
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
import React, { useEffect, useState } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const VerLibro = () => {
    const { theId } = useParams();
    const [libro, setLibro] = useState(null);
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [summary, setSummary] = useState("");
    const [loadingAI, setLoadingAI] = useState(false);

    useEffect(() => {
        setLibro(null);
        const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
        fetch(`${baseUrl}/api/libro/${theId}`)
            .then(response => {
                if (!response.ok) throw new Error("No se encontró el libro");
                return response.json();
            })
            .then(data => {
                const libroData = Array.isArray(data) ? data[0] : data;
                setLibro(libroData);
            })
            .catch(err => console.error(err));
    }, [theId]);

    const handleGenerateSummary = async () => {
        // 1. Verificación de seguridad
        if (!libro || !libro.nombre) {
            alert("El libro no tiene un título válido para resumir.");
            return;
        }

        // 2. Obtener Token
        const token = localStorage.getItem("token_lector");

        if (!token) {
            alert("No se encontró el token de sesión. Por favor, reingresa.");
            return;
        }

        setLoadingAI(true);
        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
            const response = await fetch(`${baseUrl}/api/ai-summary`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
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

    // --- PANTALLA DE CARGA ---
    if (libro === null) {
        return (
            <div className="container-fluid min-vh-100 d-flex flex-column align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
                <div className="spinner-border text-info-booked mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
                <h5 className="text-muted fw-bold">Buscando en la biblioteca...</h5>
            </div>
        );
    }

    return (
        <div className="container-fluid min-vh-100 py-5" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
            <div className="container">
                
                {/* Botón Volver (Arriba) */}
                <button onClick={() => navigate(-1)} className="btn btn-sm btn-light border rounded-pill px-3 shadow-sm mb-4 text-muted fw-bold hover-zoom">
                    <i className="fas fa-arrow-left me-2"></i>Volver al catálogo
                </button>

                <div className="card shadow-lg border-0 rounded-5 overflow-hidden mx-auto bg-white" style={{ maxWidth: "1000px" }}>
                    <div className="card-body p-4 p-md-5">
                        <div className="row g-5">
                            
                            {/* COLUMNA IZQUIERDA: Portada del Libro */}
                            <div className="col-md-4 col-lg-4 text-center">
                                <div className="position-relative d-inline-block w-100" style={{ perspective: "1000px" }}>
                                    {libro.image_url ? (
                                        <img 
                                            src={libro.image_url} 
                                            alt={libro.nombre} 
                                            className="w-100 rounded-4 shadow-lg transition-all hover-zoom" 
                                            style={{ objectFit: "cover", border: "1px solid rgba(0,0,0,0.1)", maxHeight: "450px" }} 
                                        />
                                    ) : (
                                        <div className="w-100 rounded-4 shadow-sm border bg-light d-flex flex-column align-items-center justify-content-center" style={{ height: "350px" }}>
                                            <i className="fas fa-book fa-4x mb-3 text-info-booked opacity-25"></i>
                                            <span className="fw-bold text-muted">Sin Portada</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* COLUMNA DERECHA: Detalles e IA */}
                            <div className="col-md-8 col-lg-8 d-flex flex-column">
                                
                                {/* Encabezado del Libro */}
                                <div className="mb-4">
                                    <div className="d-flex flex-wrap gap-2 mb-2">
                                        <span className="badge bg-light text-info-booked border border-info px-3 py-2 rounded-pill">
                                            <i className="fas fa-bookmark me-1"></i> {libro.genero || "Género Desconocido"}
                                        </span>
                                        {libro.nombre_editorial && (
                                            <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill">
                                                <i className="fas fa-building me-1"></i> {libro.nombre_editorial}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <h1 className="display-5 fw-bold text-dark mb-1">{libro.nombre}</h1>
                                    <p className="fs-5 text-muted mb-0">
                                        Por <span className="fw-bold text-dark">{libro.nombre_autor || "Autor Anónimo"}</span>
                                    </p>
                                </div>

                                {/* Sinopsis */}
                                <div className="mb-4 flex-grow-1">
                                    <h6 className="fw-bold text-uppercase text-muted small" style={{ letterSpacing: '1px' }}>Sinopsis</h6>
                                    <p className="text-dark" style={{ lineHeight: '1.7', fontSize: '1.05rem' }}>
                                        {libro.descripcion || <span className="fst-italic text-muted">No hay descripción disponible para esta obra.</span>}
                                    </p>
                                </div>

                                {/* SECCIÓN IA: Resumen Inteligente */}
                                <div className="mt-auto pt-4 border-top">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="bg-info-booked rounded-circle d-flex justify-content-center align-items-center text-white me-2 shadow-sm" style={{ width: '35px', height: '35px' }}>
                                            <i className="fas fa-robot"></i>
                                        </div>
                                        <h5 className="fw-bold mb-0 text-dark">Booked AI <span className="fw-normal text-muted fs-6">| Resumen Inteligente</span></h5>
                                    </div>

                                    {store.auth_lector ? (
                                        <div className="bg-light border rounded-4 p-4 position-relative overflow-hidden">
                                            {/* Decoración de fondo */}
                                            <i className="fas fa-brain position-absolute opacity-10" style={{ fontSize: '6rem', right: '-10px', bottom: '-10px', color: '#24b0d9' }}></i>
                                            
                                            <div className="position-relative z-index-1">
                                                {summary || libro.resumen_ia ? (
                                                    <div className="animate__animated animate__fadeIn">
                                                        <p className="fst-italic text-dark mb-0" style={{ whiteSpace: "pre-line", lineHeight: '1.6' }}>
                                                            {summary || libro.resumen_ia}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                                                        <p className="text-muted mb-0 small w-75">
                                                            Nuestra IA puede leer este libro y generar un resumen libre de spoilers destacando los temas principales.
                                                        </p>
                                                        <button
                                                            onClick={handleGenerateSummary}
                                                            className="btn btn-booked-blue rounded-pill fw-bold shadow-sm px-4 py-2 text-nowrap"
                                                            disabled={loadingAI}
                                                        >
                                                            {loadingAI ? (
                                                                <><span className="spinner-border spinner-border-sm me-2"></span>Analizando...</>
                                                            ) : (
                                                                <><i className="fas fa-magic me-2"></i> Generar Resumen</>
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="alert alert-secondary border-0 rounded-4 d-flex align-items-center p-3 shadow-sm mb-0">
                                            <div className="bg-white rounded-circle p-2 me-3 shadow-sm text-secondary">
                                                <i className="fas fa-lock"></i>
                                            </div>
                                            <p className="mb-0 small">
                                                Exclusivo para la comunidad. <Link to="/login_lector" className="fw-bold text-info-booked text-decoration-none">Inicia sesión como lector</Link> para desbloquear el análisis inteligente de esta obra.
                                            </p>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Estilo local para el hover sutil */}
            <style>
                {`
                    .hover-zoom {
                        transition: transform 0.3s ease, box-shadow 0.3s ease;
                    }
                    .hover-zoom:hover {
                        transform: translateY(-3px);
                    }
                `}
            </style>
        </div>
    );
};

export default VerLibro;
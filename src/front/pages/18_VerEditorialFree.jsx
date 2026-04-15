import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const VerEditorialFree = () => {
    const { theId } = useParams();
    const [editorial, setEditorial] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
        fetch(`${baseUrl}/api/editorial/${theId}`)
            .then(response => response.json())
            .then(data => {
                // Si la API devuelve un objeto envuelto (ej: { editorial: {...} }) o directo
                setEditorial(data.editorial || data);
            })
            .catch(err => console.error("Error al cargar editorial:", err));
    }, [theId]);

    // --- PANTALLA DE CARGA ---
    if (editorial === null) {
        return (
            <div className="container-fluid min-vh-100 d-flex flex-column align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
                <div className="spinner-border text-info-booked mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
                <h5 className="text-muted fw-bold">Buscando información de la editorial...</h5>
            </div>
        );
    }

    const nombre = editorial.nombre || "Editorial";
    const imagenFinal = editorial.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=24b0d9&color=fff&size=200`;

    return (
        <div className="container-fluid min-vh-100 py-5" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
            <div className="container">
                <div className="card shadow-lg border-0 rounded-5 overflow-hidden mx-auto" style={{ maxWidth: "850px" }}>
                    
                    {/* BANNER DE CABECERA EDITORIAL */}
                    <div className="bg-info-booked position-relative" style={{ height: "140px", width: "100%" }}>
                        {/* Adorno de fondo en el banner */}
                        <i className="fas fa-book-open position-absolute text-white opacity-25" style={{ fontSize: "8rem", right: "20px", top: "-10px", transform: "rotate(-5deg)" }}></i>
                    </div>

                    <div className="card-body p-4 p-md-5 pt-0">
                        <div className="row">
                            {/* COLUMNA LOGO (Flotante) */}
                            <div className="col-12 col-md-4 text-center text-md-start mb-4 mb-md-0" style={{ marginTop: "-70px" }}>
                                <div className="position-relative d-inline-block">
                                    <img
                                        src={imagenFinal}
                                        alt={nombre}
                                        className="rounded-circle shadow bg-white p-1"
                                        style={{ width: "160px", height: "160px", objectFit: "cover", border: "4px solid white" }}
                                    />
                                    {editorial.is_verified && (
                                        <div 
                                            className="position-absolute bg-primary text-white rounded-circle d-flex align-items-center justify-content-center border border-3 border-white shadow-sm"
                                            style={{ width: "35px", height: "35px", bottom: "10px", right: "10px", fontSize: "16px" }}
                                            title="Sello Oficial Verificado"
                                        >
                                            <i className="fas fa-check"></i>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* COLUMNA DE DATOS */}
                            <div className="col-12 col-md-8 pt-md-3 text-center text-md-start">
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-2">
                                    <h1 className="fw-bold text-dark mb-0 display-6">
                                        {nombre}
                                    </h1>
                                    
                                    {/* ESTADOS DEL PERFIL EDITORIAL */}
                                    <div className="mt-2 mt-md-0">
                                        {editorial.is_verified ? (
                                            <span className="badge bg-success bg-opacity-10 text-success border border-success rounded-pill px-3 py-2">
                                                <i className="fas fa-check-double me-1"></i> Editorial Oficial
                                            </span>
                                        ) : editorial.verification_status === "pending" && editorial.email ? (
                                            <span className="badge bg-warning bg-opacity-10 text-warning border border-warning rounded-pill px-3 py-2 text-dark">
                                                <i className="fas fa-clock me-1"></i> Verificación Pendiente
                                            </span>
                                        ) : (
                                            <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary rounded-pill px-3 py-2">
                                                <i className="fas fa-building-circle-exclamation me-1"></i> Perfil no verificado
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <p className="text-info-booked fw-bold text-uppercase small mb-4" style={{ letterSpacing: "1px" }}>
                                    <i className="fas fa-bookmark me-2"></i>Sello Editorial
                                </p>

                                <div className="row g-3 bg-light p-4 rounded-4 border shadow-sm">
                                    <div className="col-sm-6">
                                        <p className="mb-1 text-muted small fw-bold text-uppercase"><i className="fas fa-envelope me-2"></i>Contacto</p>
                                        <p className="fw-bold text-dark mb-0 text-break">
                                            {editorial.email ? (
                                                <a href={`mailto:${editorial.email}`} className="text-dark text-decoration-none hover-primary">{editorial.email}</a>
                                            ) : (
                                                <span className="text-muted fst-italic">No disponible</span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="col-sm-6">
                                        <p className="mb-1 text-muted small fw-bold text-uppercase"><i className="fas fa-globe-americas me-2"></i>Sede Principal</p>
                                        <p className="fw-bold text-dark mb-0">
                                            {editorial.pais || <span className="text-muted fst-italic">Desconocido</span>}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="my-4 opacity-25" />

                        {/* PIE DE TARJETA: Botones */}
                        <div className="d-flex justify-content-center justify-content-md-start">
                            <button
                                className="btn btn-light border rounded-pill px-4 shadow-sm fw-bold text-muted"
                                onClick={() => navigate(-1)}
                            >
                                <i className="fas fa-arrow-left me-2"></i> Volver atrás
                            </button>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerEditorialFree;
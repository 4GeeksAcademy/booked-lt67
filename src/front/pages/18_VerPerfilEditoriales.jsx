import React, { useEffect, useState, useCallback } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { Link } from "react-router-dom";

const VerPerfilEditorial = () => {
    const { store } = useGlobalReducer();
    const [editoriales, setEditoriales] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEditoriales = useCallback(async () => {
        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
            const responseEd = await fetch(`${baseUrl}/api/editorial`);
            
            if (responseEd.ok) {
                const data = await responseEd.json();
                // Ordenamos alfabéticamente por nombre de la editorial
                const editorialesOrdenadas = data.sort((a, b) => a.nombre.localeCompare(b.nombre));
                setEditoriales(editorialesOrdenadas);
            }
        } catch (error) {
            console.error("Error cargando perfiles de editoriales:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEditoriales();
    }, [fetchEditoriales]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
                <div className="spinner-border text-info-booked" role="status" style={{ width: '3rem', height: '3rem' }}></div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 py-5" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
            <div className="container">
                
                {/* --- ENCABEZADO --- */}
                <div className="text-center mb-5 mt-3">
                    <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— Red Editorial</span>
                    <h1 className="display-5 fw-bold text-dark mt-2 mb-3">Sellos Editoriales</h1>
                    <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
                        Descubre y conecta con las casas editoriales que forman parte de nuestro ecosistema, y explora sus catálogos literarios.
                    </p>
                </div>

                {/* --- LISTA DE EDITORIALES EN GRILLA --- */}
                <div className="row g-4">
                    {editoriales.length === 0 ? (
                        <div className="col-12 text-center bg-white p-5 rounded-5 shadow-sm border-0">
                            <i className="fas fa-building fa-3x mb-3 text-info-booked opacity-50"></i>
                            <h4 className="fw-bold text-dark">No hay editoriales registradas</h4>
                            <p className="text-muted mb-0">La plataforma está esperando a su primera editorial.</p>
                        </div>
                    ) : (
                        editoriales.map((ed) => {
                            const logoUrl = ed.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(ed.nombre)}&background=24b0d9&color=fff&size=150`;

                            return (
                                <div key={ed.id} className="col-md-6 col-lg-4 col-xl-3">
                                    <div className="card h-100 shadow-sm border-0 rounded-4 bg-white hover-zoom transition-all">
                                        <div className="card-body p-4 text-center d-flex flex-column align-items-center">
                                            
                                            {/* Logo de la Editorial */}
                                            <div className="position-relative mb-3">
                                                <img
                                                    src={logoUrl}
                                                    alt={ed.nombre}
                                                    className="rounded-circle shadow-sm border border-3 border-light"
                                                    style={{ width: "90px", height: "90px", objectFit: "cover" }}
                                                />
                                                {/* Badge de Verificado */}
                                                {ed.is_verified && (
                                                    <div 
                                                        className="position-absolute bg-primary text-white rounded-circle d-flex align-items-center justify-content-center border border-2 border-white"
                                                        style={{ width: "24px", height: "24px", bottom: "5px", right: "0px", fontSize: "10px" }}
                                                        title="Sello Oficial Verificado"
                                                    >
                                                        <i className="fas fa-check"></i>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Datos de la Editorial */}
                                            <h5 className="fw-bold text-dark mb-1 text-truncate w-100 px-2" title={ed.nombre}>
                                                {ed.nombre}
                                            </h5>
                                            
                                            <p className="small text-muted mb-3 d-flex align-items-center justify-content-center gap-1">
                                                <i className="fas fa-globe-americas text-info-booked opacity-75"></i> 
                                                {ed.pais || "Internacional"}
                                            </p>

                                            {/* Botón Inferior */}
                                            <div className="mt-auto w-100 pt-3 border-top">
                                                <Link 
                                                    to={`/ver_editorial_free/${ed.id}`} 
                                                    className="btn btn-outline-info rounded-pill px-4 w-100 fw-bold"
                                                >
                                                    Ver Editorial
                                                </Link>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

            </div>

            {/* Estilo local para hover */}
            <style>
                {`
                    .hover-zoom:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
                    }
                    .transition-all {
                        transition: all 0.3s ease;
                    }
                `}
            </style>
        </div>
    );
};

export default VerPerfilEditorial;
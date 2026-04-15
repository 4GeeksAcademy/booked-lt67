import React, { useEffect, useState, useCallback } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { Link } from "react-router-dom";

const VerPerfilAutorEditorial = () => {
    const { store } = useGlobalReducer();
    const [autores, setAutores] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAutores = useCallback(async () => {
        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
            const responseAut = await fetch(`${baseUrl}/api/autor`);
            
            if (responseAut.ok) {
                const data = await responseAut.json();
                // Ordenamos alfabéticamente por nombre
                const autoresOrdenados = data.sort((a, b) => a.nombre.localeCompare(b.nombre));
                setAutores(autoresOrdenados);
            }
        } catch (error) {
            console.error("Error cargando perfiles de autores:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAutores();
    }, [fetchAutores]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
                <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}></div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 py-5" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
            <div className="container">
                
                {/* --- ENCABEZADO --- */}
                <div className="text-center mb-5 mt-3">
                    <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— Directorio Booked</span>
                    <h1 className="display-5 fw-bold text-dark mt-2 mb-3">Nuestros Autores</h1>
                    <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
                        Explora los perfiles de los creadores literarios registrados en nuestra comunidad y descubre a tu próximo escritor favorito.
                    </p>
                </div>

                {/* --- LISTA DE AUTORES --- */}
                <div className="row g-4">
                    {autores.length === 0 ? (
                        <div className="col-12 text-center bg-white p-5 rounded-5 shadow-sm border-0">
                            <i className="fas fa-pen-nib fa-3x mb-3 text-success opacity-50"></i>
                            <h4 className="fw-bold text-dark">No hay autores registrados</h4>
                            <p className="text-muted mb-0">La comunidad está esperando a su primer creador.</p>
                        </div>
                    ) : (
                        autores.map((aut) => {
                            const nombreCompleto = `${aut.nombre} ${aut.apellido || ""}`.trim();
                            const avatarUrl = aut.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&background=198754&color=fff&size=150`;

                            return (
                                <div key={aut.id} className="col-md-6 col-lg-4 col-xl-3">
                                    <div className="card h-100 shadow-sm border-0 rounded-4 bg-white hover-zoom transition-all">
                                        <div className="card-body p-4 text-center d-flex flex-column align-items-center">
                                            
                                            {/* Avatar del Autor */}
                                            <div className="position-relative mb-3">
                                                <img
                                                    src={avatarUrl}
                                                    alt={nombreCompleto}
                                                    className="rounded-circle shadow-sm border border-3 border-light"
                                                    style={{ width: "90px", height: "90px", objectFit: "cover" }}
                                                />
                                                {/* Badge de Verificado */}
                                                {aut.is_verified && (
                                                    <div 
                                                        className="position-absolute bg-primary text-white rounded-circle d-flex align-items-center justify-content-center border border-2 border-white"
                                                        style={{ width: "24px", height: "24px", bottom: "5px", right: "0px", fontSize: "10px" }}
                                                        title="Perfil Oficial Verificado"
                                                    >
                                                        <i className="fas fa-check"></i>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Datos del Autor */}
                                            <h5 className="fw-bold text-dark mb-1 text-truncate w-100 px-2" title={nombreCompleto}>
                                                {nombreCompleto}
                                            </h5>
                                            
                                            <p className="small text-muted mb-3 d-flex align-items-center justify-content-center gap-1">
                                                <i className="fas fa-map-marker-alt text-info-booked opacity-75"></i> 
                                                {aut.pais || "Desconocido"}
                                            </p>

                                            {/* Botón Inferior */}
                                            <div className="mt-auto w-100 pt-3 border-top">
                                                <Link 
                                                    to={`/ver_autor_free/${aut.id}`} 
                                                    className="btn btn-outline-info rounded-pill px-4 w-100 fw-bold"
                                                >
                                                    Ver Perfil
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

export default VerPerfilAutorEditorial;
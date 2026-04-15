import React, { useEffect, useState, useCallback } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { Link } from "react-router-dom";

const PostSinLogin = () => {
    const { store } = useGlobalReducer();
    const [postsAutor, setPostsAutor] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = useCallback(async () => {
        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
            const response = await fetch(`${baseUrl}/api/postautor`);
            
            if (response.ok) {
                const data = await response.json();
                // Ordenamos los posts para que los más nuevos salgan arriba
                const postsOrdenados = data.sort((a, b) => b.id - a.id);
                setPostsAutor(postsOrdenados);
            }
        } catch (error) {
            console.error("Error cargando posts de autores:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
                <div className="spinner-border text-success" role="status"></div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 py-5" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
            <div className="container">
                
                {/* --- ENCABEZADO DEL FORO --- */}
                <div className="text-center mb-5 mt-3">
                    <span className="text-success fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— La voz de los creadores</span>
                    <h1 className="display-5 fw-bold text-dark mt-2 mb-3">Foro de Autores</h1>
                    <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
                        Descubre los últimos pensamientos, procesos creativos y actualizaciones directamente de las mentes detrás de tus historias favoritas.
                    </p>
                </div>

                {/* --- FEED DE PUBLICACIONES --- */}
                <div className="row justify-content-center">
                    <div className="col-lg-8"> 
                        {postsAutor.length === 0 ? (
                            <div className="text-center bg-white p-5 rounded-5 shadow-sm border-0">
                                <i className="fas fa-feather-alt fa-3x mb-3 text-success opacity-50"></i>
                                <h4 className="fw-bold text-dark">Sin publicaciones recientes</h4>
                                <p className="text-muted mb-0">Nuestros autores están concentrados escribiendo. ¡Vuelve pronto!</p>
                            </div>
                        ) : (
                            postsAutor.map((post) => (
                                <div key={post.id} className="card shadow-sm border-0 rounded-4 mb-4 bg-white overflow-hidden">
                                    <div className="card-body p-4 p-md-5">
                                        
                                        {/* Cabecera del Post (Avatar, Nombre y Fecha) */}
                                        <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border shadow-sm flex-shrink-0"
                                                 style={{ width: "55px", height: "55px", overflow: "hidden" }}>
                                                {post.foto_autor ? (
                                                    <img src={post.foto_autor} alt={`${post.nombre_autor} ${post.apellido_autor || ''}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <i className="fas fa-feather-alt text-success fs-4"></i>
                                                )}
                                            </div>
                                            
                                            <div className="ms-3">
                                                <h6 className="fw-bold mb-0 text-dark fs-5">
                                                    {post.nombre_autor} {post.apellido_autor || ""}
                                                </h6>
                                                <small className="text-muted d-flex align-items-center fw-bold" style={{ fontSize: '0.8rem' }}>
                                                    <i className="far fa-clock me-2 text-success"></i> {post.fecha}
                                                </small>
                                            </div>
                                            
                                            {/* Badge en la esquina superior derecha */}
                                            <div className="ms-auto d-none d-sm-block">
                                                <span className="badge bg-success text-white rounded-pill px-3 py-2 small shadow-sm">
                                                    Autor
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Cuerpo del Mensaje */}
                                        <p className="card-text text-dark" style={{ whiteSpace: 'pre-wrap', fontSize: '1.1rem', lineHeight: '1.6' }}>
                                            {post.texto}
                                        </p>
                                        
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PostSinLogin;
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../shelfStyles.css";

const VerAutorFree = () => {
    const { theId } = useParams();
    const [autor, setAutor] = useState(null);
    const [posts, setPosts] = useState([]); // Estado para los posts
    const navigate = useNavigate();

    useEffect(() => {
        const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

        // Carga de datos del autor
        fetch(`${baseUrl}/api/autor/${theId}`)
            .then(response => response.json())
            .then(data => {
                setAutor(data.autor || data);
            })
            .catch(err => console.error("Error cargando autor:", err));

        // Carga de posts del autor
        fetch(`${baseUrl}/api/postautor/autor/${theId}`)
            .then(response => response.json())
            .then(data => {
                setPosts(Array.isArray(data) ? data : (data.posts || []));
            })
            .catch(err => console.error("Error cargando posts:", err));
    }, [theId]);

    if (autor === null) {
        return (
            <div className="container-fluid min-vh-100 d-flex flex-column align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
                <div className="spinner-border text-info-booked mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
                <h5 className="text-muted fw-bold">Buscando información del autor...</h5>
            </div>
        );
    }

    const nombreCompleto = `${autor.nombre} ${autor.apellido || ""}`.trim();
    const imagenFinal = autor.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&background=24b0d9&color=fff&size=200`;

    return (
        <div className="container-fluid min-vh-100 py-5" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
            <div className="container">
                <button
                    className="btn btn-sm btn-light border rounded-pill px-3 shadow-sm mb-4 text-muted fw-bold"
                    onClick={() => navigate(-1)}
                >
                    <i className="fas fa-arrow-left me-2"></i>Volver
                </button>

                <div className="card shadow-lg border-0 rounded-5 overflow-hidden mx-auto mb-5" style={{ maxWidth: "1000px" }}>
                    {/* BANNER DE CABECERA */}
                    <div className="bg-info-booked position-relative" style={{ height: "140px", width: "100%" }}>
                        <i className="fas fa-feather-alt position-absolute text-white opacity-25" style={{ fontSize: "8rem", right: "20px", top: "-20px", transform: "rotate(15deg)" }}></i>
                    </div>

                    <div className="card-body p-4 p-md-5 pt-0">
                        <div className="row mb-5">
                            {/* FOTO DE PERFIL */}
                            <div className="col-12 col-md-4 text-center text-md-start mb-4 mb-md-0" style={{ marginTop: "-70px" }}>
                                <div className="position-relative d-inline-block">
                                    <img
                                        src={imagenFinal}
                                        alt={nombreCompleto}
                                        className="rounded-circle shadow bg-white p-1"
                                        style={{ width: "160px", height: "160px", objectFit: "cover", border: "4px solid white" }}
                                    />
                                    {autor.is_verified && (
                                        <div className="position-absolute bg-primary text-white rounded-circle d-flex align-items-center justify-content-center border border-3 border-white shadow-sm"
                                            style={{ width: "35px", height: "35px", bottom: "10px", right: "10px" }}>
                                            <i className="fas fa-check"></i>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* DATOS DEL AUTOR */}
                            <div className="col-12 col-md-8 pt-md-3 text-center text-md-start">
                                <h1 className="fw-bold text-dark mb-1 display-6">{nombreCompleto}</h1>
                                <p className="text-info-booked fw-bold text-uppercase small mb-4" style={{ letterSpacing: "1px" }}>
                                    <i className="fas fa-pen-nib me-2"></i>Escritor Verificado
                                </p>

                                <div className="row g-3 bg-light p-4 rounded-4 border shadow-sm">
                                    <div className="col-sm-4 text-center border-end">
                                        <p className="mb-1 text-muted small fw-bold text-uppercase">Libros</p>
                                        <p className="fw-bold text-dark mb-0 fs-5">{autor.libros?.length || 0}</p>
                                    </div>
                                    <div className="col-sm-4 text-center border-end">
                                        <p className="mb-1 text-muted small fw-bold text-uppercase">País</p>
                                        <p className="fw-bold text-dark mb-0">{autor.pais || "—"}</p>
                                    </div>
                                    <div className="col-sm-4 text-center">
                                        <p className="mb-1 text-muted small fw-bold text-uppercase">Posts</p>
                                        <p className="fw-bold text-dark mb-0 fs-5">{posts.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- SECCIÓN DE LIBROS: ESTILO ESTANTERÍA 3D --- */}
                        <div className="mt-5">
                            <div className="mb-4">
                                <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— Mi Obra Literaria</span>
                                <h3 className="fw-bold text-dark mt-2">Biblioteca de {autor.nombre}</h3>
                            </div>

                            <div className="row bookshelf-grid">
                                {autor.libros && autor.libros.length > 0 ? (
                                    autor.libros.map((libro) => (
                                        <div key={libro.id} className="col-6 col-md-4 col-lg-3 mb-5 shelf-item px-3">
                                            <div className="shelf-cubby">
                                                <div className="book-3d" onClick={() => navigate(`/ver_libro/${libro.id}`)}>
                                                    <img src={libro.image_url || "https://via.placeholder.com/200x300?text=Booked"} alt={libro.nombre} />
                                                </div>
                                                <div className="shelf-floor-wood"></div>
                                            </div>

                                            <div className="text-center mt-3">
                                                <h6 className="fw-bold text-dark mb-1 text-truncate" style={{ fontSize: '0.9rem' }}>
                                                    {libro.nombre}
                                                </h6>
                                                <div className="d-flex justify-content-center align-items-center gap-2 mt-2">
                                                    <span
                                                        className="badge bg-info-booked bg-opacity-10 text-info-booked rounded-pill d-inline-flex align-items-center justify-content-center border border-info-booked border-opacity-25"
                                                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', minHeight: '31px', lineHeight: '1' }}
                                                    >
                                                        {libro.genero || "General"}
                                                    </span>
                                                    <Link
                                                        to={`/ver_libro/${libro.id}`}
                                                        className="btn btn-sm btn-booked-blue rounded-pill px-3 py-1 shadow-sm d-inline-flex align-items-center"
                                                        style={{ fontSize: '0.75rem', minHeight: '31px' }}
                                                    >
                                                        <i className="fas fa-eye me-1"></i> Ver
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12 text-center py-5 bg-light rounded-4 border border-dashed">
                                        <p className="text-muted mb-0">Este autor aún no tiene libros en su estantería.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <hr className="my-5 opacity-25" />

                        {/* --- SECCIÓN DE POSTS/NOVEDADES --- */}
                        <div className="mt-5">
                            <div className="mb-4">
                                <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— Novedades</span>
                                <h3 className="fw-bold text-dark mt-2">Muro del Autor</h3>
                            </div>

                            <div className="row">
                                {posts.length > 0 ? (
                                    posts.map(post => (
                                        <div key={post.id} className="col-md-6 mb-4">
                                            <div className="card p-4 shadow-sm border-0 bg-white rounded-4 h-100 card-noticia-autor border-start border-info-booked border-4">
                                                <div className="d-flex justify-content-between border-bottom pb-2 mb-3">
                                                    <small className="text-info-booked fw-bold">
                                                        <i className="far fa-calendar-alt me-1"></i> {post.fecha || 'Reciente'}
                                                    </small>
                                                    <i className="fas fa-quote-right text-light fs-4"></i>
                                                </div>
                                                <p className="mb-0 text-muted" style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                                    {post.texto}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12 text-center p-5 bg-light rounded-4 border border-dashed">
                                        <i className="fas fa-comment-dots fa-3x mb-3 text-info-booked opacity-25"></i>
                                        <p className="text-muted fw-bold">El autor no ha realizado publicaciones todavía.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <style>
                {`
                .bookshelf-grid { display: flex; flex-wrap: wrap; justify-content: center; }
                .text-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .border-dashed { border: 2px dashed rgba(0,0,0,0.1) !important; }
                .card-noticia-autor { transition: transform 0.3s ease; }
                .card-noticia-autor:hover { transform: translateY(-5px); }
                .bg-info-booked { background-color: #24b0d9 !important; }
                .btn-booked-blue { background-color: #24b0d9; color: white; border: none; }
                .btn-booked-blue:hover { background-color: #1d8ea0; color: white; }
                .text-info-booked { color: #24b0d9 !important; }
                `}
            </style>
        </div>
    );
};

export default VerAutorFree;
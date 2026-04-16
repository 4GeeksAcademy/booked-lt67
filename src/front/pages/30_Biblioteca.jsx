import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import BuscadorGoogleBooks from "../components/23_BuscadorGoogleBooks";
import BuscarLibroIA from "../components/25_BuscarLibroIA";

const Biblioteca = () => {
    const { store } = useGlobalReducer();
    const navigate = useNavigate();

    // Estado para el modal de reseñas
    const [libroParaReviews, setLibroParaReviews] = useState(null);

    // Estado para los datos de la biblioteca
    const [libros, setLibros] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const api = `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")}/api`;

    const loadData = useCallback(async () => {
        try {
            // Traemos TODOS los libros y las reseñas en paralelo
            const [resLibros, resReviews] = await Promise.all([
                fetch(`${api}/libro`),
                fetch(`${api}/reviews`)
            ]);

            if (resLibros.ok && resReviews.ok) {
                const dataLibros = await resLibros.json();
                const dataReviews = await resReviews.json();

                // Puedes aplicar un sort aquí si quieres que salgan por orden alfabético o los más nuevos primero
                setLibros(dataLibros.sort((a, b) => b.id - a.id)); 
                setReviews(dataReviews);
            }
        } catch (error) {
            console.error("Error cargando biblioteca global:", error);
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const irAlLibro = (id) => navigate(`/ver_libro/${id}`);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
                <div className="spinner-border text-info-booked" role="status" style={{ width: '3rem', height: '3rem' }}></div>
            </div>
        );
    }

    // =========================================================
    // COMPONENTE: TARJETA DE LIBRO (ESTILO NICHO DE MADERA)
    // =========================================================
    const LibroEnNichoRealista = ({ l }) => {
        return (
            <div className="col-12 col-sm-6 col-lg-4 col-xl-3 mb-5 shelf-item px-3 position-relative z-index-1">
                
                {/* Nicho de estantería individual con textura de madera rica y profundidad */}
                <div className="shelf-cubby-realistic position-relative rounded-4 shadow-lg overflow-hidden border">
                    
                    {/* Fondo de madera oscura y profunda (Textura Rica) */}
                    <div className="shelf-wood-background position-absolute top-0 start-0 w-100 h-100 rounded-4 z-index-1 detailed-wood-texture"></div>

                    {/* El libro físico apoyado en la repisa */}
                    <div className="book-physical position-relative z-index-3 mt-3 mx-auto" onClick={() => irAlLibro(l.id)} title={l.nombre}>
                        <img
                            src={l.image_url || "https://via.placeholder.com/150x225?text=No+Cover"}
                            alt={l.nombre}
                            className="book-cover-img shadow-lg"
                        />
                        {/* Efecto de lomo y brillo del libro */}
                        <div className="book-spine-glare"></div>
                    </div>

                    {/* Repisa de madera tridimensional (Suelo del nicho) */}
                    <div className="shelf-floor detailed-wood-texture-light position-absolute bottom-0 start-0 w-100 z-index-2"></div>
                </div>

                {/* Detalles y botones integrados sobre la tarjeta de estante individual */}
                <div className="book-details-text pt-3 text-center position-relative z-index-4 px-2">
                    <h6 className="fw-bold text-dark mb-1 text-truncate" style={{ fontSize: '0.95rem' }} title={l.nombre}>
                        {l.nombre}
                    </h6>
                    <p className="small text-muted mb-3 text-truncate" title={l.nombre_autor || "Autor Desconocido"}>
                        {l.nombre_autor || "Autor Desconocido"}
                    </p>

                    <div className="d-flex justify-content-center gap-2 flex-wrap pb-2">
                        {/* Botón Reseñas */}
                        <button
                            className="btn btn-sm btn-outline-info bg-white rounded-pill px-3 shadow-sm d-flex align-items-center gap-1"
                            onClick={() => setLibroParaReviews(l)}
                            title="Ver Reseñas"
                        >
                            <i className="fas fa-star text-warning"></i> Reseñas
                        </button>
                        
                        {/* Botón Detalles */}
                        <button onClick={() => irAlLibro(l.id)} className="btn btn-sm btn-booked-blue rounded-pill px-3 shadow-sm">
                            Detalles
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-vh-100 position-relative py-5 library-background-realistic" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
            
            {/* OVERLAY PARA MOSTRAR LAS REVIEWS DEL LIBRO */}
            {libroParaReviews && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1050 }}>
                    <div className="bg-white rounded-4 shadow-lg p-4 animate__animated animate__zoomIn" style={{ width: "90%", maxWidth: "600px", maxHeight: "80vh", overflowY: "auto" }}>
                        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                            <h4 className="fw-bold text-dark mb-0">Reseñas: {libroParaReviews.nombre}</h4>
                            <button className="btn-close" onClick={() => setLibroParaReviews(null)}></button>
                        </div>

                        <div className="d-flex flex-column gap-3">
                            {reviews.filter(r => r.libro?.id === libroParaReviews.id).length > 0 ? (
                                reviews.filter(r => r.libro?.id === libroParaReviews.id).map(rev => (
                                    <div key={rev.id} className="p-3 border rounded-3 bg-light shadow-sm">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <div className="bg-info-booked rounded-circle d-flex align-items-center justify-content-center text-white fw-bold overflow-hidden border border-2 border-white shadow-sm"
                                                style={{ width: '40px', height: '40px' }}>
                                                {rev.foto_lector ? (
                                                    <img src={rev.foto_lector} alt={rev.nombre_lector} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <span>{rev.nombre_lector?.charAt(0).toUpperCase() || "L"}</span>
                                                )}
                                            </div>
                                            <span className="fw-bold small text-dark">{rev.nombre_lector}</span>
                                            <span className="ms-auto text-warning fw-bold small">
                                                <i className="fas fa-star me-1"></i>{rev.puntuacion}/10
                                            </span>
                                        </div>
                                        <p className="mb-0 text-muted fst-italic">"{rev.texto}"</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-muted my-4 py-4">
                                    <i className="fas fa-comment-slash fa-2x mb-3 opacity-50"></i>
                                    <p className="mb-0">No hay reseñas para este libro todavía.</p>
                                    <p className="small">Sé el primero en opinar desde los detalles del libro.</p>
                                </div>
                            )}
                        </div>

                        <div className="text-end mt-4 pt-3 border-top">
                            {store.auth_lector && (
                                <Link to="/nueva_review" state={{ libroId: libroParaReviews?.id }} className="btn btn-booked-blue rounded-pill me-2 shadow-sm">
                                    Escribir Reseña
                                </Link>
                            )}
                            <button className="btn btn-secondary rounded-pill px-4" onClick={() => setLibroParaReviews(null)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="container">
                {/* --- ENCABEZADO Y HERRAMIENTAS --- */}
                <div className="row align-items-center mb-5">
                    <div className="col-lg-6 text-center text-lg-start mb-4 mb-lg-0">
                        <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— Catálogo Global</span>
                        <h1 className="display-4 fw-bold text-dark mt-2 mb-3">Biblioteca Booked</h1>
                        <p className="lead text-muted mb-0">Explora todos los títulos de la comunidad, lee reseñas y encuentra tu próxima gran lectura.</p>
                    </div>
                </div>

                <hr className="mb-5 opacity-25" />

                {/* --- GRILLA DE LIBROS ESTILO MUEBLE REALISTA INDIVIDUAL --- */}
                <div className="row bookshelf-realism-grid justify-content-center px-2">
                    {libros.length > 0 ? (
                        libros.map(l => <LibroEnNichoRealista key={l.id} l={l} />)
                    ) : (
                        <div className="col-12 text-center text-muted py-5 my-5 bg-white rounded-5 shadow-sm">
                            <i className="fas fa-books fa-3x mb-3 text-info-booked opacity-50"></i>
                            <h4>La biblioteca está vacía.</h4>
                            <p className="mb-0">Utiliza el buscador superior para añadir el primer libro al catálogo.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- ESTILOS CSS MAGIA 3D Y MADERA --- */}
            <style>
                {`
                    /* Contenedor de la grilla con perspectiva global */
                    .bookshelf-realism-grid {
                        perspective: 2000px;
                    }

                    /* Estructura del nicho individual */
                    .shelf-cubby-realistic {
                        background-color: transparent !important;
                        position: relative;
                        height: 250px; 
                        perspective: 1000px; 
                        border: 2px solid #4e342e !important; 
                        transform-style: preserve-3d;
                        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    }

                    /* Efecto hover 3D en la tarjeta de estante */
                    .shelf-item:hover .shelf-cubby-realistic {
                        transform: translateY(-8px) rotateX(4deg);
                        box-shadow: 0 25px 40px rgba(0,0,0,0.3) !important;
                    }

                    /* Textura de madera detallada (Fondo del nicho) */
                    .detailed-wood-texture {
                        background-color: #3e2723; 
                        background-image: url('https://img.freepik.com/premium-photo/design-element-wood-texture-background-wooden-texture-floor-shelf-product-display-commercial-ads_315337-5446.jpg');
                        background-size: cover;
                        background-repeat: no-repeat;
                        background-position: center;
                        border-radius: 12px;
                        box-shadow: inset 0 15px 30px rgba(0,0,0,0.8); /* Sombra interior muy profunda */
                    }

                    /* EL LIBRO FÍSICO 3D (Sobre la repisa) */
                    .book-physical {
                        position: relative;
                        z-index: 3;
                        width: 105px; /* Tamaño estandarizado */
                        height: 160px;
                        cursor: pointer;
                        /* Sombra realista proyectada en el fondo oscuro */
                        box-shadow: 15px 15px 20px rgba(0,0,0,0.6), inset -2px 0px 4px rgba(255,255,255,0.3);
                        border-radius: 2px 5px 5px 2px;
                        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        transform-origin: bottom center;
                    }

                    .book-physical:hover {
                        transform: scale(1.05) translateZ(15px);
                    }

                    /* La portada del libro */
                    .book-cover-img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        border-radius: 2px 5px 5px 2px;
                    }

                    /* Efecto de lomo y brillo estilo cristal */
                    .book-spine-glare {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(to right, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 12%, rgba(255,255,255,0) 88%, rgba(0,0,0,0.15) 100%);
                        border-left: 3px solid rgba(0,0,0,0.15);
                        border-radius: 2px 5px 5px 2px;
                        pointer-events: none;
                    }

                    /* REPISA DE MADERA (Suelo del nicho individual) */
                    .detailed-wood-texture-light {
                        background-color: #8d6e63;
                        background-image: url('https://img.freepik.com/premium-photo/brown-wooden-table-shelf-texture-background_34810-1351.jpg');
                        background-size: cover;
                        background-position: bottom;
                    }

                    .shelf-floor {
                        height: 25px; /* Grosor del suelo de madera */
                        border-top: 2px solid #bcaaa4; /* Borde superior que simula la luz pegando en el filo */
                        box-shadow: 0 8px 15px rgba(0,0,0,0.5);
                        border-radius: 0 0 12px 12px;
                    }

                    /* ZONA DE DETALLES Y BOTONES */
                    .book-details-text {
                        position: relative;
                        width: 100%;
                        z-index: 0;
                    }

                    /* Auxiliares z-index */
                    .z-index-1 { z-index: 1; }
                    .z-index-2 { z-index: 2; }
                    .z-index-3 { z-index: 3; }
                    .z-index-4 { z-index: 4; }
                `}
            </style>
        </div>
    );
};

export default Biblioteca;
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

    // Estado unificado de la base de datos
    const [db, setDb] = useState({
        todos: [],
        favoritos: [],
        leyendo: [],
        reviews: [],
        loading: true
    });

    const api = `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")}/api`;

    const request = async (url, m = "GET", b = null) => {
        try {
            const res = await fetch(`${api}/${url}`, {
                method: m,
                headers: { "Content-Type": "application/json" },
                body: b ? JSON.stringify(b) : null
            });
            return res.ok ? await res.json() : null;
        } catch (e) { return null; }
    };

    const loadData = useCallback(async () => {
        try {
            // Peticiones base que siempre se hacen (Catálogo y Reseñas)
            const promesas = [
                request(`libro`),
                request(`reviews`)
            ];

            // Si hay un lector logueado, traemos su información personalizada
            if (store.auth_lector && store.lector_id) {
                promesas.push(request(`lector/${store.lector_id}/favoritos`));
                promesas.push(request(`lector/${store.lector_id}/leyendo`));
            }

            const resultados = await Promise.all(promesas);

            setDb({
                todos: resultados[0] || [],
                reviews: resultados[1] || [],
                favoritos: resultados[2] || [], // Si no hay usuario, queda vacío
                leyendo: resultados[3] || [],   // Si no hay usuario, queda vacío
                loading: false
            });
        } catch (error) {
            console.error("Error cargando biblioteca:", error);
            setDb(prev => ({ ...prev, loading: false }));
        }
    }, [store.auth_lector, store.lector_id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const execAccionLector = async (url, method, body) => {
        if (!store.auth_lector) {
            alert("Debes iniciar sesión como Lector para guardar libros en tu colección personal.");
            navigate("/login_lector");
            return;
        }
        if (await request(url, method, body)) {
            loadData(); // Recargamos para actualizar los colores de los botones
        }
    };

    const irAlLibro = (id) => navigate(`/ver_libro/${id}`);

    if (db.loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
                <div className="spinner-border text-info-booked" role="status" style={{ width: '3rem', height: '3rem' }}></div>
            </div>
        );
    }

    // =========================================================
    // COMPONENTE INTERNO: TARJETA DE LIBRO
    // =========================================================
    const TarjetaLibro = ({ l }) => {
        const esFavorito = db.favoritos.some(f => (f.libro?.id || f.libro_id) === l.id);
        const loEstaLeyendo = db.leyendo.some(ley => (ley.libro?.id || ley.libro_id) === l.id);

        return (
            <div className="col-md-4 col-lg-3 mb-5" style={{ marginTop: '110px' }}>
                <div className="card-feature text-center h-100 shadow-sm border-0 bg-white d-flex flex-column hover-zoom transition-all rounded-4 pb-3">
                    
                    <div className="book-cover-floating">
                        <img
                            src={l.image_url || "https://via.placeholder.com/150x225?text=No+Cover"}
                            className="portada-full shadow"
                            alt={l.nombre}
                            style={{ cursor: "pointer" }}
                            onClick={() => irAlLibro(l.id)}
                        />
                    </div>

                    <div className="flex-grow-1 d-flex flex-column mt-3 px-3">
                        <h6 className="fw-bold text-dark mb-1 text-truncate" title={l.nombre}>
                            {l.nombre}
                        </h6>
                        <p className="small text-muted mb-3 text-truncate" title={l.nombre_autor || "Autor Desconocido"}>
                            {l.nombre_autor || "Autor Desconocido"}
                        </p>

                        <div className="d-flex justify-content-center gap-2 mt-auto flex-wrap">
                            {/* Botón Leyendo */}
                            <button
                                className={`btn btn-sm rounded-pill px-2 ${loEstaLeyendo ? 'btn-warning text-white shadow-sm' : 'btn-outline-warning'}`}
                                onClick={() => execAccionLector(
                                    loEstaLeyendo ? `leyendo/libros/${store.lector_id}/${l.id}` : `leyendo/libros`,
                                    loEstaLeyendo ? "DELETE" : "POST",
                                    loEstaLeyendo ? null : { lector_id: store.lector_id, libro_id: l.id }
                                )}
                                title={loEstaLeyendo ? "Dejar de leer" : "Marcar como leyendo"}
                            >
                                <i className="fas fa-book-open"></i>
                            </button>
                            
                            {/* Botón Favorito */}
                            <button
                                className={`btn btn-sm rounded-pill px-2 ${esFavorito ? 'btn-danger shadow-sm' : 'btn-outline-danger'}`}
                                onClick={() => execAccionLector(
                                    esFavorito ? `favoritos/libros/${store.lector_id}/${l.id}` : `favoritos/libros`,
                                    esFavorito ? "DELETE" : "POST",
                                    esFavorito ? null : { lector_id: store.lector_id, libro_id: l.id }
                                )}
                                title={esFavorito ? "Quitar de favoritos" : "Añadir a favoritos"}
                            >
                                <i className={`fa${esFavorito ? 's' : 'r'} fa-heart`}></i>
                            </button>

                            {/* Botón Reseñas */}
                            <button
                                className="btn btn-sm btn-outline-info rounded-pill px-2"
                                onClick={() => setLibroParaReviews(l)}
                                title="Ver Reseñas"
                            >
                                <i className="fas fa-star"></i>
                            </button>

                            {/* Botón Detalles */}
                            <button onClick={() => irAlLibro(l.id)} className="btn btn-sm btn-booked-blue rounded-pill px-3 shadow-sm">
                                Detalles
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-vh-100 position-relative py-5" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
            
            {/* OVERLAY PARA MOSTRAR LAS REVIEWS DEL LIBRO */}
            {libroParaReviews && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}>
                    <div className="bg-white rounded-4 shadow-lg p-4 animate__animated animate__zoomIn" style={{ width: "90%", maxWidth: "600px", maxHeight: "80vh", overflowY: "auto" }}>
                        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                            <h4 className="fw-bold text-dark mb-0">Reseñas: {libroParaReviews.nombre}</h4>
                            <button className="btn-close" onClick={() => setLibroParaReviews(null)}></button>
                        </div>

                        <div className="d-flex flex-column gap-3">
                            {db.reviews.filter(r => r.libro?.id === libroParaReviews.id).length > 0 ? (
                                db.reviews.filter(r => r.libro?.id === libroParaReviews.id).map(rev => (
                                    <div key={rev.id} className="p-3 border rounded-3 bg-light">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <div className="bg-info-booked rounded-circle d-flex align-items-center justify-content-center text-white fw-bold overflow-hidden"
                                                style={{ width: '35px', height: '35px' }}>
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
                                <div className="text-center text-muted my-4">
                                    <i className="fas fa-comment-slash fa-2x mb-3 opacity-50"></i>
                                    <p>No hay reseñas para este libro todavía. ¡Sé el primero en opinar!</p>
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
                        <p className="lead text-muted mb-0">Explora miles de títulos, lee reseñas y añade obras a tu colección personal.</p>
                    </div>

                    <div className="col-lg-6">
                        {/* Herramientas de búsqueda importadas */}
                        <div className="d-flex flex-column gap-3">
                            <div className="p-2 bg-white shadow-sm rounded-4 border">
                                <BuscadorGoogleBooks onLibroAgregado={irAlLibro} />
                            </div>
                            <BuscarLibroIA />
                        </div>
                    </div>
                </div>

                <hr className="mb-5 opacity-25" />

                {/* --- GRILLA DE LIBROS --- */}
                <div className="row">
                    {db.todos.length > 0 ? (
                        db.todos.map(l => <TarjetaLibro key={l.id} l={l} />)
                    ) : (
                        <div className="col-12 text-center text-muted mt-5">
                            <i className="fas fa-books fa-3x mb-3 text-info-booked opacity-50"></i>
                            <h4>La biblioteca está vacía.</h4>
                            <p>Utiliza el buscador para añadir el primer libro al catálogo.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Estilo local para hover */}
            <style>
                {`
                    .hover-zoom:hover {
                        transform: translateY(-5px);
                    }
                    .transition-all {
                        transition: all 0.3s ease;
                    }
                `}
            </style>
        </div>
    );
};

export default Biblioteca;
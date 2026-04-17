import React, { useEffect, useState, useCallback } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import BuscadorGoogleBooks from "../components/23_BuscadorGoogleBooks";
import BuscarLibroIA from "../components/25_BuscarLibroIA";
import DmLector from "../components/37_DmLector";

// Assets e Imágenes
import logoBookedUrl from "../assets/img/logo_booked1.png";
import booksImg from "../assets/img/Books.png";

const PaginaLector = () => {
    const { store } = useGlobalReducer();
    const navigate = useNavigate();
    const [idASeguir, setIdASeguir] = useState("");
    const [seccionActiva, setSeccionActiva] = useState("bienvenida");

    // Estado para manejar el modal de ver las reviews de un libro
    const [libroParaReviews, setLibroParaReviews] = useState(null);
   

    const [db, setDb] = useState({
        usuario: null,
        favoritos: [],
        leyendo: [],
        todos: [],
        otros: [],
        autoresFav: [],
        todosAutores: [],
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

    const load = useCallback(async () => {
        if (!store.lector_id) return;
        try {
            const [u, f, l, t, all, af, ta, revs] = await Promise.all([
                request(`lector/${store.lector_id}`),
                request(`lector/${store.lector_id}/favoritos`),
                request(`lector/${store.lector_id}/leyendo`),
                request(`libro`),
                request(`lector`),
                request(`lector_autores_favoritos`),
                request(`autor`),
                request(`reviews`)
            ]);

            const otros = all?.filter(o => o.id !== store.lector_id && !u?.siguiendo?.some(s => s.seguido_id === o.id)) || [];
            const misAutoresFav = af?.filter(item => Number(item.lector_id) === Number(store.lector_id)) || [];

            setDb({
                usuario: u, favoritos: f || [], leyendo: l || [],
                todos: t || [], otros, autoresFav: misAutoresFav,
                todosAutores: ta || [],
                reviews: revs || [],
                loading: false
            });
        } catch (error) {
            setDb(prev => ({ ...prev, loading: false }));
        }
    }, [store.lector_id]);

    useEffect(() => { if (store.auth_lector) load(); }, [store.auth_lector, load]);

    const exec = async (u, m, b) => { if (await request(u, m, b)) load(); };
    const irAlLibro = (id) => navigate(`/ver_libro/${id}`);

    if (!store.auth_lector) return <Navigate to="/login_lector" />;
    if (db.loading) return <div className="text-center mt-5"><div className="spinner-border text-info-booked"></div></div>;

    // =========================================================
    // TARJETA LIBRO
    // =========================================================
    const TarjetaLibro = ({ l }) => {
        const esFavorito = db.favoritos.some(f => (f.libro?.id || f.libro_id) === l.id);
        const loEstaLeyendo = db.leyendo.some(ley => (ley.libro?.id || ley.libro_id) === l.id);

        return (
            <div className="col-md-4 col-lg-3 mb-5" style={{ marginTop: '110px' }}>
                <div className="card-feature text-center h-100 shadow-sm border-0 bg-white d-flex flex-column">
                    <div className="book-cover-floating">
                        <img
                            src={l.image_url || "https://via.placeholder.com/150x225?text=No+Cover"}
                            className="portada-full"
                            alt={l.nombre}
                        />
                    </div>

                    <div className="flex-grow-1 d-flex flex-column mt-3">
                        <h6 className="fw-bold text-dark mb-1 text-truncate px-2">
                            {l.nombre}
                        </h6>
                        <p className="small text-muted mb-3">
                            {l.nombre_autor || "Autor Desconocido"}
                        </p>

                        <div className="d-flex justify-content-center gap-1 mt-auto flex-wrap">
                            <button
                                className={`btn btn-sm rounded-pill px-2 ${loEstaLeyendo ? 'btn-warning text-white' : 'btn-outline-warning'}`}
                                onClick={() => exec(loEstaLeyendo ? `leyendo/libros/${store.lector_id}/${l.id}` : `leyendo/libros`,
                                    loEstaLeyendo ? "DELETE" : "POST",
                                    loEstaLeyendo ? null : { lector_id: store.lector_id, libro_id: l.id })}
                                title="Leyendo"
                            >
                                <i className="fas fa-book-open"></i>
                            </button>
                            <button
                                className={`btn btn-sm rounded-pill px-2 ${esFavorito ? 'btn-danger' : 'btn-outline-danger'}`}
                                onClick={() => exec(esFavorito ? `favoritos/libros/${store.lector_id}/${l.id}` : `favoritos/libros`,
                                    esFavorito ? "DELETE" : "POST",
                                    esFavorito ? null : { lector_id: store.lector_id, libro_id: l.id })}
                                title="Favorito"
                            >
                                <i className={`fa${esFavorito ? 's' : 'r'} fa-heart`}></i>
                            </button>

                            <button
                                className="btn btn-sm btn-outline-info rounded-pill px-2"
                                onClick={() => setLibroParaReviews(l)}
                                title="Ver Reseñas"
                            >
                                <i className="fas fa-star"></i>
                            </button>

                            <Link to={`/ver_libro/${l.id}`} className="btn btn-sm btn-booked-blue rounded-pill px-3">Detalles</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="d-flex position-relative" style={{ minHeight: "100vh" }}>

            {/* OVERLAY PARA MOSTRAR LAS REVIEWS DEL LIBRO */}
            {libroParaReviews && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}>
                    <div className="bg-white rounded-4 shadow-lg p-4" style={{ width: "90%", maxWidth: "600px", maxHeight: "80vh", overflowY: "auto" }}>
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
                                            <span className="fw-bold small">{rev.nombre_lector}</span>
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
                            <Link to="/nueva_review" state={{ libroId: libroParaReviews?.id }} className="btn btn-booked-blue rounded-pill me-2">Escribir Reseña</Link>
                            <button className="btn btn-secondary rounded-pill" onClick={() => setLibroParaReviews(null)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SIDEBAR IZQUIERDO --- */}
            <div className="bg-white shadow-sm border-end" style={{ width: "280px", minWidth: "280px", zIndex: 10 }}>
                <div className="p-4 text-center border-bottom">
                    <div className="position-relative d-inline-block mb-3">
                        <img
                            src={db.usuario?.foto_url || `https://ui-avatars.com/api/?name=${db.usuario?.nombre}&background=24b0d9&color=fff`}
                            className="rounded-circle shadow-sm border border-3 border-light"
                            style={{ width: "80px", height: "80px", objectFit: "cover" }}
                            alt="Perfil"
                        />
                    </div>
                    <h6 className="fw-bold mb-0 text-dark">{db.usuario?.nombre} {db.usuario?.apellido}</h6>
                    <Link to={`/actualizar_lector/${store.lector_id}`} className="text-info-booked small text-decoration-none">Configuración</Link>
                </div>

                <div className="list-group list-group-flush p-3 mt-2">
                    {[
                        { id: "bienvenida", icon: "house", label: "Dashboard" },
                        { id: "leyendo", icon: "book-open", label: "Lectura Actual" },
                        { id: "favoritos", icon: "heart", label: "Mis Favoritos" },
                        { id: "biblioteca", icon: "search", label: "Biblioteca" },
                        { id: "mis_reviews", icon: "star", label: "Mis Reseñas" },
                        { id: "autores", icon: "feather-alt", label: "Explorar Autores" },
                        { id: "seguidores", icon: "users", label: "Mi Red" },
                        { id: "mensajes_comunidad", icon: "comments", label: "Mensajes" }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setSeccionActiva(item.id)}
                            className={`list-group-item list-group-item-action border-0 rounded-4 mb-2 py-3 px-4 d-flex align-items-center ${seccionActiva === item.id ? "bg-info-booked text-white shadow" : "text-muted"}`}
                        >
                            <i className={`fas fa-${item.icon} me-3`} style={{ width: "20px" }}></i>
                            <span className="fw-bold">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className="flex-grow-1 overflow-auto" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
                <div className="container-fluid p-5">

                    {/* SECCIÓN DASHBOARD / BIENVENIDA */}
                    {seccionActiva === "bienvenida" && (
                        <div className="row align-items-center mb-5 mt-4">
                            <div className="col-lg-7">
                                <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— Bienvenido de vuelta</span>
                                <h1 className="display-4 fw-bold text-dark mt-2 mb-4">
                                    Hola, <span className="text-info-booked" style={{ fontStyle: 'italic' }}>{db.usuario?.nombre}.</span>
                                </h1>
                                <p className="lead text-muted mb-4">Gestiona tu ecosistema literario, descubre nuevos autores y mantén tu colección al día.</p>

                                <div className="p-2 bg-white shadow-lg rounded-4 d-flex align-items-center border mb-4" style={{ maxWidth: '600px' }}>
                                    <div className="flex-grow-1 px-2">
                                        <BuscadorGoogleBooks onLibroAgregado={irAlLibro} />
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-5 d-none d-lg-block text-center mb-4">
                                <img src={booksImg} alt="Libros" className="img-fluid" style={{ maxHeight: "350px", filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.1))" }} />
                            </div>

                            {/* SECCIÓN ESCÁNER IA */}
                            <div className="col-12 mt-4">
                                <BuscarLibroIA />
                            </div>
                        </div>
                    )}

                    {/* SECCIONES DINÁMICAS (LEYENDO / FAV / BIBLIOTECA) */}
                    {(seccionActiva === "leyendo" || seccionActiva === "favoritos" || seccionActiva === "biblioteca") && (
                        <div>
                            <div className="mb-5">
                                <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— Mi Colección</span>
                                <h2 className="fw-bold mt-2">
                                    {seccionActiva === "leyendo" ? "Libros en Proceso" : seccionActiva === "favoritos" ? "Tus Preferidos" : "Explorar Biblioteca"}
                                </h2>
                            </div>
                            <div className="row mt-4">
                                {seccionActiva === "leyendo" && (db.leyendo.length > 0 ? db.leyendo.map(i => <TarjetaLibro key={i.id} l={i.libro || i} />) : <div className="col-12 text-muted">Aún no estás leyendo ningún libro.</div>)}
                                {seccionActiva === "favoritos" && (db.favoritos.length > 0 ? db.favoritos.map(f => <TarjetaLibro key={f.id} l={f.libro || f} />) : <div className="col-12 text-muted">Tu lista de favoritos está vacía.</div>)}
                                {seccionActiva === "biblioteca" && db.todos.map(l => <TarjetaLibro key={l.id} l={l} />)}
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN MIS REVIEWS */}
                    {seccionActiva === "mis_reviews" && (
                        <div>
                            <div className="mb-5">
                                <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— Mi Opinión</span>
                                <h2 className="fw-bold mt-2">Mis Reseñas Literarias</h2>
                            </div>
                            <div className="row">
                                {db.reviews.filter(r => Number(r.lector_id) === Number(store.lector_id)).length > 0 ? (
                                    db.reviews.filter(r => Number(r.lector_id) === Number(store.lector_id)).map(rev => (
                                        <div key={rev.id} className="col-md-6 mb-4">
                                            <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div>
                                                        <h5 className="fw-bold text-dark mb-1">{rev.libro?.nombre || "Libro Eliminado"}</h5>
                                                        <span className="badge bg-warning text-dark">
                                                            {rev.puntuacion} <i className="fas fa-star text-white"></i>
                                                        </span>
                                                    </div>
                                                    <img
                                                        src={rev.libro?.image_url || "https://via.placeholder.com/50x75?text=No+Cover"}
                                                        alt={rev.libro?.nombre}
                                                        className="rounded shadow-sm"
                                                        style={{ width: "50px", height: "75px", objectFit: "cover" }}
                                                    />
                                                </div>
                                                <p className="text-muted fst-italic">"{rev.texto}"</p>
                                                <div className="mt-auto pt-3 border-top text-end">
                                                    {/* CORRECCIÓN: Ruta actualizada para editar review */}
                                                    <Link to={`/editar_review/${rev.id}`} className="btn btn-sm btn-outline-info rounded-pill me-2">Editar</Link>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger rounded-pill"
                                                        onClick={async () => {
                                                            if (window.confirm("¿Seguro que deseas eliminar esta reseña?")) {
                                                                await request(`reviews/${rev.id}`, "DELETE");
                                                                load();
                                                            }
                                                        }}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12 text-center text-muted mt-5">
                                        <i className="fas fa-pencil-alt fa-3x mb-3 text-info-booked opacity-50"></i>
                                        <h4>Aún no has escrito ninguna reseña.</h4>
                                        <p>Ve a tu biblioteca y comparte tu opinión sobre tus libros favoritos.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN AUTORES */}
                    {seccionActiva === "autores" && (
                        <div>
                            <div className="text-center mb-5">
                                <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— Comunidad Real</span>
                                <h2 className="fw-bold mt-2">Nuestros Autores</h2>
                            </div>
                            <div className="row justify-content-center">
                                {db.todosAutores.map((autor) => (
                                    <div key={autor.id} className="col-md-3 mb-5" style={{ marginTop: '60px' }}>
                                        <div className="card-feature text-center h-100 shadow-sm border-0 bg-white d-flex flex-column">

                                            <div className="foto-cover-floating bg-white d-flex align-items-center justify-content-center shadow overflow-hidden"
                                                style={{ borderRadius: '50%', width: '100px', height: '100px', margin: '0 auto' }}>
                                                <img
                                                    src={autor.foto || "https://via.placeholder.com/150"}
                                                    alt={autor.nombre}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>

                                            <div className="flex-grow-1 d-flex flex-column mt-3">
                                                <div className="d-flex align-items-center justify-content-center">
                                                    <h6 className="fw-bold text-dark mb-0">{autor.nombre} {autor.apellido}</h6>
                                                    {autor.is_verified && (
                                                        <span className="ms-2 d-flex align-items-center justify-content-center text-white shadow-sm"
                                                            style={{ width: "18px", height: "18px", fontSize: "10px", backgroundColor: "#24b0d9", borderRadius: "50%" }}>✓</span>
                                                    )}
                                                </div>
                                                <p className="small text-muted mb-4 mt-1"><i className="fas fa-map-marker-alt me-1"></i>{autor.pais}</p>
                                                <div className="d-grid mt-auto">
                                                    {db.autoresFav.some(fav => fav.autor_id === autor.id) ? (
                                                        <button className="btn btn-sm btn-light text-danger rounded-pill border fw-bold" onClick={() => exec(`lector_autores_favoritos/${db.autoresFav.find(f => f.autor_id === autor.id).id}`, "DELETE")}>Dejar de seguir</button>
                                                    ) : (
                                                        <button className="btn btn-sm btn-booked-blue rounded-pill fw-bold" onClick={() => exec(`lector_autores_favoritos`, "POST", { lector_id: store.lector_id, autor_id: autor.id })}>Seguir Autor</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN COMUNIDAD */}
                    {seccionActiva === "seguidores" && (
                        <div className="row g-4 mt-2">
                            <div className="col-lg-6">
                                <h4 className="fw-bold mb-4">Descubrir Lectores</h4>
                                <div className="bg-white p-4 rounded-4 shadow-sm border" style={{ borderLeft: '5px solid #24b0d9' }}>
                                    <label className="small fw-bold mb-2">Busca en la red:</label>
                                    <div className="d-flex gap-2">
                                        <select className="form-select rounded-pill" value={idASeguir} onChange={e => setIdASeguir(e.target.value)}>
                                            <option value="">Elegir lector...</option>
                                            {db.otros.map(o => <option key={o.id} value={o.id}>{o.username || o.nombre}</option>)}
                                        </select>
                                        <button className="btn btn-booked-blue rounded-pill px-4" onClick={async () => { await request(`follow`, "POST", { seguidor_id: store.lector_id, seguido_id: parseInt(idASeguir) }); setIdASeguir(""); load(); }}>Seguir</button>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <h4 className="fw-bold mb-4">Siguiendo</h4>
                                <div className="bg-white p-4 rounded-4 shadow-sm border">
                                    {db.usuario?.siguiendo?.length > 0 ? db.usuario.siguiendo.map((r, i) => (
                                        <div key={i} className="d-flex justify-content-between align-items-center py-3 border-bottom last-border-none">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-light rounded-circle p-2 text-info-booked"><i className="fas fa-user"></i></div>
                                                <span className="fw-bold text-dark">{r.nombre_seguido}</span>
                                            </div>
                                            <button className="btn btn-sm text-danger fw-bold" onClick={() => exec(`unfollow/${r.relacion_id}`, "DELETE")}>Eliminar</button>
                                        </div>
                                    )) : <p className="text-muted small">Aún no sigues a otros lectores.</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN DMs COMUNIDAD (PANEL INDEPENDIENTE) */}
                    {seccionActiva === "mensajes_comunidad" && (
            <div>
                <div className="mb-4">
                    <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— Comunidad</span>
                    <h2 className="fw-bold mt-2">Mis Mensajes Directos</h2>
                </div>
                {/* Cargamos el componente que tiene la lista y el chat */}
                <DmLector />
            </div>
        )}

                </div>
            </div>
        </div>
    );
};

export default PaginaLector;
import React, { useEffect, useState, useCallback } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom"; // Añadí useNavigate por si la TarjetaLibroPropio lo usa
import useGlobalReducer from "../hooks/useGlobalReducer";
import LectoresUbi from "../components/25_LectoresUbi";
import "../shelfStyles.css";

// Assets e Imágenes
import logoBookedUrl from "../assets/img/logo_booked1.png";
import booksImg from "../assets/img/Books.png";

const PaginaAutor = () => {
    const { store } = useGlobalReducer();
    const navigate = useNavigate();
    const [db, setDb] = useState({
        perfil: null,
        misLibros: [],
        misSeguidores: [],
        noticias: [],
        todasLasReviews: [],
        loading: true
    });

    // ESTADOS PARA EL MAPA Y NAVEGACIÓN
    const [mapaViews, setMapaViews] = useState({ fansAutor: [], favLibros: [], leyendo: [] });
    const [vistaMapaActual, setVistaMapaActual] = useState('fansAutor');
    const [seccionActiva, setSeccionActiva] = useState("inicio"); // 'inicio' es el Dashboard

    // NUEVO: Estados para los filtros de la biblioteca
    const [filtroCategoria, setFiltroCategoria] = useState("");
    const [ordenarPor, setOrdenarPor] = useState("novedades");

    const [editando, setEditando] = useState(null);
    const [nuevoTexto, setNuevoTexto] = useState("");

    const autorId = store.autor_id || localStorage.getItem("autor_id");
    const api = `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")}/api`;
    const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

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
        if (!autorId) return;

        const [perfil, libros, favs, posts, lectoresFans, lectoresFavLibros, lectoresLeyendo, reviewsGlob] = await Promise.all([
            request(`autor/${autorId}`),
            request(`libro`),
            request(`lector_autores_favoritos`),
            request(`postautor/autor/${autorId}`),
            request(`lectores_por_autor/${autorId}`),
            request(`lectores_fav_libros_autor/${autorId}`),
            request(`lectores_leyendo_autor/${autorId}`),
            request(`reviews`)
        ]);

        const datosLimpios = perfil?.autor || perfil;

        if (datosLimpios) {
            const id = parseInt(autorId);

            // Filtramos solo los libros que pertenecen a este autor
            const misLibrosFiltrados = libros?.filter(l => Number(l.autor_id) === id) || [];

            // Filtramos las reviews para que solo muestre las de los libros de este autor
            const idsMisLibros = misLibrosFiltrados.map(l => l.id);
            const misReviewsFiltradas = reviewsGlob?.filter(r => idsMisLibros.includes(r.libro?.id)) || [];

            setDb({
                perfil: datosLimpios,
                misLibros: misLibrosFiltrados,
                misSeguidores: favs?.filter(f => Number(f.autor_id) === id) || [],
                noticias: posts || [],
                todasLasReviews: misReviewsFiltradas,
                loading: false
            });

            setMapaViews({
                fansAutor: lectoresFans || [],
                favLibros: lectoresFavLibros || [],
                leyendo: lectoresLeyendo || []
            });
        } else {
            setDb(prev => ({ ...prev, loading: false }));
        }
    }, [autorId]);

    useEffect(() => { if (autorId) loadData(); }, [loadData]);

    const handleEliminar = async (id) => {
        if (window.confirm("¿Eliminar noticia?")) {
            if (await request(`postautor/${id}`, "DELETE")) loadData();
        }
    };

    const handleGuardarEdicion = async (id) => {
        const res = await request(`postautor/${id}`, "PUT", { texto: nuevoTexto });
        if (res) {
            setEditando(null);
            loadData();
        }
    };

    if (!store.auth_autor && !localStorage.getItem("token_autor")) return <Navigate to="/login_autor" />;
    if (db.loading) return <div className="text-center mt-5"><div className="spinner-border text-info-booked"></div></div>;

    const fotoPerfil = db.perfil?.foto
        ? (db.perfil.foto.startsWith("http") ? db.perfil.foto : `${baseUrl}${db.perfil.foto.startsWith('/') ? '' : '/'}${db.perfil.foto}`)
        : `https://ui-avatars.com/api/?name=${db.perfil?.nombre || "Autor"}+${db.perfil?.apellido || ""}&background=24b0d9&color=fff`;

    // =========================================================
    // LÓGICA DE FILTROS Y PROMEDIO DE REVIEWS PARA "MIS OBRAS"
    // =========================================================
    const categoriasExistentes = [...new Set(db.misLibros.map(l => l.genero).filter(Boolean))];

    const promedioReviews = db.todasLasReviews.length > 0
        ? (db.todasLasReviews.reduce((acc, rev) => acc + Number(rev.puntuacion), 0) / db.todasLasReviews.length).toFixed(1)
        : "0.0";

    let librosMostrar = [...db.misLibros];

    if (filtroCategoria) {
        librosMostrar = librosMostrar.filter(l => l.genero === filtroCategoria);
    }

    if (ordenarPor === "alfabetico") {
        librosMostrar.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (ordenarPor === "ranking") {
        librosMostrar.sort((a, b) => {
            const getAvg = (idLibro) => {
                const revs = db.todasLasReviews.filter(r => r.libro?.id === idLibro);
                return revs.length ? revs.reduce((sum, r) => sum + Number(r.puntuacion), 0) / revs.length : 0;
            };
            return getAvg(b.id) - getAvg(a.id); // Descendente
        });
    } else {
        // Novedades (por ID descendente)
        librosMostrar.sort((a, b) => b.id - a.id);
    }


    // =========================================================
    // TARJETA LIBRO (Estilo Booked - Igual al del Lector)
    // =========================================================
    // =========================================================
    // TARJETA LIBRO (Estilo Booked con Promedio Individual)
    // =========================================================
    const TarjetaLibroPropio = ({ l }) => {
    // 1. Calculamos el promedio específico
    const reviewsEsteLibro = db.todasLasReviews.filter(r => r.libro?.id === l.id);
    const promedio = reviewsEsteLibro.length > 0
        ? (reviewsEsteLibro.reduce((acc, rev) => acc + Number(rev.puntuacion), 0) / reviewsEsteLibro.length).toFixed(1)
        : null;

    return (
        <div className="col-12 col-sm-6 col-lg-4 col-xl-3 mb-5 shelf-item px-3">
            {/* El nicho de madera */}
            <div className="shelf-cubby">
                <div className="book-3d" onClick={() => navigate(`/ver_libro/${l.id}`)}>
                    <img
                        src={l.image_url || "https://via.placeholder.com/150x225?text=No+Cover"}
                        alt={l.nombre}
                    />
                </div>
                <div className="shelf-floor-wood"></div>
            </div>

            {/* Info debajo de la repisa */}
            <div className="text-center mt-3">
                <h6 className="fw-bold text-dark mb-1 text-truncate px-2" title={l.nombre}>
                    {l.nombre}
                </h6>
                
                {/* Contenedor de Género y Promedio */}
                <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
                    <span className="badge bg-light text-info-booked rounded-pill border px-3">
                        {l.genero}
                    </span>
                    
                    {promedio ? (
                        <span className="badge rounded-pill bg-warning text-dark d-flex align-items-center shadow-sm">
                            <i className="fas fa-star me-1 small"></i>
                            {promedio}
                        </span>
                    ) : (
                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>Sin notas</small>
                    )}
                </div>

                <div className="d-flex justify-content-center gap-2 flex-wrap">
                    <Link to={`/ver_libro/${l.id}`} className="btn btn-sm btn-outline-info rounded-pill px-3">
                        <i className="fas fa-eye me-1"></i> Ver
                    </Link>
                    <button
                        className="btn btn-sm btn-booked-blue rounded-pill px-3 shadow-sm"
                        onClick={() => setSeccionActiva("reviews")}
                    >
                        <i className="fas fa-star me-1"></i> Reseñas
                    </button>
                </div>
            </div>
        </div>
    );
};


    return (
        <div className="d-flex position-relative" style={{ minHeight: "100vh" }}>

            {/* --- SIDEBAR IZQUIERDO (Estilo Booked) --- */}
            <div className="bg-white shadow-sm border-end" style={{ width: "280px", minWidth: "280px", zIndex: 10 }}>
                <div className="p-4 text-center border-bottom">
                    <div className="position-relative d-inline-block mb-3">
                        <img
                            src={fotoPerfil}
                            className="rounded-circle shadow-sm border border-3 border-light"
                            style={{ width: "80px", height: "80px", objectFit: "cover" }}
                            alt="Perfil"
                        />
                        <div className="bg-warning position-absolute bottom-0 end-0 rounded-circle d-flex align-items-center justify-content-center text-white border border-2 border-white" style={{ width: '25px', height: '25px' }} title="Cuenta de Autor">
                            <i className="fas fa-feather-alt fa-xs"></i>
                        </div>
                    </div>
                    <h6 className="fw-bold mb-0 text-dark">{db.perfil?.nombre} {db.perfil?.apellido}</h6>
                    <Link to={`/actualizar_autor/${autorId}`} className="text-info-booked small text-decoration-none">Configurar Perfil</Link>
                </div>

                <div className="list-group list-group-flush p-3 mt-2">
                    {[
                        { id: "inicio", icon: "house", label: "Dashboard" },
                        { id: "libros", icon: "book", label: "Mis Obras" },
                        { id: "reviews", icon: "star", label: "Reseñas de Lectores" },
                        { id: "audiencia", icon: "users", label: "Mi Comunidad" },
                        { id: "mapa", icon: "map-marked-alt", label: "Mapa de Impacto" },
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

                    {/* SECCIÓN DASHBOARD / INICIO */}
                    {seccionActiva === "inicio" && (
                        <div className="row align-items-center mb-5 mt-4">
                            <div className="col-lg-7">
                                <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— Taller Creativo</span>
                                <h1 className="display-4 fw-bold text-dark mt-2 mb-4">
                                    Hola de nuevo, <span className="text-info-booked" style={{ fontStyle: 'italic' }}>{db.perfil?.nombre}.</span>
                                </h1>
                                <p className="lead text-muted mb-4">Gestiona tu presencia literaria, conecta con tus lectores y comparte tus últimas novedades.</p>

                                <div className="p-3 bg-white shadow-sm rounded-4 border mb-4 d-flex align-items-center justify-content-between" style={{ maxWidth: '600px', borderLeft: '5px solid #24b0d9' }}>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-light p-3 rounded-circle text-info-booked">
                                            <i className="fas fa-bullhorn"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-0">¿Tienes algo que contar?</h6>
                                            <p className="small text-muted mb-0">Publica actualizaciones para tus seguidores.</p>
                                        </div>
                                    </div>
                                    <Link to="/crear_post_autor" className="btn btn-booked-blue rounded-pill px-4 shadow-sm">Publicar</Link>
                                </div>
                            </div>
                            <div className="col-lg-5 d-none d-lg-block text-center mb-4">
                                <img src={booksImg} alt="Libros" className="img-fluid" style={{ maxHeight: "350px", filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.1))" }} />
                            </div>

                            <div className="col-12 mt-5">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="fw-bold text-dark mb-0">Tus Publicaciones Recientes</h4>
                                </div>
                                <div className="row">
                                    {db.noticias.length > 0 ? db.noticias.map(post => (
                                        <div key={post.id} className="col-md-6 mb-4">
                                            <div className="card p-4 shadow-sm border-0 bg-white rounded-4 h-100 card-noticia-autor">
                                                <div className="d-flex justify-content-between border-bottom pb-2 mb-3">
                                                    <small className="text-info-booked fw-bold"><i className="far fa-calendar-alt me-1"></i> {post.fecha}</small>
                                                    <div>
                                                        <button className="btn btn-sm text-info-booked me-2" onClick={() => { setEditando(post.id); setNuevoTexto(post.texto); }} title="Editar">
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button className="btn btn-sm text-danger" onClick={() => handleEliminar(post.id)} title="Eliminar">
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>

                                                {editando === post.id ? (
                                                    <div>
                                                        <textarea className="form-control bg-light border-0 mb-2 rounded-4 p-3 shadow-sm" rows="4" value={nuevoTexto} onChange={(e) => setNuevoTexto(e.target.value)} />
                                                        <div className="text-end mt-2">
                                                            <button className="btn btn-sm btn-light rounded-pill px-3 me-2 border shadow-sm" onClick={() => setEditando(null)}>Cancelar</button>
                                                            <button className="btn btn-sm btn-booked-blue rounded-pill px-4 shadow-sm" onClick={() => handleGuardarEdicion(post.id)}>Guardar</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="mb-0 text-muted" style={{ whiteSpace: 'pre-wrap' }}>{post.texto}</p>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-12 text-center p-5 bg-white rounded-4 shadow-sm">
                                            <i className="fas fa-comment-dots fa-3x mb-3 text-info-booked opacity-50"></i>
                                            <p className="text-muted fw-bold fs-5">Aún no has publicado nada.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN MIS OBRAS (GRILLA ESTILO BOOKED) */}
                    {seccionActiva === "libros" && (
                        <div>
                            {/* --- ENCABEZADO Y HERRAMIENTAS NUEVO --- */}
                            <div className="row align-items-end mb-4">
                                <div className="col-lg-5 text-center text-lg-start mb-4 mb-lg-0">
                                    <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— Tu Catálogo</span>
                                    <h2 className="fw-bold mt-2 mb-2">Mis Obras Publicadas</h2>
                                    
                                    {/* PROMEDIO DE REVIEWS GENERAL */}
                                    <div className="d-flex align-items-center justify-content-center justify-content-lg-start gap-2 mt-2">
                                        <div className="d-flex text-warning">
                                            <i className="fas fa-star fs-5"></i>
                                        </div>
                                        <span className="fw-bold text-dark fs-5">{promedioReviews}</span>
                                        <span className="text-muted small">({db.todasLasReviews.length} reseñas globales)</span>
                                    </div>
                                </div>

                                <div className="col-lg-7 d-flex flex-row flex-wrap flex-md-nowrap gap-2 justify-content-center justify-content-lg-end align-items-center pb-1">
                                    {/* Contenedor Categoría */}
                                    <div className="d-flex align-items-center gap-2" style={{ flex: '1 1 auto', minWidth: '0' }}>
                                        <span className="text-muted small fw-bold d-none d-xl-inline text-nowrap">Filtrar:</span>
                                        <select 
                                            className="form-select rounded-pill shadow-sm border-0"
                                            style={{ height: '40px', fontSize: '0.85rem', minWidth: '160px', paddingLeft: '1rem' }}
                                            value={filtroCategoria}
                                            onChange={(e) => setFiltroCategoria(e.target.value)}
                                        >
                                            <option value="">Todas las Categorías</option>
                                            {categoriasExistentes.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Contenedor Ordenamiento */}
                                    <div className="d-flex align-items-center gap-2" style={{ flex: '1 1 auto', minWidth: '0' }}>
                                        <span className="text-muted small fw-bold d-none d-xl-inline text-nowrap">Orden:</span>
                                        <select 
                                            className="form-select rounded-pill shadow-sm border-0"
                                            style={{ height: '40px', fontSize: '0.85rem', minWidth: '160px', paddingLeft: '1rem' }}
                                            value={ordenarPor}
                                            onChange={(e) => setOrdenarPor(e.target.value)}
                                        >
                                            <option value="novedades">Novedades</option>
                                            <option value="alfabetico">A-Z (Nombre)</option>
                                            <option value="ranking">Mejores Valorados</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <hr className="mb-5 text-muted opacity-25" />

                            <div className="row mt-4 bookshelf-grid">
                                {librosMostrar.length > 0 ? (
                                    librosMostrar.map(l => <TarjetaLibroPropio key={l.id} l={l} />)
                                ) : (
                                    <div className="col-12 text-center text-muted mt-5">
                                        <i className="fas fa-book fa-3x mb-3 text-info-booked opacity-50"></i>
                                        <h4>Aún no has agregado obras o no hay coincidencias.</h4>
                                        <p>Prueba limpiando los filtros o contacta con el administrador.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN REVIEWS */}
                    {seccionActiva === "reviews" && (
                        <div>
                            <div className="mb-5">
                                <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— Feedback</span>
                                <h2 className="fw-bold mt-2">Lo que dicen tus lectores</h2>
                            </div>

                            <div className="row">
                                {db.todasLasReviews.length > 0 ? (
                                    db.todasLasReviews.map(rev => (
                                        <div key={rev.id} className="col-md-6 mb-4">
                                            <div className="card shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div>
                                                        <h6 className="fw-bold text-dark mb-1">
                                                            <i className="fas fa-book-open text-info-booked me-2"></i>
                                                            {rev.libro?.nombre}
                                                        </h6>
                                                    </div>
                                                    <span className="badge bg-warning text-dark shadow-sm">
                                                        {rev.puntuacion} <i className="fas fa-star text-white"></i>
                                                    </span>
                                                </div>

                                                <div className="bg-light p-3 rounded-4 mb-3 position-relative">
                                                    <i className="fas fa-quote-left text-info-booked opacity-25 position-absolute" style={{ top: '10px', left: '10px', fontSize: '1.5rem' }}></i>
                                                    <p className="text-muted fst-italic mb-0 text-center px-4">"{rev.texto}"</p>
                                                </div>

                                                <div className="mt-auto d-flex align-items-center gap-2 pt-2 border-top">
                                                    <div className="bg-info-booked rounded-circle d-flex align-items-center justify-content-center text-white fw-bold overflow-hidden" style={{ width: '35px', height: '35px' }}>
                                                        {rev.foto_lector ? (
                                                            <img src={rev.foto_lector} alt={rev.nombre_lector} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <span>{rev.nombre_lector?.charAt(0).toUpperCase() || "L"}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="fw-bold text-dark d-block small" style={{ lineHeight: '1' }}>{rev.nombre_lector}</span>
                                                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>Lector de Booked</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12 text-center text-muted mt-5">
                                        <i className="fas fa-comment-slash fa-3x mb-3 text-info-booked opacity-50"></i>
                                        <h4>Aún no hay reseñas para tus obras.</h4>
                                        <p>¡Pronto tus lectores empezarán a dejar sus opiniones!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN MI COMUNIDAD (SEGUIDORES) */}
                    {seccionActiva === "audiencia" && (
                        <div>
                            <div className="mb-5">
                                <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— Conexiones</span>
                                <h2 className="fw-bold mt-2">Mi Comunidad ({db.misSeguidores.length})</h2>
                            </div>
                            <div className="row g-4">
                                {db.misSeguidores.length > 0 ? (
                                    db.misSeguidores.map(s => (
                                        <div key={s.id} className="col-md-6 col-lg-4 mb-2">
                                            <div className="d-flex align-items-center bg-white p-3 rounded-4 shadow-sm border-start border-4 border-info">
                                                <div className="flex-shrink-0">
                                                    <img src={`https://ui-avatars.com/api/?name=${s.nombre_lector}&background=24b0d9&color=fff`} className="rounded-circle shadow-sm" width="55" alt="lector" />
                                                </div>
                                                <div className="ms-3">
                                                    <h6 className="mb-0 fw-bold text-dark">{s.nombre_lector}</h6>
                                                    <small className="text-muted">Lector Fiel</small>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12 text-center text-muted mt-5">
                                        <i className="fas fa-users-slash fa-3x mb-3 text-info-booked opacity-50"></i>
                                        <h4>Aún no tienes seguidores directos.</h4>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN MAPA DE IMPACTO */}
                    {seccionActiva === "mapa" && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                                <div>
                                    <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— Alcance Global</span>
                                    <h2 className="fw-bold mt-1 mb-0">Impacto Geográfico</h2>
                                </div>
                                <div className="btn-group shadow-sm bg-white rounded-pill p-1 border" role="group">
                                    <button className={`btn btn-sm rounded-pill px-4 fw-bold ${vistaMapaActual === 'fansAutor' ? 'btn-booked-blue text-white' : 'btn-white border-0 text-muted'}`} onClick={() => setVistaMapaActual('fansAutor')}>Fans Míos</button>
                                    <button className={`btn btn-sm rounded-pill px-4 fw-bold ${vistaMapaActual === 'favLibros' ? 'btn-booked-blue text-white' : 'btn-white border-0 text-muted'}`} onClick={() => setVistaMapaActual('favLibros')}>Fans Libros</button>
                                    <button className={`btn btn-sm rounded-pill px-4 fw-bold ${vistaMapaActual === 'leyendo' ? 'btn-booked-blue text-white' : 'btn-white border-0 text-muted'}`} onClick={() => setVistaMapaActual('leyendo')}>Leyendo</button>
                                </div>
                            </div>
                            <div className="card shadow-lg border-0 rounded-5 overflow-hidden p-3 bg-white" style={{ height: "600px" }}>
                                <LectoresUbi lectores={mapaViews[vistaMapaActual]} />
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default PaginaAutor;
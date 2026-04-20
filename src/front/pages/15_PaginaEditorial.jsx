import React, { useEffect, useState, useCallback } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import LectoresUbi from "../components/25_LectoresUbi";
import Chat from "../components/37_Chat";
import "../shelfStyles.css";

// Assets e Imágenes
import booksImg from "../assets/img/Books.png";

const PaginaEditorial = () => {
    const { store } = useGlobalReducer();
    const navigate = useNavigate();
    const editorialId = store.editorial_id || localStorage.getItem("editorial_id");

    const [seccionActiva, setSeccionActiva] = useState("inicio");
    const [lectorSeleccionado, setLectorSeleccionado] = useState(null);
    const [listaChats, setListaChats] = useState([]);

    // --- NUEVOS ESTADOS PARA FILTROS (Igual que en Lector) ---
    const [filtroCategoria, setFiltroCategoria] = useState("");
    const [ordenarPor, setOrdenarPor] = useState("novedades");

    const [db, setDb] = useState({
        perfil: null,
        misLibros: [],
        noticias: [],
        todasLasReviews: [],
        loading: true
    });

    const [mapaViews, setMapaViews] = useState({ favLibros: [], leyendo: [] });
    const [vistaMapaActual, setVistaMapaActual] = useState('favLibros');

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

    const cargarContactos = useCallback(async () => {
        if (!editorialId) return;
        const token = localStorage.getItem("token_editorial");

        try {
            const res = await fetch(`${api}/mensajes/editorial/${editorialId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const mensajes = await res.json();
                const contactosUnicos = [];
                const idsVistos = new Set();

                mensajes.forEach(m => {
                    if (!idsVistos.has(m.lector_id)) {
                        idsVistos.add(m.lector_id);
                        contactosUnicos.push({
                            id: m.lector_id,
                            nombre: m.nombre_lector || `Lector #${m.lector_id}`,
                            foto: m.foto_lector,
                            ultimoMsg: m.contenido
                        });
                    }
                });
                setListaChats(contactosUnicos);
            }
        } catch (error) {
            console.error("Error cargando contactos:", error);
        }
    }, [editorialId, api]);

    useEffect(() => {
        if (seccionActiva === "mensajes") {
            cargarContactos();
        }
    }, [seccionActiva, cargarContactos]);

    const loadData = useCallback(async () => {
        if (!editorialId) return;

        try {
            const [perfil, librosGlob, posts, respFavLibros, respLeyendo, reviewsGlob] = await Promise.all([
                request(`editorial/${editorialId}`),
                request(`libro/editorial/${editorialId}`),
                request(`posteditorial/editorial/${editorialId}`),
                request(`lectores_fav_libros_editorial/${editorialId}`),
                request(`lectores_leyendo_editorial/${editorialId}`),
                request(`reviews`)
            ]);

            const misLibrosFiltrados = librosGlob || [];
            const idsMisLibros = misLibrosFiltrados.map(l => l.id);
            // Filtramos solo las reviews que pertenecen a los libros de ESTA editorial
            const misReviewsFiltradas = reviewsGlob?.filter(r => idsMisLibros.includes(r.libro?.id || r.libro_id)) || [];

            setDb({
                perfil: perfil,
                misLibros: misLibrosFiltrados,
                noticias: posts || [],
                todasLasReviews: misReviewsFiltradas,
                loading: false
            });

            setMapaViews({
                favLibros: respFavLibros || [],
                leyendo: respLeyendo || []
            });
        } catch (error) {
            console.error("Error cargando datos:", error);
            setDb(prev => ({ ...prev, loading: false }));
        }
    }, [editorialId]);

    useEffect(() => {
        if (store.auth_editorial || localStorage.getItem("token_editorial")) {
            loadData();
        }
    }, [loadData, store.auth_editorial]);

    // =========================================================
    // LÓGICA DE FILTRADO Y PROMEDIO (NUEVA)
    // =========================================================
    
    const getPromedio = (libroId) => {
        const revs = db.todasLasReviews.filter(r => (r.libro?.id || r.libro_id) === libroId);
        if (revs.length === 0) return null;
        const suma = revs.reduce((acc, curr) => acc + Number(curr.puntuacion), 0);
        return (suma / revs.length).toFixed(1);
    };

    const categoriasUnicas = [...new Set(db.misLibros.map(l => l.genero))].filter(Boolean);

    const librosAMostrar = db.misLibros
        .filter(l => !filtroCategoria || l.genero === filtroCategoria)
        .sort((a, b) => {
            if (ordenarPor === "novedades") return b.id - a.id;
            if (ordenarPor === "alfabetico") return a.nombre.localeCompare(b.nombre);
            if (ordenarPor === "mejor_valorados") {
                const promA = parseFloat(getPromedio(a.id) || 0);
                const promB = parseFloat(getPromedio(b.id) || 0);
                return promB - promA;
            }
            return 0;
        });

    const deletelibro = async (idToDelete) => {
        if (window.confirm("¿De verdad quieres eliminar este libro de tu catálogo?")) {
            const res = await request(`libro/${idToDelete}`, "DELETE");
            if (res) loadData();
        }
    };

    const deletepost = async (idToDelete) => {
        if (window.confirm("¿Estás seguro que quieres eliminar esta publicación?")) {
            const res = await request(`posteditorial/${idToDelete}`, "DELETE");
            if (res) loadData();
        }
    };

    if (!store.auth_editorial && !localStorage.getItem("token_editorial")) {
        return <Navigate to="/login_editorial" />;
    }

    if (db.loading) return <div className="text-center mt-5"><div className="spinner-border text-info-booked"></div></div>;

    const fotoPerfil = db.perfil?.image_url
        ? (db.perfil.image_url.startsWith("http") ? db.perfil.image_url : `${baseUrl}${db.perfil.image_url.startsWith('/') ? '' : '/'}${db.perfil.image_url}`)
        : `https://ui-avatars.com/api/?name=${db.perfil?.nombre || "Editorial"}&background=24b0d9&color=fff`;


    const TarjetaLibroEditorial = ({ l }) => {
    const promedio = getPromedio(l.id);

    return (
        <div className="col-12 col-sm-6 col-lg-4 col-xl-3 mb-5 shelf-item px-3">
            {/* Contenedor del estante con margen negativo para subir el libro */}
            <div className="shelf-cubby" style={{ marginTop: '-20px' }}>
                <div className="book-3d" onClick={() => navigate(`/ver_libro/${l.id}`)}>
                    <img
                        src={l.image_url || "https://via.placeholder.com/150x225?text=No+Cover"}
                        alt={l.nombre}
                    />
                    
                    {/* Badge de puntuación solo si existe promedio */}
                    {promedio && (
                        <div className="position-absolute top-0 end-0 m-2">
                            <span className="badge rounded-pill bg-warning text-dark shadow-sm">
                                <i className="fas fa-star me-1"></i>{promedio}
                            </span>
                        </div>
                    )}
                </div>
                <div className="shelf-floor-wood"></div>
            </div>

            <div className="text-center mt-3">
                <h6 className="fw-bold text-dark mb-1 text-truncate px-2" title={l.nombre}>
                    {l.nombre}
                </h6>
                
                {/* Categoría y "Sin reseñas" en la misma línea */}
                <div className="mb-2 d-flex justify-content-center align-items-center gap-2">
                    <span className="badge bg-light text-info-booked border rounded-pill">
                        {l.genero}
                    </span>
                    
                    {!promedio && (
                        <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                            • Sin reseñas
                        </span>
                    )}
                </div>

                <div className="d-flex justify-content-center gap-2 flex-wrap">
                    <Link to={`/ver_libro/${l.id}`} className="btn btn-sm btn-outline-info rounded-pill px-3" title="Ver Obra">
                        <i className="fas fa-eye"></i>
                    </Link>
                    <Link to={`/editar_libro_editorial/${l.id}`} className="btn btn-sm btn-outline-warning rounded-pill px-3" title="Editar">
                        <i className="fas fa-edit"></i>
                    </Link>
                    <button onClick={() => deletelibro(l.id)} className="btn btn-sm btn-outline-danger rounded-pill px-3" title="Eliminar">
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

    return (
        <div className="d-flex position-relative" style={{ minHeight: "100vh" }}>

            {/* --- SIDEBAR IZQUIERDO --- */}
            <div className="bg-white shadow-sm border-end" style={{ width: "280px", minWidth: "280px", zIndex: 10 }}>
                <div className="p-4 text-center border-bottom">
                    <div className="position-relative d-inline-block mb-3">
                        <img
                            src={fotoPerfil}
                            className="rounded-circle shadow-sm border border-3 border-light"
                            style={{ width: "80px", height: "80px", objectFit: "cover" }}
                            alt="Perfil Editorial"
                        />
                        <div className="bg-info-booked position-absolute bottom-0 end-0 rounded-circle d-flex align-items-center justify-content-center text-white border border-2 border-white" style={{ width: '25px', height: '25px' }} title="Cuenta de Editorial">
                            <i className="fas fa-university fa-xs"></i>
                        </div>
                    </div>
                    <h6 className="fw-bold mb-0 text-dark">{db.perfil?.nombre || "Editorial"}</h6>
                    <Link to={`/actualizar_editorial/${editorialId}`} className="text-info-booked small text-decoration-none">Configurar Perfil</Link>
                </div>

                <div className="list-group list-group-flush p-3 mt-2">
                    {[
                        { id: "inicio", icon: "house", label: "Dashboard" },
                        { id: "libros", icon: "book", label: "Catálogo de Libros" },
                        { id: "reviews", icon: "star", label: "Reseñas del Público" },
                        { id: "mapa", icon: "map-marked-alt", label: "Impacto Global" },
                        { id: "mensajes", icon: "envelope", label: "Mensajes Directos" },
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

                    {seccionActiva === "inicio" && (
                        <div className="row align-items-center mb-5 mt-4">
                            <div className="col-lg-7">
                                <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— Sede Editorial</span>
                                <h1 className="display-4 fw-bold text-dark mt-2 mb-4">
                                    Panel de <span className="text-info-booked" style={{ fontStyle: 'italic' }}>{db.perfil?.nombre}.</span>
                                </h1>
                                <p className="lead text-muted mb-4">Administra tu catálogo de libros, monitorea el impacto global y comunícate con tus lectores.</p>

                                <div className="p-3 bg-white shadow-sm rounded-4 border mb-4 d-flex align-items-center justify-content-between flex-wrap gap-3" style={{ maxWidth: '650px', borderLeft: '5px solid #24b0d9' }}>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-light p-3 rounded-circle text-info-booked">
                                            <i className="fas fa-bullhorn"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-0">Gestión Activa</h6>
                                            <p className="small text-muted mb-0">Tienes {db.misLibros.length} libros y {db.noticias.length} noticias.</p>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Link to={`/nuevo_libro_editorial/${editorialId}`} className="btn btn-sm btn-outline-info rounded-pill px-3 shadow-sm"><i className="fas fa-book me-1"></i> Añadir Libro</Link>
                                        <Link to={`/nueva_publicacion_editorial/${editorialId}`} className="btn btn-sm btn-booked-blue rounded-pill px-3 shadow-sm"><i className="fas fa-plus me-1"></i> Publicar</Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-5 d-none d-lg-block text-center mb-4">
                                <img src={booksImg} alt="Libros" className="img-fluid" style={{ maxHeight: "300px", filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.1))" }} />
                            </div>

                            <div className="col-12 mt-5">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="fw-bold text-dark mb-0">Tus Publicaciones Recientes</h4>
                                </div>
                                <div className="row">
                                    {db.noticias.length > 0 ? db.noticias.map(post => (
                                        <div key={post.id} className="col-md-6 mb-4">
                                            <div className="card p-4 shadow-sm border-0 bg-white rounded-4 h-100">
                                                <div className="d-flex justify-content-between border-bottom pb-2 mb-3">
                                                    <small className="text-info-booked fw-bold"><i className="far fa-calendar-alt me-1"></i> {post.fecha}</small>
                                                    <button className="btn btn-sm text-danger" onClick={() => deletepost(post.id)} title="Eliminar">
                                                        <i className="fas fa-trash"></i> Borrar
                                                    </button>
                                                </div>
                                                <p className="mb-0 text-muted" style={{ whiteSpace: 'pre-wrap' }}>{post.texto}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-12 text-center p-5 bg-white rounded-4 shadow-sm">
                                            <i className="fas fa-newspaper fa-3x mb-3 text-info-booked opacity-50"></i>
                                            <p className="text-muted fw-bold fs-5">Aún no has publicado anuncios o noticias.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {seccionActiva === "libros" && (
                        <div>
                            <div className="d-flex justify-content-between align-items-end mb-4">
                                <div>
                                    <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— Tu Catálogo</span>
                                    <h2 className="fw-bold mt-2 mb-0">Libros Publicados ({librosAMostrar.length})</h2>
                                </div>
                                <Link to={`/nuevo_libro_editorial/${editorialId}`} className="btn btn-booked-blue rounded-pill px-4 shadow-sm">
                                    <i className="fas fa-plus me-2"></i>Registrar Obra
                                </Link>
                            </div>

                            {/* BARRA DE FILTROS (COMO EN PAGINA LECTOR) */}
                            <div className="row g-3 mb-5">
                                <div className="col-md-6 col-lg-4">
                                    <div className="input-group shadow-sm rounded-pill overflow-hidden bg-white border-0">
                                        <span className="input-group-text bg-white border-0 ps-3 text-muted"><i className="fas fa-filter"></i></span>
                                        <select 
                                            className="form-select border-0 ps-2" 
                                            value={filtroCategoria} 
                                            onChange={(e) => setFiltroCategoria(e.target.value)}
                                            style={{ boxShadow: 'none' }}
                                        >
                                            <option value="">Todos los géneros</option>
                                            {categoriasUnicas.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-6 col-lg-4">
                                    <div className="input-group shadow-sm rounded-pill overflow-hidden bg-white border-0">
                                        <span className="input-group-text bg-white border-0 ps-3 text-muted"><i className="fas fa-sort-amount-down"></i></span>
                                        <select 
                                            className="form-select border-0 ps-2" 
                                            value={ordenarPor} 
                                            onChange={(e) => setOrdenarPor(e.target.value)}
                                            style={{ boxShadow: 'none' }}
                                        >
                                            <option value="novedades">Novedades</option>
                                            <option value="mejor_valorados">Mejor Valorados</option>
                                            <option value="alfabetico">Título (A-Z)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="row mt-4 bookshelf-grid">
                                {librosAMostrar.length > 0 ? (
                                    librosAMostrar.map(l => <TarjetaLibroEditorial key={l.id} l={l} />)
                                ) : (
                                    <div className="col-12 text-center text-muted mt-5">
                                        <i className="fas fa-book fa-3x mb-3 text-info-booked opacity-50"></i>
                                        <h4>No se encontraron libros.</h4>
                                        <p>Intenta ajustar tus filtros o registra una nueva obra.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {seccionActiva === "reviews" && (
                        <div>
                            <div className="mb-5">
                                <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— Feedback del Público</span>
                                <h2 className="fw-bold mt-2">Reseñas de tu Catálogo</h2>
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
                                        <h4>Aún no hay reseñas para tu catálogo.</h4>
                                        <p>¡Pronto los lectores empezarán a dejar sus opiniones sobre tus publicaciones!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {seccionActiva === "mapa" && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                                <div>
                                    <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— Alcance Global</span>
                                    <h2 className="fw-bold mt-1 mb-0">Ubicación de los Lectores</h2>
                                </div>
                                <div className="btn-group shadow-sm bg-white rounded-pill p-1 border" role="group">
                                    <button className={`btn btn-sm rounded-pill px-4 fw-bold ${vistaMapaActual === 'favLibros' ? 'btn-booked-blue text-white' : 'btn-white border-0 text-muted'}`} onClick={() => setVistaMapaActual('favLibros')}>Tienen Libros Favoritos</button>
                                    <button className={`btn btn-sm rounded-pill px-4 fw-bold ${vistaMapaActual === 'leyendo' ? 'btn-booked-blue text-white' : 'btn-white border-0 text-muted'}`} onClick={() => setVistaMapaActual('leyendo')}>Leyendo Actualmente</button>
                                </div>
                            </div>
                            <div className="card shadow-lg border-0 rounded-5 overflow-hidden p-3 bg-white" style={{ height: "600px" }}>
                                <LectoresUbi lectores={mapaViews[vistaMapaActual]} />
                            </div>
                        </div>
                    )}

                    {seccionActiva === "mensajes" && (
                        <div className="container-fluid animate__animated animate__fadeIn">
                            <div className="row" style={{ height: 'calc(100vh - 160px)' }}>
                                <div className="col-md-4 h-100 ps-0">
                                    <div className="card shadow-sm border-0 rounded-4 h-100 bg-white overflow-hidden">
                                        <div className="p-3 bg-info-booked text-white d-flex justify-content-between align-items-center">
                                            <h6 className="fw-bold mb-0"><i className="fas fa-comments me-2"></i>Chats Directos</h6>
                                            <button onClick={cargarContactos} className="btn btn-sm btn-light rounded-circle">
                                                <i className="fas fa-sync-alt"></i>
                                            </button>
                                        </div>

                                        <div className="overflow-auto" style={{ height: '100%' }}>
                                            {listaChats.length > 0 ? listaChats.map(chat => (
                                                <div
                                                    key={chat.id}
                                                    onClick={() => setLectorSeleccionado(chat)}
                                                    className={`p-3 d-flex align-items-center gap-3 border-bottom cursor-pointer transition-all ${lectorSeleccionado?.id === chat.id ? "bg-light border-start border-4 border-info-booked" : "hover-bg-light"}`}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <img
                                                        src={chat.foto || `https://ui-avatars.com/api/?name=${chat.nombre}&background=random`}
                                                        className="rounded-circle"
                                                        style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                                                        alt="Lector"
                                                    />
                                                    <div className="flex-grow-1 overflow-hidden">
                                                        <h6 className="fw-bold mb-0 text-dark small">{chat.nombre}</h6>
                                                        <p className="mb-0 text-muted small text-truncate">{chat.ultimoMsg}</p>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="text-center p-5 mt-5">
                                                    <i className="fas fa-user-friends fa-2x mb-3 text-muted opacity-50"></i>
                                                    <p className="text-muted small">No hay conversaciones activas.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-8 h-100 pe-0">
                                    {lectorSeleccionado ? (
                                        <div className="card shadow-sm border-0 rounded-4 h-100 bg-white overflow-hidden d-flex flex-column">
                                            <div className="p-3 border-bottom d-flex align-items-center bg-white">
                                                <img src={lectorSeleccionado.foto || `https://ui-avatars.com/api/?name=${lectorSeleccionado.nombre}`} className="rounded-circle me-3" style={{ width: '35px', height: '35px' }} />
                                                <h6 className="fw-bold mb-0">{lectorSeleccionado.nombre}</h6>
                                            </div>

                                            <div style={{ height: "100%" }}>
                                                <Chat
                                                    lectorId={lectorSeleccionado.id}
                                                    editorialId={editorialId}
                                                    tipoUsuario="editorial"
                                                    esPopUp={false}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="card shadow-sm border-0 rounded-4 h-100 d-flex align-items-center justify-content-center bg-white p-5 text-center">
                                            <div className="animate__animated animate__pulse animate__infinite">
                                                <div className="bg-light p-4 rounded-circle d-inline-block mb-3">
                                                    <i className="fas fa-paper-plane fa-3x text-info-booked opacity-50"></i>
                                                </div>
                                                <h5 className="text-dark fw-bold">Tu Mensajería</h5>
                                                <p className="text-muted">Selecciona un lector de la izquierda para responder sus dudas o propuestas.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default PaginaEditorial;
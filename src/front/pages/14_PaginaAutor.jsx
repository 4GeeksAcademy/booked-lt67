import React, { useEffect, useState, useCallback } from "react";
import { Navigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import LectoresUbi from "../components/25_LectoresUbi"; 

const PaginaAutor = () => {
    const { store } = useGlobalReducer();
    const [db, setDb] = useState({ 
        perfil: null, 
        misLibros: [], 
        misSeguidores: [], 
        noticias: [], 
        loading: true 
    });
    
    // ESTADOS PARA EL MAPA Y NAVEGACIÓN
    const [mapaViews, setMapaViews] = useState({ fansAutor: [], favLibros: [], leyendo: [] });
    const [vistaMapaActual, setVistaMapaActual] = useState('fansAutor');
    const [seccionActiva, setSeccionActiva] = useState("inicio");
    
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
        
        const [perfil, libros, favs, posts, lectoresFans, lectoresFavLibros, lectoresLeyendo] = await Promise.all([
            request(`autor/${autorId}`),
            request(`libro`),
            request(`lector_autores_favoritos`),
            request(`postautor/autor/${autorId}`),
            request(`lectores_por_autor/${autorId}`),
            request(`lectores_fav_libros_autor/${autorId}`),
            request(`lectores_leyendo_autor/${autorId}`)
        ]);

        const datosLimpios = perfil?.autor || perfil;

        if (datosLimpios) {
            const id = parseInt(autorId);
            setDb({
                perfil: datosLimpios,
                misLibros: libros?.filter(l => Number(l.autor_id) === id) || [],
                misSeguidores: favs?.filter(f => Number(f.autor_id) === id) || [],
                noticias: posts || [],
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
    if (db.loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

    const fotoPerfil = db.perfil?.foto
        ? (db.perfil.foto.startsWith("http") ? db.perfil.foto : `${baseUrl}${db.perfil.foto.startsWith('/') ? '' : '/'}${db.perfil.foto}`)
        : `https://ui-avatars.com/api/?name=${db.perfil?.nombre || "Autor"}+${db.perfil?.apellido || ""}&background=0d6efd&color=fff`;

    return (
        <div className="d-flex" style={{ minHeight: "100vh" }}>
            
            {/* --- SIDEBAR IZQUIERDO --- */}
            <div className="bg-white shadow-sm border-end" style={{ width: "260px", minWidth: "260px", zIndex: 10 }}>
                <div className="p-4 text-center border-bottom">
                    <img 
                        src={fotoPerfil} 
                        className="rounded-circle mb-3 shadow-sm" 
                        style={{ width: "80px", height: "80px", objectFit: "cover" }} 
                        alt="Perfil"
                    />
                    <h6 className="fw-bold mb-0">{db.perfil?.nombre} {db.perfil?.apellido}</h6>
                    <p className="small text-muted mb-2">{db.perfil?.pais}</p>
                    <Link to={`/actualizar_autor/${autorId}`} className="btn btn-xs btn-outline-primary rounded-pill py-0 px-2" style={{ fontSize: '0.7rem' }}>
                        Editar Perfil
                    </Link>
                </div>

                <div className="list-group list-group-flush p-2">
                    <button onClick={() => setSeccionActiva("inicio")} className={`list-group-item list-group-item-action border-0 rounded-3 mb-1 ${seccionActiva === "inicio" ? "bg-primary text-white shadow-sm" : ""}`}>
                        <i className="fas fa-bullhorn me-2"></i> Mis Noticias
                    </button>
                    <button onClick={() => setSeccionActiva("libros")} className={`list-group-item list-group-item-action border-0 rounded-3 mb-1 ${seccionActiva === "libros" ? "bg-primary text-white shadow-sm" : ""}`}>
                        <i className="fas fa-book me-2"></i> Mis Libros
                    </button>
                    <button onClick={() => setSeccionActiva("audiencia")} className={`list-group-item list-group-item-action border-0 rounded-3 mb-1 ${seccionActiva === "audiencia" ? "bg-primary text-white shadow-sm" : ""}`}>
                        <i className="fas fa-users me-2"></i> Seguidores
                    </button>
                    <button onClick={() => setSeccionActiva("mapa")} className={`list-group-item list-group-item-action border-0 rounded-3 mb-1 ${seccionActiva === "mapa" ? "bg-primary text-white shadow-sm" : ""}`}>
                        <i className="fas fa-map-marked-alt me-2"></i> Mapa de Lectores
                    </button>
                </div>
            </div>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className="flex-grow-1 p-4 overflow-auto" style={{ 
                background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)', 
                minHeight: '100vh' 
            }}>
                <div className="container-fluid">

                    {/* SECCIÓN NOTICIAS / INICIO */}
                    {seccionActiva === "inicio" && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="fw-bold mb-0">Tablón de Noticias</h3>
                                <Link to="/crear_post_autor" className="btn btn-primary rounded-pill px-4">Nueva Noticia</Link>
                            </div>
                            <div className="row">
                                <div className="col-md-10 col-lg-8">
                                    {db.noticias.length > 0 ? db.noticias.map(post => (
                                        <div key={post.id} className="card mb-3 p-4 shadow-sm border-0 bg-white rounded-4">
                                            <div className="d-flex justify-content-between border-bottom pb-2 mb-3">
                                                <small className="text-muted fw-bold"><i className="far fa-calendar-alt me-1"></i> {post.fecha}</small>
                                                <div>
                                                    <button className="btn btn-sm text-primary me-2" onClick={() => { setEditando(post.id); setNuevoTexto(post.texto); }}>
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button className="btn btn-sm text-danger" onClick={() => handleEliminar(post.id)}>
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>

                                            {editando === post.id ? (
                                                <div>
                                                    <textarea className="form-control mb-2 rounded-3" rows="3" value={nuevoTexto} onChange={(e) => setNuevoTexto(e.target.value)} />
                                                    <button className="btn btn-sm btn-success rounded-pill px-3 me-2" onClick={() => handleGuardarEdicion(post.id)}>Guardar</button>
                                                    <button className="btn btn-sm btn-light rounded-pill px-3" onClick={() => setEditando(null)}>Cancelar</button>
                                                </div>
                                            ) : (
                                                <p className="mb-0 text-dark" style={{ whiteSpace: 'pre-wrap' }}>{post.texto}</p>
                                            )}
                                        </div>
                                    )) : (
                                        <div className="text-center p-5 bg-white rounded-4 shadow-sm">
                                            <p className="text-muted">No has publicado noticias todavía.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN MIS LIBROS */}
                    {seccionActiva === "libros" && (
                        <div>
                            <h3 className="fw-bold border-bottom pb-3 mb-4 text-primary">Mis Obras ({db.misLibros.length})</h3>
                            <div className="row">
                                {db.misLibros.map(l => (
                                    <div key={l.id} className="col-md-4 col-lg-3 mb-4">
                                        <div className="card h-100 border-0 shadow-sm rounded-4 text-center p-3 bg-white">
                                            <div className="mb-3" style={{ height: "180px" }}>
                                                <img src={l.image_url || "https://via.placeholder.com/120x180"} className="h-100 rounded-3 shadow-sm" alt={l.nombre} style={{ objectFit: 'cover' }} />
                                            </div>
                                            <h6 className="fw-bold text-dark mb-1">{l.nombre}</h6>
                                            <span className="badge bg-light text-primary rounded-pill mb-2">{l.genero}</span>
                                            <Link to={`/ver_libro/${l.id}`} className="btn btn-sm btn-outline-primary rounded-pill mt-auto">Detalles</Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN SEGUIDORES */}
                    {seccionActiva === "audiencia" && (
                        <div>
                            <h3 className="fw-bold border-bottom pb-3 mb-4 text-primary">Mi Comunidad ({db.misSeguidores.length})</h3>
                            <div className="row">
                                {db.misSeguidores.map(s => (
                                    <div key={s.id} className="col-md-6 col-lg-4 mb-3">
                                        <div className="d-flex align-items-center bg-white p-3 rounded-4 shadow-sm">
                                            <div className="flex-shrink-0">
                                                <img src={`https://ui-avatars.com/api/?name=${s.nombre_lector}&background=random`} className="rounded-circle" width="45" alt="lector" />
                                            </div>
                                            <div className="ms-3">
                                                <h6 className="mb-0 fw-bold">{s.nombre_lector}</h6>
                                                <small className="text-muted">@{s.username}</small>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN MAPA */}
                    {seccionActiva === "mapa" && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="fw-bold mb-0">Impacto Geográfico</h3>
                                <div className="btn-group shadow-sm bg-white rounded-pill p-1" role="group">
                                    <button className={`btn btn-sm rounded-pill px-3 ${vistaMapaActual === 'fansAutor' ? 'btn-primary' : 'btn-white border-0'}`} onClick={() => setVistaMapaActual('fansAutor')}>Fans Míos</button>
                                    <button className={`btn btn-sm rounded-pill px-3 ${vistaMapaActual === 'favLibros' ? 'btn-primary' : 'btn-white border-0'}`} onClick={() => setVistaMapaActual('favLibros')}>Fans Libros</button>
                                    <button className={`btn btn-sm rounded-pill px-3 ${vistaMapaActual === 'leyendo' ? 'btn-primary' : 'btn-white border-0'}`} onClick={() => setVistaMapaActual('leyendo')}>Leyendo</button>
                                </div>
                            </div>
                            <div className="card shadow-sm border-0 rounded-4 overflow-hidden p-2 bg-white" style={{ height: "550px" }}>
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
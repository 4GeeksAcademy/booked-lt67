import React, { useEffect, useState, useCallback } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import BuscadorGoogleBooks from "../components/23_BuscadorGoogleBooks";

// Assets e Imágenes (Asegúrate de que las rutas sean correctas)
import logoBookedUrl from "../assets/img/logo_booked1.png";
import booksImg from "../assets/img/Books.png"; 

const PaginaLector = () => {
    const { store } = useGlobalReducer();
    const navigate = useNavigate();
    const [idASeguir, setIdASeguir] = useState("");
    const [seccionActiva, setSeccionActiva] = useState("bienvenida");
    
    const [db, setDb] = useState({ 
        usuario: null, 
        favoritos: [], 
        leyendo: [], 
        todos: [], 
        otros: [], 
        autoresFav: [], 
        todosAutores: [], 
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
            const [u, f, l, t, all, af, ta] = await Promise.all([
                request(`lector/${store.lector_id}`),
                request(`lector/${store.lector_id}/favoritos`),
                request(`lector/${store.lector_id}/leyendo`),
                request(`libro`),
                request(`lector`),
                request(`lector_autores_favoritos`),
                request(`autor`)
            ]);

            const otros = all?.filter(o => o.id !== store.lector_id && !u?.siguiendo?.some(s => s.seguido_id === o.id)) || [];
            const misAutoresFav = af?.filter(item => Number(item.lector_id) === Number(store.lector_id)) || [];
            
            setDb({
                usuario: u, favoritos: f || [], leyendo: l || [],
                todos: t || [], otros, autoresFav: misAutoresFav,
                todosAutores: ta || [],
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

    // Componente de Tarjeta de Libro con estilo Home
    const TarjetaLibro = ({ l }) => {
    const esFavorito = db.favoritos.some(f => (f.libro?.id || f.libro_id) === l.id);
    const loEstaLeyendo = db.leyendo.some(ley => (ley.libro?.id || ley.libro_id) === l.id);

    return (
        <div className="col-md-4 col-lg-3 mb-5">
            {/* Añadimos un poco más de padding superior a la tarjeta (pt-5) */}
            <div className="card-feature text-center h-100 shadow-sm border-0 bg-white p-3 pt-5">
                <div className="book-cover-floating">
                    <img 
                        src={l.image_url || "https://via.placeholder.com/150x225?text=No+Cover"} 
                        className="portada-full" 
                        alt={l.nombre} 
                    />
                </div>
                
                {/* AQUÍ ESTÁ EL TRUCO: 
                   Añadimos 'mt-5' para que el título baje y no sea tapado por la imagen flotante 
                */}
                <div className="mt-5 pt-2">
                    <h6 className="fw-bold text-dark mb-1 text-truncate px-2">
                        {l.nombre}
                    </h6>
                    <p className="small text-muted mb-3">
                        {l.nombre_autor || "Autor Desconocido"}
                    </p>
                </div>
                
                <div className="d-flex justify-content-center gap-2 mt-auto pb-2">
                    <button 
                        className={`btn btn-sm rounded-pill px-3 ${loEstaLeyendo ? 'btn-warning text-white' : 'btn-outline-warning'}`}
                        onClick={() => exec(loEstaLeyendo ? `leyendo/libros/${store.lector_id}/${l.id}` : `leyendo/libros`, 
                                     loEstaLeyendo ? "DELETE" : "POST", 
                                     loEstaLeyendo ? null : { lector_id: store.lector_id, libro_id: l.id })}
                    >
                        <i className="fas fa-book-open"></i>
                    </button>
                    <button 
                        className={`btn btn-sm rounded-pill px-3 ${esFavorito ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={() => exec(esFavorito ? `favoritos/libros/${store.lector_id}/${l.id}` : `favoritos/libros`, 
                                     esFavorito ? "DELETE" : "POST", 
                                     esFavorito ? null : { lector_id: store.lector_id, libro_id: l.id })}
                    >
                        <i className={`fa${esFavorito ? 's' : 'r'} fa-heart`}></i>
                    </button>
                    <Link to={`/ver_libro/${l.id}`} className="btn btn-sm btn-booked-blue rounded-pill px-3">Detalles</Link>
                </div>
            </div>
        </div>
    );
};

    return (
        <div className="d-flex" style={{ minHeight: "100vh" }}>
            
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
                        { id: "autores", icon: "feather-alt", label: "Explorar Autores" },
                        { id: "seguidores", icon: "users", label: "Mi Red" },
                        { id: "biblioteca", icon: "search", label: "Biblioteca" },
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

            {/* --- CONTENIDO PRINCIPAL CON ESTILO HOME --- */}
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
                                <p className="lead text-muted mb-5">Gestiona tu ecosistema literario, descubre nuevos autores y mantén tu colección al día.</p>
                                
                                <div className="p-2 bg-white shadow-lg rounded-4 d-flex align-items-center border" style={{ maxWidth: '600px' }}>
                                    <div className="flex-grow-1 px-2">
                                        <BuscadorGoogleBooks onLibroAgregado={irAlLibro} />
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-5 d-none d-lg-block text-center">
                                <img src={booksImg} alt="Libros" className="img-fluid" style={{ maxHeight: "350px", filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.1))" }} />
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

                    {/* SECCIÓN AUTORES (ESTILO CIRCULAR HOME) */}
                    {seccionActiva === "autores" && (
                        <div>
                            <div className="text-center mb-5">
                                <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— Comunidad Real</span>
                                <h2 className="fw-bold mt-2">Nuestros Autores</h2>
                            </div>
                            <div className="row justify-content-center">
                                {db.todosAutores.map((autor) => (
                                    <div key={autor.id} className="col-md-3 mb-5">
                                        <div className="card-feature text-center h-100 shadow-sm border-0 bg-white p-4">
                                            <div className="book-cover-floating bg-white d-flex align-items-center justify-content-center shadow overflow-hidden"
                                                style={{ borderRadius: '50%', width: '110px', height: '110px', margin: '0 auto' }}>
                                                <img 
                                                    src={autor.foto || "https://via.placeholder.com/150"} 
                                                    alt={autor.nombre} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                            <div className="d-flex align-items-center justify-content-center mt-3">
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
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN COMUNIDAD (ESTILO CARD ABOUT US) */}
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

                </div>
            </div>
        </div>
    );
};

export default PaginaLector;
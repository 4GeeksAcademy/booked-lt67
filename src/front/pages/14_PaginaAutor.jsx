import React, { useEffect, useState, useCallback } from "react";
import { Navigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

// 1. IMPORTAMOS EL COMPONENTE DEL MAPA
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
    
    // --- NUEVO: ESTADOS PARA EL MAPA ---
    const [mapaViews, setMapaViews] = useState({
        fansAutor: [],
        favLibros: [],
        leyendo: []
    });
    const [vistaMapaActual, setVistaMapaActual] = useState('fansAutor');
    // -----------------------------------

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
        
        // --- NUEVO: FETCH PARA EL MAPA ---
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

            // --- NUEVO: GUARDAR DATOS DEL MAPA ---
            setMapaViews({
                fansAutor: lectoresFans || [],
                favLibros: lectoresFavLibros || [],
                leyendo: lectoresLeyendo || []
            });
            // -------------------------------------
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
    if (db.loading) return <div className="text-center mt-5">Cargando...</div>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                <div className="d-flex align-items-center">
                    <img
                        src={db.perfil?.foto
                            ? (db.perfil.foto.startsWith("http")
                                ? db.perfil.foto
                                : `${baseUrl}${db.perfil.foto.startsWith('/') ? '' : '/'}${db.perfil.foto}`)
                            : `https://ui-avatars.com/api/?name=${db.perfil?.nombre || "Autor"}+${db.perfil?.apellido || ""}`
                        }
                        alt={db.perfil?.nombre}
                        className="img-thumbnail me-3"
                        style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "50%" }}
                    />
                    <div>
                        <h2 className="mb-0">{db.perfil?.nombre} {db.perfil?.apellido}</h2>
                        <small className="text-muted">{db.perfil?.pais}</small>
                        <div>
                            <Link to={`/actualizar_autor/${autorId}`} className="btn btn-sm btn-outline-warning mt-2">
                                Editar Perfil
                            </Link>
                        </div>
                    </div>
                </div>
                <div>
                    <Link to="/crear_post_autor" className="btn btn-sm btn-primary me-2">Nueva Noticia</Link>
                </div>
            </div>

            <div className="row">
                <div className="col-md-8">
                    <h5>Posts</h5>
                    {db.noticias.map(post => (
                        <div key={post.id} className="card mb-3 p-3 shadow-sm border-0">
                            <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                <small className="text-muted">{post.fecha}</small>
                                <div>
                                    <button className="btn btn-sm text-primary me-2" onClick={() => { setEditando(post.id); setNuevoTexto(post.texto); }}>Editar</button>
                                    <button className="btn btn-sm text-danger" onClick={() => handleEliminar(post.id)}>Eliminar</button>
                                </div>
                            </div>

                            {editando === post.id ? (
                                <div>
                                    <textarea className="form-control mb-2" value={nuevoTexto} onChange={(e) => setNuevoTexto(e.target.value)} />
                                    <button className="btn btn-sm btn-success me-2" onClick={() => handleGuardarEdicion(post.id)}>Guardar</button>
                                    <button className="btn btn-sm btn-light" onClick={() => setEditando(null)}>Cancelar</button>
                                </div>
                            ) : (
                                <p className="mb-0">{post.texto}</p>
                            )}
                        </div>
                    ))}

                    {/* --- NUEVO: COMPONENTE DEL MAPA CON SWITCH --- */}
                    <div className="mt-5 mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Ubicación de mis Lectores</h5>
                            <div className="btn-group shadow-sm" role="group">
                                <button 
                                    className={`btn btn-sm ${vistaMapaActual === 'fansAutor' ? 'btn-primary' : 'btn-outline-primary'}`} 
                                    onClick={() => setVistaMapaActual('fansAutor')}>Fans Míos</button>
                                <button 
                                    className={`btn btn-sm ${vistaMapaActual === 'favLibros' ? 'btn-primary' : 'btn-outline-primary'}`} 
                                    onClick={() => setVistaMapaActual('favLibros')}>Fans de mis Libros</button>
                                <button 
                                    className={`btn btn-sm ${vistaMapaActual === 'leyendo' ? 'btn-primary' : 'btn-outline-primary'}`} 
                                    onClick={() => setVistaMapaActual('leyendo')}>Leyendo Ahora</button>
                            </div>
                        </div>
                        <div className="card shadow-sm border-0 p-2">
                            <LectoresUbi lectores={mapaViews[vistaMapaActual]} />
                        </div>
                    </div>
                    {/* --------------------------------------------- */}
                </div>

                <div className="col-md-4">
                    <h5 className="mb-3">Mis Libros ({db.misLibros.length})</h5>
                    <div className="list-group mb-4">
                        {db.misLibros.map(l => (
                            <div key={l.id} className="list-group-item small">
                                <strong>{l.nombre}</strong> <br />
                                <span className="text-muted">{l.genero}</span>
                            </div>
                        ))}
                    </div>
                    <h5 className="mb-3">Mis Seguidores ({db.misSeguidores.length})</h5>
                    <div className="list-group mb-4">
                        {db.misSeguidores.map(s => (
                            <div key={s.id} className="list-group-item small">
                                <strong>{s.nombre_lector}</strong> <br />
                                <span className="text-muted">{s.username}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaginaAutor;
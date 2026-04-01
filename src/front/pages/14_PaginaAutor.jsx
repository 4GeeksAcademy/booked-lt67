import React, { useEffect, useState, useCallback } from "react";
import { Navigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const PaginaAutor = () => {
    const { store } = useGlobalReducer();
    const [db, setDb] = useState({ perfil: null, misLibros: [], misSeguidores: [], noticias: [], loading: true });
    const [editando, setEditando] = useState(null); // Guarda el ID de la noticia que se edita
    const [nuevoTexto, setNuevoTexto] = useState(""); // Texto temporal de edición

    const autorId = store.autor_id || localStorage.getItem("autor_id");
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
        if (!autorId) return;
        const [perfil, libros, favs, posts] = await Promise.all([
            request(`autor/${autorId}`),
            request(`libro`),
            request(`lector_autores_favoritos`),
            request(`postautor/autor/${autorId}`)
        ]);

        if (perfil) {
            const id = parseInt(autorId);
            setDb({
                perfil,
                misLibros: libros?.filter(l => parseInt(l.autor_id) === id) || [],
                misSeguidores: favs?.filter(f => parseInt(f.autor_id) === id) || [],
                noticias: posts || [],
                loading: false
            });
        } else setDb(prev => ({ ...prev, loading: false }));
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
                <div>
                    <h2 className="mb-0">{db.perfil?.nombre} {db.perfil?.apellido}</h2>
                    <small className="text-muted">{db.perfil?.pais} | {db.misSeguidores.length} Seguidores</small>
                </div>
                <div>
                    <Link to="/crear_post_autor" className="btn btn-sm btn-primary me-2">Nueva Noticia</Link>
                    <button className="btn btn-sm btn-outline-secondary" onClick={loadData}>Actualizar</button>
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
                </div>

                <div className="col-md-4">
                    <h5 className="mb-3">Mis Libros ({db.misLibros.length})</h5>
                    <div className="list-group mb-4">
                        {db.misLibros.map(l => (
                            <div key={l.id} className="list-group-item small">
                                <strong>{l.nombre}</strong> <br/>
                                <span className="text-muted">{l.genero}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaginaAutor;
import React, { useEffect, useState, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const PaginaLector = () => {
    const { store } = useGlobalReducer();
    const [db, setDb] = useState({ user: null, favs: [], leyendo: [], todos: [], otros: [], loading: true });
    const [seguidoId, setSeguidoId] = useState("");
    const api = `${import.meta.env.VITE_BACKEND_URL}/api`;

    const fetcher = async (u, m = "GET", b) => {
        try {
            const res = await fetch(`${api}/${u}`, {
                method: m,
                headers: { "Content-Type": "application/json" },
                body: b ? JSON.stringify(b) : null
            });
            return res.ok ? await res.json() : null;
        } catch (e) { return null; }
    };

    const load = useCallback(async () => {
        if (!store.lector_id) return;
        const [u, f, l, t, allL] = await Promise.all([
            fetcher(`lector/${store.lector_id}`),
            fetcher(`lector/${store.lector_id}/favoritos`),
            fetcher(`lector/${store.lector_id}/leyendo`),
            fetcher(`libro`),
            fetcher(`lector`)
        ]);
        const otros = allL?.filter(o => o.id !== store.lector_id && !u?.siguiendo?.some(s => s.seguido_id === o.id)) || [];
        setDb({ user: u, favs: f || [], leyendo: l || [], todos: t || [], otros, loading: false });
    }, [store.lector_id]);

    useEffect(() => { if (store.auth_lector) load(); }, [store.auth_lector, load]);

    const exec = async (u, m, b) => { if (await fetcher(u, m, b)) load(); };

    const handleFollow = async (e) => {
        e.preventDefault();
        if (!seguidoId) return;
        await fetcher(`follow`, "POST", { seguidor_id: store.lector_id, seguido_id: parseInt(seguidoId) });
        setSeguidoId("");
        load();
    };

    if (!store.auth_lector) return <Navigate to="/login_lector" />;
    if (db.loading) return <div className="text-center mt-5"><h3>Cargando...</h3></div>;

    return (
        <div className="container mt-4">
            <h1 className="text-center border-bottom pb-2 h4">Panel de {db.user?.nombre}</h1>
            <div className="row mt-3">
                <div className="col-md-4">

                    <div className="card p-3 mb-3 border-0 bg-warning bg-opacity-10 shadow-sm">
                        <h6 className="fw-bold small">Leyendo ahora:</h6>
                        {db.leyendo.map(i => (
                            <div key={i.id} className="d-flex justify-content-between align-items-center bg-white p-2 rounded border mb-1 small">
                                <span className="text-truncate fw-bold">{i.libro?.nombre}</span>
                                <i className="fas fa-times-circle text-danger cp" onClick={() => exec(`leyendo/libros/${store.lector_id}/${i.libro?.id}`, "DELETE")} />
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleFollow} className="card p-3 mb-3 border-0 shadow-sm bg-primary bg-opacity-10">
                        <h6 className="fw-bold small">Seguir alguien nuevo</h6>
                        <div className="d-flex gap-2">
                            <select className="form-select form-select-sm" value={seguidoId} onChange={e => setSeguidoId(e.target.value)}>
                                <option value="">Elegir...</option>
                                {db.otros.map(o => <option key={o.id} value={o.id}>{o.username || o.nombre}</option>)}
                            </select>
                            <button className="btn btn-primary btn-sm">Seguir</button>
                        </div>
                    </form>

                    {["siguiendo", "seguidores"].map(t => (
                        <div className="card p-2 mb-2 shadow-sm border-0" key={t}>
                            <h6 className="fw-bold text-primary small px-2 mb-1 text-capitalize">{t} ({db.user?.[t]?.length})</h6>
                            <div className="px-2 small">
                                {db.user?.[t]?.map((s, index) => (
                                    <div key={index} className="d-flex justify-content-between align-items-center border-bottom py-1">
                                        <span className="text-truncate" style={{ maxWidth: '60%' }}>
                                            {s.nombre_seguido || s.nombre_seguidor}
                                        </span>
                                        {t === "siguiendo" && (
                                            <button className="btn btn-sm btn-link text-danger p-0 border-0 fw-bold" style={{ fontSize: '0.7rem', textDecoration: 'none' }} onClick={() => exec(`unfollow/${s.relacion_id}`, "DELETE")}>
                                                Dejar de seguir
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="col-md-8">
                    <h6 className="fw-bold border-bottom pb-2">Mis Favoritos</h6>
                    <div className="row mb-3">
                        {db.favs.map(f => (
                            <div key={f.id} className="col-6 mb-2 small">
                                <div className="card p-2 border-0 shadow-sm d-flex flex-row justify-content-between align-items-center">
                                    <span className="text-truncate" style={{ maxWidth: '65%' }}>{f.libro?.nombre}</span>
                                    <button className="btn btn-sm btn-link text-danger p-0 border-0 fw-bold" style={{ fontSize: '0.7rem', textDecoration: 'none' }} onClick={() => exec(`favoritos/libros/${store.lector_id}/${f.libro?.id}`, "DELETE")}>
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h6 className="fw-bold border-bottom pb-2">Biblioteca</h6>
                    <div className="row">
                        {db.todos.map(l => {
                            const isF = db.favs.some(f => (f.libro?.id || f.libro_id) === l.id);
                            const isL = db.leyendo.some(ley => (ley.libro?.id || ley.libro_id) === l.id);
                            return (
                                <div key={l.id} className="col-6 mb-3">
                                    <div className="card p-2 shadow-sm border-0 h-100">
                                        <h6 className="small fw-bold text-truncate mb-2">{l.nombre}</h6>
                                        <div className="d-flex flex-column gap-1 mt-auto">
                                            <Link to={`/pagina_lector/${l.id}/reviews`} className="btn btn-sm btn-outline-primary py-0 w-100">
                                                Ver reseñas
                                            </Link>
                                            <div className="d-flex gap-1">
                                                <button className={`btn btn-sm py-0 flex-grow-1 ${isL ? 'btn-warning' : 'btn-outline-warning'}`}
                                                    onClick={() => exec(isL ? `leyendo/libros/${store.lector_id}/${l.id}` : `leyendo/libros`, isL ? "DELETE" : "POST", isL ? null : { lector_id: store.lector_id, libro_id: l.id })}>
                                                    {isL ? "Leyendo" : "¿Leyendo?"}
                                                </button>
                                                <button className={`btn btn-sm py-0 flex-grow-1 ${isF ? 'btn-danger' : 'btn-outline-danger'}`}
                                                    onClick={() => exec(isF ? `favoritos/libros/${store.lector_id}/${l.id}` : `favoritos/libros`, isF ? "DELETE" : "POST", isF ? null : { lector_id: store.lector_id, libro_id: l.id })}>
                                                    {isF ? "Eliminar favorito" : "Favorito"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaginaLector;
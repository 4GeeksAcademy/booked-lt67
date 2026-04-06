import React, { useEffect, useState, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const TarjetaLibro = ({ libro, esFavorito, loEstaLeyendo, alHacerClic, lectorId }) => (
    <div className="col-6 mb-3">
        <div className="card p-2 shadow-sm border-0 h-100">
            <h6 className="small fw-bold text-truncate mb-2">{libro.nombre}</h6>
            <div className="d-flex flex-column gap-1 mt-auto">
                <Link to={`/pagina_lector/${libro.id}/reviews`} className="btn btn-sm btn-outline-primary py-0">Ver reseñas</Link>
                <div className="d-flex gap-1">
                    <button className={`btn btn-sm py-0 flex-grow-1 ${loEstaLeyendo ? 'btn-warning' : 'btn-outline-warning'}`}
                        onClick={() => alHacerClic(loEstaLeyendo ? `leyendo/libros/${lectorId}/${libro.id}` : `leyendo/libros`, loEstaLeyendo ? "DELETE" : "POST", loEstaLeyendo ? null : { lector_id: lectorId, libro_id: libro.id })}>
                        {loEstaLeyendo ? "Leyendo" : "¿Leyendo?"}
                    </button>
                    <button className={`btn btn-sm py-0 flex-grow-1 ${esFavorito ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={() => alHacerClic(esFavorito ? `favoritos/libros/${lectorId}/${libro.id}` : `favoritos/libros`, esFavorito ? "DELETE" : "POST", esFavorito ? null : { lector_id: lectorId, libro_id: libro.id })}>
                        {esFavorito ? "Quitar" : "Favorito"}
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const PaginaLector = () => {
    const { store } = useGlobalReducer();
    const [db, setDb] = useState({ usuario: null, favoritos: [], leyendo: [], todos: [], otros: [], autoresFav: [], todosAutores: [], loading: true });
    const [idASeguir, setIdASeguir] = useState("");
    const [idAutorASeguir, setIdAutorASeguir] = useState("");
    const api = `${import.meta.env.VITE_BACKEND_URL}/api`;

    const request = async (url, m = "GET", b = null) => {
        try {
            const res = await fetch(`${api}/${url}`, {
                method: m, headers: { "Content-Type": "application/json" },
                body: b ? JSON.stringify(b) : null
            });
            return res.ok ? await res.json() : null;
        } catch (e) { return null; }
    };

    const load = useCallback(async () => {
        if (!store.lector_id) return;

        try {
            // Ejecutamos todas las peticiones
            const [u, f, l, t, all, af, ta] = await Promise.all([
                request(`lector/${store.lector_id}`),
                request(`lector/${store.lector_id}/favoritos`),
                request(`lector/${store.lector_id}/leyendo`),
                request(`libro`),
                request(`lector`),
                request(`lector_autores_favoritos`), // <-- esto es 'af'
                request(`autor`)                      // <-- esto es 'ta'
            ]);

            const otros = all?.filter(o => o.id !== store.lector_id && !u?.siguiendo?.some(s => s.seguido_id === o.id)) || [];

            const misAutoresFav = af?.filter(item => Number(item.lector_id) === Number(store.lector_id)) || [];

            const autoresDisponibles = ta?.filter(a =>
                !misAutoresFav.some(fav => Number(fav.autor_id) === Number(a.id))
            ) || [];

            setDb({
                usuario: u,
                favoritos: f || [],
                leyendo: l || [],
                todos: t || [],
                otros,
                autoresFav: misAutoresFav,
                todosAutores: autoresDisponibles,
                loading: false
            });
        } catch (error) {
            console.error("Error cargando datos:", error);
            setDb(prev => ({ ...prev, loading: false }));
        }
    }, [store.lector_id]);

    useEffect(() => { if (store.auth_lector) load(); }, [store.auth_lector, load]);

    const exec = async (u, m, b) => { if (await request(u, m, b)) load(); };

    if (!store.auth_lector) return <Navigate to="/login_lector" />;
    if (db.loading) return <div className="text-center mt-5"><h3>Cargando...</h3></div>;

    const usuario = db.usuario;
    const nombre = usuario?.nombre || "Lector";
    const apellido = usuario?.apellido || "";
    const fotoUrl = usuario?.foto_url;

    const imagenFinal = fotoUrl || `https://ui-avatars.com/api/?name=${nombre}+${apellido}&background=random`;

    return (
        <div className="container mt-4">
            <div className="text-center mb-3">
                <img
                    src={imagenFinal}
                    className="rounded-circle shadow-sm border"
                    style={{ width: "150px", height: "150px", objectFit: "cover" }}
                    alt="Perfil"
                />
            </div>
            <h1 className="text-center border-bottom pb-2 h4">Panel de {db.usuario?.nombre}</h1>
            <div>
                <Link to={`/actualizar_lector/${store.lector_id}`} className="btn btn-sm btn-outline-warning mt-2">
                    Editar Perfil
                </Link>
            </div>
            <div className="row mt-3">
                <div className="col-md-4">
                    <div className="card p-3 mb-3 border-0 bg-warning bg-opacity-10 shadow-sm">
                        <h6 className="fw-bold small">Leyendo:</h6>
                        {db.leyendo.map(i => (
                            <div key={i.id} className="d-flex justify-content-between bg-white p-2 rounded border mb-1 small">
                                <span className="text-truncate fw-bold">{i.libro?.nombre}</span>
                                <i className="fas fa-times-circle text-danger cp" onClick={() => exec(`leyendo/libros/${store.lector_id}/${i.libro?.id}`, "DELETE")} />
                            </div>
                        ))}
                    </div>

                    <form className="card p-3 mb-3 border-0 shadow-sm bg-success bg-opacity-10"
                        onSubmit={async (e) => {
                            e.preventDefault();
                            if (!idAutorASeguir) return;
                            await request(`lector_autores_favoritos`, "POST", { lector_id: store.lector_id, autor_id: parseInt(idAutorASeguir) });
                            setIdAutorASeguir("");
                            load();
                        }}>
                        <h6 className="fw-bold small">Seguir Autor</h6>
                        <div className="d-flex gap-2">
                            <select className="form-select form-select-sm" value={idAutorASeguir} onChange={e => setIdAutorASeguir(e.target.value)}>
                                <option value="">Elegir...</option>
                                {db.todosAutores?.map(a => <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>)}
                            </select>
                            <button className="btn btn-success btn-sm">Ok</button>
                        </div>
                    </form>

                    <div className="card p-2 mb-2 shadow-sm border-0">
                        <h6 className="fw-bold text-success small mb-1">Autores Favoritos ({db.autoresFav?.length || 0})</h6>
                        {db.autoresFav?.map((af) => (
                            <div key={af.id} className="d-flex justify-content-between small border-bottom py-1">
                                {/* Usamos nombre_autor que es lo que viene en tu JSON de respuesta */}
                                <span className="text-truncate">{af.nombre_autor || "Autor desconocido"}</span>
                                <button
                                    className="btn btn-sm text-danger p-0 border-0"
                                    onClick={() => exec(`lector_autores_favoritos/${af.id}`, "DELETE")}
                                >
                                    Quitar de favoritos
                                </button>
                            </div>
                        ))}
                    </div>

                    <form className="card p-3 mb-3 border-0 shadow-sm bg-primary bg-opacity-10" onSubmit={async (e) => { e.preventDefault(); await request(`follow`, "POST", { seguidor_id: store.lector_id, seguido_id: parseInt(idASeguir) }); setIdASeguir(""); load(); }}>
                        <h6 className="fw-bold small">Seguir Lector</h6>
                        <div className="d-flex gap-2">
                            <select className="form-select form-select-sm" value={idASeguir} onChange={e => setIdASeguir(e.target.value)}>
                                <option value="">Elegir...</option>
                                {db.otros.map(o => <option key={o.id} value={o.id}>{o.username || o.nombre}</option>)}
                            </select>
                            <button className="btn btn-primary btn-sm">Ok</button>
                        </div>
                    </form>

                    {["siguiendo", "seguidores"].map(tipo => (
                        <div className="card p-2 mb-2 shadow-sm border-0" key={tipo}>
                            <h6 className="fw-bold text-primary small mb-1 text-capitalize">{tipo} ({db.usuario?.[tipo]?.length})</h6>
                            {db.usuario?.[tipo]?.map((r, i) => (
                                <div key={i} className="d-flex justify-content-between small border-bottom py-1">
                                    <span className="text-truncate">{r.nombre_seguido || r.nombre_seguidor}</span>
                                    {tipo === "siguiendo" && <button className="btn btn-sm text-danger p-0 border-0" onClick={() => exec(`unfollow/${r.relacion_id}`, "DELETE")}>Dejar de seguir</button>}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="col-md-8">
                    <h6 className="fw-bold border-bottom pb-2">Favoritos</h6>
                    <div className="row mb-3">
                        {db.favoritos.map(f => (
                            <div key={f.id} className="col-6 mb-2 small">
                                <div className="card p-2 border-0 shadow-sm d-flex flex-row justify-content-between">
                                    <span className="text-truncate">{f.libro?.nombre}</span>
                                    <button className="btn btn-sm text-danger p-0" onClick={() => exec(`favoritos/libros/${store.lector_id}/${f.libro?.id}`, "DELETE")}>X</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h6 className="fw-bold border-bottom pb-2">Biblioteca</h6>
                    <div className="row">
                        {db.todos.map(l => (
                            <TarjetaLibro key={l.id} libro={l} lectorId={store.lector_id} alHacerClic={exec}
                                esFavorito={db.favoritos.some(f => (f.libro?.id || f.libro_id) === l.id)}
                                loEstaLeyendo={db.leyendo.some(ley => (ley.libro?.id || ley.libro_id) === l.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaginaLector;
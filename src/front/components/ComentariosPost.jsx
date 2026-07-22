import React, { useEffect, useState, useCallback } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const ComentariosPost = ({ tipo, postId }) => {
    const { store } = useGlobalReducer();
    const [comentarios, setComentarios] = useState([]);
    const [texto, setTexto] = useState("");
    const [loading, setLoading] = useState(false);
    const [enviando, setEnviando] = useState(false);

    const api = `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")}/api`;

    const cargar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${api}/comentarios/${tipo}/${postId}`);
            if (res.ok) setComentarios(await res.json());
        } finally {
            setLoading(false);
        }
    }, [tipo, postId]);

    useEffect(() => { cargar(); }, [cargar]);

    const enviar = async (e) => {
        e.preventDefault();
        if (!texto.trim() || !store.auth_lector) return;
        setEnviando(true);
        try {
            const body = {
                lector_id: store.lector_id,
                texto: texto.trim(),
                [`post_${tipo}_id`]: postId
            };
            const res = await fetch(`${api}/comentarios`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                setTexto("");
                cargar();
            }
        } finally {
            setEnviando(false);
        }
    };

    const eliminar = async (id) => {
        if (!window.confirm("¿Eliminar comentario?")) return;
        await fetch(`${api}/comentarios/${id}`, { method: "DELETE" });
        cargar();
    };

    return (
        <div className="mt-3 pt-3 border-top">
            <p className="small fw-bold text-muted mb-3">
                <i className="fas fa-comment-dots me-2 text-info-booked"></i>
                {comentarios.length} comentario{comentarios.length !== 1 ? "s" : ""}
            </p>

            <div className="d-flex flex-column gap-2 mb-3">
                {loading ? (
                    <div className="text-center py-2"><div className="spinner-border spinner-border-sm text-info-booked"></div></div>
                ) : comentarios.length === 0 ? (
                    <p className="small text-muted fst-italic text-center py-2">Sé el primero en comentar.</p>
                ) : (
                    comentarios.map(c => (
                        <div key={c.id} className="d-flex gap-2 align-items-start">
                            <img
                                src={c.foto_lector || `https://ui-avatars.com/api/?name=${c.username_lector}&background=24b0d9&color=fff&size=32`}
                                className="rounded-circle flex-shrink-0"
                                style={{ width: "32px", height: "32px", objectFit: "cover" }}
                                alt={c.username_lector}
                            />
                            <div className="flex-grow-1 bg-light rounded-3 px-3 py-2">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="small fw-bold text-dark">@{c.username_lector}</span>
                                    <span className="small text-muted">{c.fecha}</span>
                                </div>
                                <p className="mb-0 small text-dark">{c.texto}</p>
                            </div>
                            {store.auth_lector && Number(store.lector_id) === c.lector_id && (
                                <button
                                    className="btn btn-sm text-danger p-0 flex-shrink-0"
                                    onClick={() => eliminar(c.id)}
                                    title="Eliminar"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {store.auth_lector ? (
                <form onSubmit={enviar} className="d-flex gap-2">
                    <input
                        type="text"
                        className="form-control form-control-sm rounded-pill border-0 bg-light"
                        placeholder="Escribe un comentario..."
                        value={texto}
                        onChange={e => setTexto(e.target.value)}
                        maxLength={500}
                        disabled={enviando}
                    />
                    <button
                        type="submit"
                        className="btn btn-sm btn-booked-blue rounded-pill px-3 flex-shrink-0"
                        disabled={!texto.trim() || enviando}
                    >
                        {enviando ? <span className="spinner-border spinner-border-sm"></span> : <i className="fas fa-paper-plane"></i>}
                    </button>
                </form>
            ) : (
                <p className="small text-muted text-center">
                    <a href="/login_lector" className="text-info-booked fw-bold">Inicia sesión</a> para comentar.
                </p>
            )}
        </div>
    );
};

export default ComentariosPost;

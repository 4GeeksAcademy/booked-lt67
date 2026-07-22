import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const iconoTipo = {
    follow: "fa-user-plus",
    comentario: "fa-comment-dots",
    nuevo_post_lector: "fa-pen",
    nuevo_post_autor: "fa-feather-alt",
    nuevo_post_editorial: "fa-university",
    nuevo_libro: "fa-book"
};

const Notificaciones = ({ onClose }) => {
    const { store } = useGlobalReducer();
    const [notifs, setNotifs] = useState([]);
    const [loading, setLoading] = useState(true);

    const api = `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")}/api`;

    const cargar = useCallback(async () => {
        if (!store.lector_id) return;
        setLoading(true);
        try {
            const res = await fetch(`${api}/notificaciones/${store.lector_id}`);
            if (res.ok) setNotifs(await res.json());
        } finally {
            setLoading(false);
        }
    }, [store.lector_id]);

    useEffect(() => { cargar(); }, [cargar]);

    const marcarLeida = async (id) => {
        await fetch(`${api}/notificaciones/${id}/leer`, { method: "PUT" });
        setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
    };

    const marcarTodas = async () => {
        await fetch(`${api}/notificaciones/${store.lector_id}/leer_todas`, { method: "PUT" });
        setNotifs(prev => prev.map(n => ({ ...n, leida: true })));
    };

    const noLeidas = notifs.filter(n => !n.leida).length;

    return (
        <div className="card shadow-lg border-0 rounded-4" style={{ width: "340px", maxHeight: "480px", overflow: "hidden" }}>
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center px-4 py-3">
                <h6 className="fw-bold mb-0 text-dark">
                    <i className="fas fa-bell me-2 text-info-booked"></i>
                    Notificaciones
                    {noLeidas > 0 && (
                        <span className="badge bg-danger rounded-pill ms-2 small">{noLeidas}</span>
                    )}
                </h6>
                <div className="d-flex gap-2 align-items-center">
                    {noLeidas > 0 && (
                        <button onClick={marcarTodas} className="btn btn-sm text-info-booked p-0 small fw-bold">
                            Todo leído
                        </button>
                    )}
                    <button onClick={onClose} className="btn-close btn-sm"></button>
                </div>
            </div>

            <div className="overflow-auto" style={{ maxHeight: "400px" }}>
                {loading ? (
                    <div className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-info-booked"></div>
                    </div>
                ) : notifs.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        <i className="fas fa-bell-slash fa-2x mb-3 opacity-25"></i>
                        <p className="small mb-0">Sin notificaciones por ahora</p>
                    </div>
                ) : (
                    notifs.map(n => (
                        <div
                            key={n.id}
                            className={`d-flex align-items-start px-4 py-3 border-bottom ${!n.leida ? "bg-light" : ""}`}
                            style={{ cursor: "pointer" }}
                            onClick={() => { if (!n.leida) marcarLeida(n.id); }}
                        >
                            <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0 ${!n.leida ? "bg-info-booked" : "bg-secondary"}`}
                                style={{ width: "36px", height: "36px" }}>
                                <i className={`fas ${iconoTipo[n.tipo] || "fa-bell"} text-white`} style={{ fontSize: "14px" }}></i>
                            </div>
                            <div className="flex-grow-1">
                                {n.url_destino ? (
                                    <Link to={n.url_destino} className="text-decoration-none" onClick={onClose}>
                                        <p className={`mb-0 small ${!n.leida ? "fw-bold text-dark" : "text-muted"}`}>{n.mensaje}</p>
                                    </Link>
                                ) : (
                                    <p className={`mb-0 small ${!n.leida ? "fw-bold text-dark" : "text-muted"}`}>{n.mensaje}</p>
                                )}
                                <span className="small text-muted" style={{ fontSize: "0.72rem" }}>{n.fecha}</span>
                            </div>
                            {!n.leida && (
                                <div className="bg-info-booked rounded-circle flex-shrink-0 ms-2 mt-1" style={{ width: "8px", height: "8px" }}></div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notificaciones;

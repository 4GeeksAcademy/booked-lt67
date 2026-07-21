import React, { useState, useEffect, useCallback } from "react";

const CajaComentarios = ({ postId, tipoPost, tipoUsuarioActual }) => {
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [textosRespuesta, setTextosRespuesta] = useState({});

    const api = `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")}/api`;
    const token = localStorage.getItem(`token_${tipoUsuarioActual}`);

    const cargarComentarios = useCallback(async () => {
        try {
            const res = await fetch(`${api}/comentarios/${tipoPost}/${postId}`);
            if (res.ok) {
                const data = await res.json();
                setComentarios(data);
            }
        } catch (error) {
            console.error("Error cargando comentarios:", error);
        }
    }, [api, tipoPost, postId]);

    useEffect(() => {
        if (postId) cargarComentarios();
    }, [postId, cargarComentarios]);

   const handleEnviar = async (e, textoPersonalizado = null, parentId = null) => {
        // Si viene de un formulario tradicional, prevenimos el comportamiento por defecto
        if (e && e.preventDefault) e.preventDefault();
        
        // Determinamos qué texto usar: el del input principal o el de la respuesta anidada
        const textoAEnviar = textoPersonalizado !== null ? textoPersonalizado : nuevoComentario;

        if (!textoAEnviar.trim() || textoAEnviar.length > 250) return;

        setEnviando(true);
        try {
            const res = await fetch(`${api}/comentarios`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    texto: textoAEnviar,
                    post_id: postId,
                    tipo_post: tipoPost,
                    parent_id: parentId // 🌟 Enviamos el id del padre al backend (puede ser null)
                })
            });

            if (res.ok) {
                // Si fue un comentario principal, limpiamos el input global
                if (parentId === null) {
                    setNuevoComentario("");
                }
                cargarComentarios(); // Refresca todo el árbol con las respuestas nuevas
            } else {
                alert("No se pudo publicar el comentario.");
            }
        } catch (error) {
            console.error("Error al comentar:", error);
        } finally {
            setEnviando(false);
        }
    };

    const handleEliminar = async (comentarioId) => {
        if (!window.confirm("¿Seguro que quieres borrar este comentario?")) return;

        try {
            const res = await fetch(`${api}/comentarios/${comentarioId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                cargarComentarios();
            } else {
                alert("No tienes permisos o no se pudo eliminar.");
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    return (
        <div className="mt-4 pt-3 border-top" style={{ fontFamily: "'Inter', sans-serif" }}>
            
            {/* Header de Comentarios */}
            <div className="d-flex align-items-center mb-3">
                <h6 className="fw-bold mb-0 text-dark small" style={{ letterSpacing: "0.5px" }}>
                    <i className="far fa-comments me-2 text-info-booked"></i>
                    Comentarios <span className="badge rounded-pill badge-booked ms-1 small" style={{ fontSize: "0.75rem" }}>{comentarios.length}</span>
                </h6>
            </div>

            {/* Contenedor Scrolleable de Comentarios */}
            <div className="d-flex flex-column gap-3 mb-3" style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "4px" }}>
                {comentarios.length > 0 ? (
                    // 🌟 FILTRAMOS: Solo iteramos los comentarios principales/raíces primero
                    comentarios.filter(c => c.parent_id === null).map((c) => {
                        const esDueno = c.creador_tipo === tipoUsuarioActual;

                        // Definición dinámica de colores basada en tu paleta de Booked
                        let badgeStyle = { backgroundColor: "rgba(36, 176, 217, 0.1)", color: "#24b0d9" };
                        if (c.creador_tipo === "autor") {
                            badgeStyle = { backgroundColor: "rgba(255, 193, 7, 0.12)", color: "#b58100" };
                        } else if (c.creador_tipo === "editorial") {
                            badgeStyle = { backgroundColor: "rgba(25, 135, 84, 0.1)", color: "#198754" };
                        }

                        return (
                            <div key={c.id} className="d-flex flex-column gap-2">
                                {/* --- COMENTARIO PRINCIPAL --- */}
                                <div className="p-3 rounded-4 d-flex align-items-start gap-2 border-0 bg-light position-relative transition-all" style={{ border: "1px solid #eee" }}>
                                    <img 
                                        src={c.creador_foto || `https://ui-avatars.com/api/?name=${c.creador_nombre}&background=24b0d9&color=fff`} 
                                        alt={c.creador_nombre}
                                        className="rounded-circle border border-2 border-white shadow-sm"
                                        style={{ width: "32px", height: "32px", objectFit: "cover" }}
                                    />
                                    <div className="flex-grow-1" style={{ fontSize: "0.85rem" }}>
                                        <div className="d-flex align-items-center flex-wrap gap-1">
                                            <span className="fw-bold text-dark">{c.creador_nombre}</span>
                                            <span className="badge rounded-pill fw-bold text-uppercase ms-1" style={{ fontSize: "0.58rem", padding: "3px 8px", ...badgeStyle }}>
                                                {c.creador_tipo}
                                            </span>
                                            <span className="text-muted ms-auto" style={{ fontSize: "0.7rem", opacity: 0.8 }}>
                                                <i className="far fa-clock me-1"></i>{c.fecha}
                                            </span>
                                        </div>
                                        <p className="mb-0 mt-1 text-dark" style={{ whiteSpace: "pre-wrap", lineHeight: "1.4" }}>{c.texto}</p>
                                        
                                        {/* 🌟 Botón Responder */}
                                        <div className="mt-2 d-flex gap-2">
                                            <button 
                                                onClick={() => {
                                                    setReplyingTo(replyingTo === c.id ? null : c.id);
                                                    setTextosRespuesta(prev => ({ ...prev, [c.id]: "" }));
                                                }}
                                                className="btn btn-sm p-0 text-info-booked border-0 bg-transparent fw-bold" 
                                                style={{ fontSize: "0.75rem" }}
                                            >
                                                <i className="fas fa-reply me-1"></i> Responder
                                            </button>
                                        </div>
                                    </div>

                                    {/* Botón Eliminar Estilo Booked */}
                                    {esDueno && (
                                        <button 
                                            onClick={() => handleEliminar(c.id)}
                                            className="btn btn-sm text-danger p-0 ms-2 lh-1 border-0 bg-transparent opacity-75 hover-opacity-100" 
                                            title="Eliminar comentario"
                                            style={{ fontSize: "0.9rem", transition: "all 0.2s" }}
                                        >
                                            <i className="fas fa-minus-circle"></i>
                                        </button>
                                    )}
                                </div>

                                {/* --- 🌟 RESPUESTAS ANIDADAS (HILOS DE CONVERSACIÓN) --- */}
                                {c.respuestas && c.respuestas.length > 0 && (
                                    <div className="ms-4 ms-md-5 d-flex flex-column gap-2 border-start ps-3" style={{ borderColor: '#e3f6fd' }}>
                                        {c.respuestas.map((r) => {
                                            const esDuenoRespuesta = r.creador_tipo === tipoUsuarioActual;
                                            
                                            let rBadgeStyle = { backgroundColor: "rgba(36, 176, 217, 0.1)", color: "#24b0d9" };
                                            if (r.creador_tipo === "autor") rBadgeStyle = { backgroundColor: "rgba(255, 193, 7, 0.12)", color: "#b58100" };
                                            if (r.creador_tipo === "editorial") rBadgeStyle = { backgroundColor: "rgba(25, 135, 84, 0.1)", color: "#198754" };

                                            return (
                                                <div key={r.id} className="p-2.5 px-3 rounded-4 d-flex align-items-start gap-2 bg-white border border-light position-relative shadow-sm">
                                                    <img 
                                                        src={r.creador_foto || `https://ui-avatars.com/api/?name=${r.creador_nombre}&background=24b0d9&color=fff`} 
                                                        alt={r.creador_nombre}
                                                        className="rounded-circle border border-2 border-white shadow-sm"
                                                        style={{ width: "26px", height: "26px", objectFit: "cover" }}
                                                    />
                                                    <div className="flex-grow-1" style={{ fontSize: "0.8rem" }}>
                                                        <div className="d-flex align-items-center flex-wrap gap-1">
                                                            <span className="fw-bold text-dark">{r.creador_nombre}</span>
                                                            <span className="badge rounded-pill fw-bold text-uppercase ms-1" style={{ fontSize: "0.52rem", padding: "2px 6px", ...rBadgeStyle }}>
                                                                {r.creador_tipo}
                                                            </span>
                                                            <span className="text-muted ms-auto" style={{ fontSize: "0.65rem", opacity: 0.8 }}>
                                                                <i className="far fa-clock me-1"></i>{r.fecha}
                                                            </span>
                                                        </div>
                                                        <p className="mb-0 mt-1 text-muted" style={{ whiteSpace: "pre-wrap", lineHeight: "1.3" }}>{r.texto}</p>
                                                    </div>

                                                    {esDuenoRespuesta && (
                                                        <button 
                                                            onClick={() => handleEliminar(r.id)}
                                                            className="btn btn-sm text-danger p-0 ms-2 lh-1 border-0 bg-transparent opacity-75" 
                                                            title="Eliminar respuesta"
                                                            style={{ fontSize: "0.8rem" }}
                                                        >
                                                            <i className="fas fa-minus-circle"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* --- 🌟 FORMULARIO DINÁMICO PARA AGREGAR RESPUESTA --- */}
                                {replyingTo === c.id && (
                                    <div className="ms-4 ms-md-5 mt-1 animate-fade-in">
                                        <div className="input-group input-group-sm shadow-sm">
                                            <input
                                                type="text"
                                                className="form-control border bg-white px-3"
                                                placeholder={`Responder a @${c.creador_nombre}...`}
                                                style={{ fontSize: "0.8rem", borderRadius: "8px 0 0 8px", borderColor: "#24b0d9" }}
                                                value={textosRespuesta[c.id] || ""}
                                                onChange={(e) => setTextosRespuesta(prev => ({ ...prev, [c.id]: e.target.value }))}
                                                maxLength={250}
                                                disabled={enviando}
                                            />
                                            <button 
                                                onClick={async () => {
                                                    await handleEnviar(null, textosRespuesta[c.id], c.id);
                                                    setReplyingTo(null); // Cerramos la caja al enviar
                                                }}
                                                className="btn btn-booked-blue px-3 d-flex align-items-center"
                                                style={{ borderRadius: "0 8px 8px 0" }}
                                                disabled={enviando || !(textosRespuesta[c.id]?.trim())}
                                            >
                                                <i className="fas fa-paper-plane" style={{ fontSize: "0.75rem" }}></i>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-3 bg-light rounded-4" style={{ border: "1px dashed #ddd" }}>
                        <p className="text-muted small fst-italic mb-0">Nadie ha comentado aún. ¡Sé el primero en abrir el debate!</p>
                    </div>
                )}
            </div>

            {/* Formulario de Entrada Principal (Igual al tuyo, sin tocar nada) */}
            <form onSubmit={(e) => handleEnviar(e, null, null)} className="mt-2">
                <div className="input-group" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.02))" }}>
                    <input
                        type="text"
                        className="form-control border border-end-0 px-3 bg-white"
                        placeholder="Escribe un comentario principal..."
                        style={{ 
                            fontSize: "0.85rem", 
                            borderRadius: "10px 0 0 10px", 
                            outline: "none",
                            borderColor: "#e3f6fd"
                        }}
                        value={nuevoComentario}
                        onChange={(e) => setNuevoComentario(e.target.value)}
                        maxLength={250}
                        disabled={enviando}
                    />
                    <button 
                        type="submit" 
                        className="btn btn-booked-blue px-3 d-flex align-items-center justify-content-center"
                        style={{ 
                            borderRadius: "0 10px 10px 0",
                            padding: "8px 20px"
                        }}
                        disabled={enviando || !nuevoComentario.trim()}
                    >
                        {enviando ? (
                            <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                            <i className="fas fa-paper-plane" style={{ fontSize: "0.85rem" }}></i>
                        )}
                    </button>
                </div>
                <div className="text-end px-2 mt-1" style={{ fontSize: "0.65rem", color: nuevoComentario.length > 230 ? "#dc3545" : "#a0aec0" }}>
                    {nuevoComentario.length} / 250
                </div>
            </form>
        </div>
    );
};

export default CajaComentarios;
import React, { useEffect, useState, useRef, useCallback } from "react";

const Chat = ({ lectorId, editorialId, tipoUsuario, esPopUp = false, abiertoInicial = false, nombreEditorial = "" }) => {
    const [estaAbierto, setEstaAbierto] = useState(abiertoInicial);
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState("");
    const scrollRef = useRef(null);
   

    const obtenerToken = () => localStorage.getItem("token_lector") || localStorage.getItem("token_editorial");

    const obtenerMensajes = useCallback(async () => {
        const token = obtenerToken();
        if (!token) return;
        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
            const response = await fetch(`${baseUrl}/api/chat/${lectorId}/${editorialId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });
            if (response.ok) {
                const data = await response.json();
                setMensajes(data);
            }
        } catch (error) { console.error("Error:", error); }
    }, [lectorId, editorialId]);

    useEffect(() => {
        obtenerMensajes();
        // Nota: Quité el setInterval del poll por ahora como pediste
    }, [obtenerMensajes]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [mensajes, estaAbierto]);


    useEffect(() => {
        if (esPopUp) {
            setEstaAbierto(abiertoInicial);
        }
    }, [abiertoInicial, esPopUp]);

    const enviarMensaje = async () => {
        if (!nuevoMensaje.trim()) return;
        const token = obtenerToken();
        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
            const response = await fetch(`${baseUrl}/api/enviar-mensaje`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    contenido: nuevoMensaje,
                    lector_id: lectorId,
                    editorial_id: editorialId,
                    tipo_emisor: tipoUsuario
                }),
            });
            if (response.ok) {
                setNuevoMensaje("");
                obtenerMensajes();
            }
        } catch (error) { console.error("Error al enviar:", error); }
    };

    // --- RENDERIZADO CONDICIONAL ---

    const ChatContent = (
    <div className="d-flex flex-column h-100 bg-white shadow-sm border rounded-4 overflow-hidden">
        
        {/* MODIFICACIÓN: Solo mostrar el header si es PopUp (Vista Lector) */}
        {esPopUp && (
            <div className="p-3 bg-info-booked text-white d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    <div className="bg-success rounded-circle me-2 border border-white" style={{ width: '10px', height: '10px' }}></div>
                    <span className="fw-bold small">Soporte {nombreEditorial || "Editorial"} </span>
                </div>
                <button className="btn-close btn-close-white" onClick={() => setEstaAbierto(false)}></button>
            </div>
        )}

            <div className="flex-grow-1 p-3 d-flex flex-column" style={{ overflowY: "auto", minHeight: "300px" }} ref={scrollRef}>
                {mensajes.map((m) => {
                    const esMio = m.tipo_emisor === tipoUsuario;
                    const fotoMostrar = m.tipo_emisor === "lector" ? m.foto_lector : m.foto_editorial;
                    return (
                        <div key={m.id} className={`d-flex align-items-end mb-3 ${esMio ? "flex-row-reverse" : "flex-row"}`}>
                            <img
                                src={fotoMostrar || `https://ui-avatars.com/api/?name=${m.tipo_emisor}`}
                                alt="Perfil"
                                className="rounded-circle shadow-sm"
                                style={{ width: "32px", height: "32px", objectFit: "cover", margin: "0 8px" }}
                            />
                            <div className={`msg-bubble ${esMio ? "msg-sent" : "msg-received"}`} style={{ maxWidth: "75%", fontSize: '0.9rem' }}>
                                <div>{m.contenido}</div>
                                <div className="text-end mt-1" style={{ fontSize: "0.6rem", opacity: 0.7 }}>
                                    {m.fecha_envio?.split(" ")[1]?.substring(0, 5)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-3 border-top bg-light">
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control border-0 shadow-none"
                        placeholder="Escribe un mensaje..."
                        value={nuevoMensaje}
                        onChange={(e) => setNuevoMensaje(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
                    />
                    <button className="btn btn-info-booked text-white" onClick={enviarMensaje}>
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    );

    if (esPopUp) {
        return (
            <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
                {estaAbierto && (
                    <div style={{ width: '350px', height: '450px', marginBottom: '15px' }}>
                        {ChatContent}
                    </div>
                )}
                <button
                    className="btn btn-booked-blue rounded-circle shadow-lg d-flex align-items-center justify-content-center"
                    style={{ width: '60px', height: '60px', color: 'white' }}
                    onClick={() => setEstaAbierto(!estaAbierto)}
                >
                    {estaAbierto ? <i className="fas fa-times fs-4"></i> : <i className="fas fa-comment-dots fs-3"></i>}
                </button>
            </div>
        );
    }

    return (
    <div style={{ height: '673px', display: 'flex', flexDirection: 'column' }}>
        {ChatContent}
    </div>
);
};

export default Chat;
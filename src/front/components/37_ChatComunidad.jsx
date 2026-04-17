import React, { useEffect, useState, useRef, useCallback } from "react";

const ChatComunidad = ({ emisorId, receptorId, nombreReceptor, esPopUp = false }) => {
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState("");
    const scrollRef = useRef(null);

    const obtenerMensajes = useCallback(async () => {
        const token = localStorage.getItem("token_lector");
        if (!token || !receptorId) return;
        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
            // IMPORTANTE: Ruta de la nueva tabla comunidad
            const response = await fetch(`${baseUrl}/api/chat/comunidad/${emisorId}/${receptorId}`, {
                headers: { "Authorization": `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setMensajes(data);
            }
        } catch (error) { console.error("Error comunidad:", error); }
    }, [emisorId, receptorId]);

    useEffect(() => { obtenerMensajes(); }, [obtenerMensajes]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [mensajes]);

    const enviarMensaje = async () => {
        if (!nuevoMensaje.trim()) return;
        const token = localStorage.getItem("token_lector");
        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
            const response = await fetch(`${baseUrl}/api/chat/comunidad/enviar`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ contenido: nuevoMensaje, receptor_id: receptorId }),
            });
            if (response.ok) {
                setNuevoMensaje("");
                obtenerMensajes();
            }
        } catch (error) { console.error("Error al enviar:", error); }
    };

    return (
        <div className="d-flex flex-column h-100 bg-white shadow-sm border rounded-4 overflow-hidden">
            <div className="flex-grow-1 p-3 d-flex flex-column" style={{ overflowY: "auto", minHeight: "350px" }} ref={scrollRef}>
                {mensajes.map((m) => {
                    const esMio = m.emisor_id === Number(emisorId);
                    return (
                        <div key={m.id} className={`d-flex align-items-end mb-3 ${esMio ? "flex-row-reverse" : "flex-row"}`}>
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
                        className="form-control border-0 shadow-none bg-white"
                        placeholder="Escribe a tu amigo..."
                        value={nuevoMensaje}
                        onChange={(e) => setNuevoMensaje(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
                    />
                    <button className="btn bg-info-booked text-white px-3" onClick={enviarMensaje}>
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatComunidad;
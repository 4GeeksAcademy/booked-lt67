import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import ChatComunidad from "../components/37_ChatComunidad";

const DmLector = () => {
    const { store } = useGlobalReducer();
    const [amigos, setAmigos] = useState([]);
    const [amigoSeleccionado, setAmigoSeleccionado] = useState(null);

    // 1. Cargar la lista de personas con las que tienes chats
    useEffect(() => {
    const cargarContactos = async () => {
        const token = localStorage.getItem("token_lector");
        const miId = store.lector_id || localStorage.getItem("lector_id"); // Tu ID
        
        const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
        const response = await fetch(`${baseUrl}/api/mis-contactos-comunidad`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            // FILTRO: Solo dejamos a los que NO tengan mi ID
            const soloAmigos = data.filter(amigo => Number(amigo.id) !== Number(miId));
            setAmigos(soloAmigos);
        }
    };
    cargarContactos();
}, [store.lector_id]);

    return (
        <div className="container-fluid mt-4" style={{ height: '85vh' }}>
            <div className="row h-100 shadow rounded-4 overflow-hidden bg-white border">
                
                {/* COLUMNA IZQUIERDA: Lista de Amigos */}
                <div className="col-md-4 border-end p-0 bg-light">
                    <div className="p-3 bg-white border-bottom">
                        <h5 className="fw-bold mb-0">Mensajes de Comunidad</h5>
                    </div>
                    <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: 'calc(85vh - 60px)' }}>
                        {amigos.length > 0 ? amigos.map(amigo => (
                            <button
                                key={amigo.id}
                                onClick={() => setAmigoSeleccionado(amigo)}
                                className={`list-group-item list-group-item-action p-3 border-0 ${amigoSeleccionado?.id === amigo.id ? "bg-info-booked text-white" : ""}`}
                            >
                                <div className="d-flex align-items-center">
                                    <img 
                                        src={amigo.foto_url || "https://ui-avatars.com/api/?name=" + amigo.nombre} 
                                        className="rounded-circle me-3" 
                                        style={{ width: "45px", height: "45px", objectFit: "cover" }}
                                    />
                                    <div>
                                        <p className="mb-0 fw-bold">{amigo.nombre} {amigo.apellido}</p>
                                        <small className={amigoSeleccionado?.id === amigo.id ? "text-white-50" : "text-muted"}>
                                            Ver mensajes...
                                        </small>
                                    </div>
                                </div>
                            </button>
                        )) : (
                            <div className="p-4 text-center text-muted">Aún no tienes conversaciones.</div>
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA: El Chat Abierto */}
                <div className="col-md-8 p-0 d-flex flex-column bg-white">
                    {amigoSeleccionado ? (
                        <ChatComunidad
                            emisorId={store.lector_id || localStorage.getItem("lector_id")}
                            receptorId={amigoSeleccionado.id}
                            nombreReceptor={amigoSeleccionado.nombre}
                            esPopUp={false} // <--- INTEGRADO
                        />
                    ) : (
                        <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                            <i className="fas fa-comments mb-3" style={{ fontSize: "4rem", opacity: 0.2 }}></i>
                            <p>Selecciona un amigo para comenzar a chatear</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DmLector;
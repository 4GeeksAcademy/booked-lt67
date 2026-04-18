import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import ChatComunidad from "../components/37_ChatComunidad";

// RECIBIMOS las props del padre (PaginaLector)
const DmLector = ({ amigoForzado, setAmigoForzado }) => { 
    const { store } = useGlobalReducer();
    const [amigos, setAmigos] = useState([]);
    const [amigoSeleccionado, setAmigoSeleccionado] = useState(null);

    // UNIFICAMOS TODO EN UN SOLO EFECTO
   useEffect(() => {
    const cargarTodo = async () => {
        const token = localStorage.getItem("token_lector");
        const miId = store.lector_id || localStorage.getItem("lector_id");
        const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
        
        const response = await fetch(`${baseUrl}/api/mis-contactos-comunidad`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();git p
            const listaServidor = data.filter(amigo => Number(amigo.id) !== Number(miId));

            // Si hay un amigo forzado, lo metemos en la lista SI O SI
            if (amigoForzado && amigoForzado.id) {
                const existe = listaServidor.find(a => Number(a.id) === Number(amigoForzado.id));
                
                if (!existe) {
                    setAmigos([amigoForzado, ...listaServidor]);
                } else {
                    setAmigos(listaServidor);
                }
                // Lo seleccionamos
                setAmigoSeleccionado(amigoForzado);
            } else {
                // Si no hay amigo forzado, carga normal
                setAmigos(listaServidor);
            }
        }
    };

    cargarTodo();
    // NOTA: Quitamos el setAmigoForzado(null) de aquí para que no 
    // provoque un re-render que borre al usuario antes de escribir.
}, [amigoForzado, store.lector_id]);

    return (
        <div className="container-fluid mt-4" style={{ height: '85vh' }}>
            <div className="row h-100 shadow rounded-4 overflow-hidden bg-white border">
                
                {/* COLUMNA IZQUIERDA: Lista de Amigos */}
                <div className="col-md-4 border-end p-0 bg-light">
                    <div className="p-3 bg-white border-bottom">
                        <h5 className="fw-bold mb-0">Conversaciones</h5>
                    </div>
                    <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: 'calc(85vh - 60px)' }}>
                        {amigos.length > 0 ? amigos.map(amigo => (
                            <button
                                key={amigo.id}
                                onClick={() => setAmigoSeleccionado(amigo)}
                                className={`list-group-item list-group-item-action p-3 border-0 ${amigoSeleccionado?.id === amigo.id ? "bg-info-booked text-white shadow-sm" : ""}`}
                                style={{ transition: 'all 0.2s' }}
                            >
                                <div className="d-flex align-items-center">
                                    <img 
                                        src={amigo.foto_url || "https://ui-avatars.com/api/?name=" + (amigo.nombre || "User")} 
                                        className="rounded-circle me-3" 
                                        style={{ width: "45px", height: "45px", objectFit: "cover", border: "2px solid white" }}
                                    />
                                    <div className="text-truncate">
                                        <p className="mb-0 fw-bold">{amigo.nombre} {amigo.apellido || ""}</p>
                                        <small className={amigoSeleccionado?.id === amigo.id ? "text-white-50" : "text-muted"}>
                                            Chatea con {amigo.nombre}...
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
                            esPopUp={false}
                        />
                    ) : (
                        <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted p-5 text-center">
                            <i className="fas fa-comments mb-3" style={{ fontSize: "4rem", opacity: 0.1 }}></i>
                            <h5>Tu bandeja de entrada</h5>
                            <p className="small">Selecciona a un lector de la lista para ver la conversación o inicia una nueva desde "Mi Red".</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DmLector;
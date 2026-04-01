import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const BotonSeguirComunidad = ({ onFollowSuccess, siguiendoActualmente }) => {
    const { store } = useGlobalReducer();
    const [lectores, setLectores] = useState([]);
    const [seguidoId, setSeguidoId] = useState("");
    const [mensaje, setMensaje] = useState("");

    const seguidorId = store.id_lector || store.lector_id;

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}api/lector`)
            .then(res => res.json())
            .then(data => {
                const otrosLectores = data.filter(l => {
                    const soyYo = l.id === parseInt(seguidorId);
                    const yaLoSigo = siguiendoActualmente?.some(s => s.seguido_id === l.id);
                    return !soyYo && !yaLoSigo;
                });
                setLectores(otrosLectores);
            })
            .catch(err => console.error("Error al cargar lectores:", err));
    }, [seguidorId, siguiendoActualmente]);

    const guardarRelacion = (e) => {
        e.preventDefault();

        if (!seguidoId) {
            setMensaje("Selecciona a alguien para seguir");
            return;
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "seguidor_id": parseInt(seguidorId),
                "seguido_id": parseInt(seguidoId)
            })
        };

        fetch(`${import.meta.env.VITE_BACKEND_URL}api/follow`, requestOptions)
            .then(response => {
                if (response.status === 400) throw new Error("Ya sigues a este lector");
                if (!response.ok) throw new Error("Error al procesar el seguimiento");
                return response.json();
            })
            .then(() => {
                setMensaje("");
                setSeguidoId("");
                alert("¡Ahora sigues a un nuevo lector!");
                if (onFollowSuccess) onFollowSuccess(); 
            })
            .catch(error => setMensaje(error.message));
    };

    return (
        <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
                <h6 className="card-title fw-bold">Seguir a alguien nuevo</h6>
                {mensaje && <div className="alert alert-warning py-1 small">{mensaje}</div>}
                <form onSubmit={guardarRelacion} className="d-flex gap-2">
                    <select 
                        className="form-select form-select-sm" 
                        value={seguidoId} 
                        onChange={e => setSeguidoId(e.target.value)}
                    >
                        <option value="">Elegir lector...</option>
                        {lectores.map(l => (
                            <option key={l.id} value={l.id}>{l.username}</option>
                        ))}
                    </select>
                    <button type="submit" className="btn btn-primary btn-sm">Seguir</button>
                </form>
            </div>
        </div>
    );
};

export default BotonSeguirComunidad;
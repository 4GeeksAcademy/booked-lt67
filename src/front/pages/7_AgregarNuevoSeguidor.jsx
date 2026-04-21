import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer";

const AgregarNuevoSeguidor = () => {
    const navigate = useNavigate();

    // --- 1. Definimos la base limpia para los fetches del archivo ---
    const API_BASE = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "") + "/api";

    const [lectores, setLectores] = useState([]);
    const [seguidorId, setSeguidorId] = useState(""); 
    const [seguidoId, setSeguidoId] = useState("");    
    const [mensaje, setMensaje] = useState("");

    const { store } = useGlobalReducer();
        
    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }

    // --- 2. GET Lectores blindado para llenar ambos Selects ---
    useEffect(() => {
        fetch(`${API_BASE}/lector`)
            .then(res => {
                if (!res.ok) throw new Error("Error al cargar lectores");
                return res.json();
            })
            .then(data => setLectores(data))
            .catch(err => console.error("Error:", err));
    }, [API_BASE]);

    const guardarRelacion = (e) => {
        e.preventDefault();

        if (!seguidorId || !seguidoId) {
            setMensaje("Debes seleccionar ambos lectores");
            return;
        }

        if (seguidorId === seguidoId) {
            setMensaje("El lector no puede seguirse a sí mismo");
            return;
        }

        // Lógica de validación local
        const lectorActual = lectores.find(l => l.id === parseInt(seguidorId));
        const yaLoSigue = lectorActual?.siguiendo?.some(relacion => relacion.seguido_id === parseInt(seguidoId));
        
        if (yaLoSigue) {
            setMensaje("Ya estos lectores se siguen");
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

        // --- 3. POST de seguimiento blindado ---
        fetch(`${API_BASE}/follow`, requestOptions)
            .then(response => {
                if (response.status === 400) throw new Error("Ya existe esa relación");
                if (!response.ok) throw new Error("Error al procesar el seguimiento");
                return response.json();
            })
            .then(() => {
                alert("¡Relación creada!");
                navigate("/ver_seguidores"); 
            })
            .catch(error => setMensaje(error.message));
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4 text-center">Agregar Seguidor</h2>
            <div className="card p-4 shadow mx-auto" style={{maxWidth: "600px"}}>
                {mensaje && <div className="alert alert-warning">{mensaje}</div>}
                <form onSubmit={guardarRelacion}>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Usuario que va a seguir:</label>
                        <select className="form-select" value={seguidorId} onChange={e => setSeguidorId(e.target.value)}>
                            <option value="">-- Lectores --</option>
                            {lectores.map(l => <option key={l.id} value={l.id}>{l.nombre} ({l.username})</option>)}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-bold">Usuario a quien seguirá:</label>
                        <select className="form-select" value={seguidoId} onChange={e => setSeguidoId(e.target.value)}>
                            <option value="">-- Lectores --</option>
                            {lectores.map(l => <option key={l.id} value={l.id}>{l.nombre} ({l.username})</option>)}
                        </select>
                    </div>
                    <div className="d-grid gap-2">
                        <button type="submit" className="btn btn-primary">Seguir</button>
                        <Link to="/ver_seguidores" className="btn btn-outline-secondary">Volver a la Tabla</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AgregarNuevoSeguidor;
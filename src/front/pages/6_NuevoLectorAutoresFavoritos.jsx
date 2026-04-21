import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer";

const NuevoLectorAutoresFavoritos = () => {
    const navigate = useNavigate();

    // --- 1. Definimos la base limpia para evitar el error .comapi ---
    const API_BASE = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "") + "/api";

    const [lectorId, setLectorId] = useState("");
    const [autorId, setAutorId] = useState("");

    const [lectores, setLectores] = useState([]);
    const [autores, setAutores] = useState([]);
    
    const { store } = useGlobalReducer();
    
    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }

    useEffect(() => {
        // --- 2. GET Lectores blindado ---
        fetch(`${API_BASE}/lector`)
            .then(response => response.json())
            .then(data => setLectores(data))
            .catch(err => console.error("Error cargando lectores:", err));

        // --- 3. GET Autores blindado ---
        fetch(`${API_BASE}/autor`)
            .then(response => response.json())
            .then(data => setAutores(data))
            .catch(err => console.error("Error cargando autores:", err));
    }, [API_BASE]);
    
    function sendData(e){
        e.preventDefault();

        if (!lectorId || !autorId) {
            alert("Por favor, selecciona un lector y un autor.");
            return;
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "lector_id": parseInt(lectorId),
                "autor_id": parseInt(autorId),
            })
        };

        // --- 4. POST Final blindado ---
        fetch(`${API_BASE}/lector_autores_favoritos`, requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("Error al crear la relación de favorito");
                return response.json();
            })
            .then(data => {
                console.log("Relación creada:", data);
                navigate("/lector_autores_favoritos");
            })
            .catch(err => console.error("Error en sendData:", err));
    }
    
    return (
        <div className="container mt-5">
            <h2>Agregar Autor Favorito a Lector</h2>
            <form onSubmit={sendData} className="col-md-6">

                <div className="mb-3">
                    <label className="form-label">Lector</label>
                    <select className="form-control" value={lectorId} onChange={(e) => setLectorId(e.target.value)}>
                        <option value="">Selecciona un lector</option>
                        {lectores.map(l => (
                            <option key={l.id} value={l.id}>
                                {l.nombre} {l.apellido}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Autor</label>
                    <select className="form-control" value={autorId} onChange={(e) => setAutorId(e.target.value)}>
                        <option value="">Selecciona un autor</option>
                        {autores.map(a => (<option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>))}
                    </select>
                </div>

                <button type="submit" className="btn btn-primary">Crear Favorito</button>
            </form>
        </div>
    );  
};

export default NuevoLectorAutoresFavoritos;

import React, { useEffect, useState } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const EditarLectorAutoresFavoritos = () => {
    const { theId } = useParams();
    const navigate = useNavigate();

    // --- 1. Definimos la base limpia para los 4 fetches ---
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
        // --- 2. GET Datos de la relación específica ---
        fetch(`${API_BASE}/lector_autores_favoritos/${theId}`)
            .then(res => res.json())
            .then(data => {
                setAutorId(data.autor_id || "");
                setLectorId(data.lector_id || "");
            })
            .catch(err => console.error("Error cargando favorito:", err));

        // --- 3. GET Lectores (para el Select) ---
        fetch(`${API_BASE}/lector`)
            .then(res => res.json())
            .then(data => setLectores(data))
            .catch(err => console.error("Error cargando lectores:", err));

        // --- 4. GET Autores (para el Select) ---
        fetch(`${API_BASE}/autor`)
            .then(res => res.json())
            .then(data => setAutores(data))
            .catch(err => console.error("Error cargando autores:", err));

    }, [theId, API_BASE]);


    const updateData = (e) => {
        e.preventDefault();

        if (!lectorId || !autorId) {
            alert("Debes seleccionar lector y autor");
            return;
        }

        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "autor_id": parseInt(autorId),
                "lector_id": parseInt(lectorId),
            })
        };

        // --- 5. PUT de actualización blindado ---
        fetch(`${API_BASE}/lector_autores_favoritos/${theId}`, requestOptions)
            .then(response => {
                if (response.ok) {
                    alert("¡Actualizado con éxito!");
                    navigate("/lector_autores_favoritos");
                } else {
                    throw new Error("Error al actualizar la relación");
                }
            })
            .catch(err => alert(err.message));
    };

    return (
        <div className="container mt-5">
            <h2>Editar LectorAutorFavorito #{theId}</h2>

            <form onSubmit={updateData} className="col-md-6 border p-4 shadow-sm">

                <div className="mb-3">
                    <label className="form-label">Autor</label>
                    <select
                        className="form-control"
                        value={autorId}
                        onChange={(e) => setAutorId(e.target.value)}
                    >
                        <option value="">Selecciona un autor</option>
                        {autores.map(a => (
                            <option key={a.id} value={a.id}>
                                {a.nombre} {a.apellido}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Lector</label>
                    <select className="form-control" value={lectorId} onChange={(e) => setLectorId(e.target.value)}>
                        <option value="">Selecciona un lector</option>
                        {lectores.map(l => (<option key={l.id} value={l.id}>{l.nombre} {l.apellido}</option>))}
                    </select>
                </div>

                <button type="submit" className="btn btn-success me-2">
                    Actualizar
                </button>
            </form>
        </div>
    );
};

export default EditarLectorAutoresFavoritos;

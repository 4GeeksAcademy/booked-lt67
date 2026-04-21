import React, { useEffect, useState } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const EditarLibroFavorito = () => {
    const { lectorId, favId } = useParams();
    const navigate = useNavigate();

    // --- 1. Definimos la base limpia para los fetches del archivo ---
    const API_BASE = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "") + "/api";

    const [libros, setLibros] = useState([]);
    const [libroSeleccionado, setLibroSeleccionado] = useState("");
    const { store } = useGlobalReducer();

    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }

    useEffect(() => {
        // --- 2. GET Libros (para el Select) blindado ---
        fetch(`${API_BASE}/libro`)
            .then(res => {
                if (!res.ok) throw new Error("Error al cargar libros");
                return res.json();
            })
            .then(data => setLibros(data))
            .catch(err => console.error(err));
    }, [API_BASE]);

    const actualizarLibroFavorito = (e) => {
        e.preventDefault();

        if (!libroSeleccionado) {
            alert("Por favor, selecciona un libro.");
            return;
        }

        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "lector_id": parseInt(lectorId),
                "libro_id": parseInt(libroSeleccionado)
            })
        };

        // --- 3. PUT de actualización blindado ---
        // Usamos favId para identificar la relación específica
        fetch(`${API_BASE}/favoritos/libros/${favId}`, requestOptions)
            .then(response => {
                if (!response.ok) throw new Error("No se pudo actualizar el favorito");
                return response.json();
            })
            .then(() => {
                alert("Favorito actualizado correctamente");
                navigate(`/lector/${lectorId}/favoritos`);
            })
            .catch(err => alert(err.message));
    };

    return (
        <div className="container mt-5">
            <h2>Cambiar Libro Favorito</h2>
            <div className="card p-4 shadow-sm col-md-6">
                {mensaje && <div className="alert alert-danger">{mensaje}</div>}
                <form onSubmit={actualizarLibroFavorito}>
                    <label className="form-label">Elige el nuevo libro para este espacio:</label>
                    <select
                        className="form-select mb-3"
                        value={libroSeleccionado}
                        onChange={(e) => setLibroSeleccionado(e.target.value)}
                    >
                        <option value="">-- Seleccionar libro --</option>
                        {libros.map(l => (
                            <option key={l.id} value={l.id}>{l.nombre}</option>
                        ))}
                    </select>
                    <button type="submit" className="btn btn-warning me-2">Actualizar</button>
                    <Link to={`/lector/${lectorId}/favoritos`} className="btn btn-secondary">Cancelar</Link>
                </form>
            </div>
        </div>
    );
};

export default EditarLibroFavorito;
import React, { useEffect, useState } from "react";
import { Link, Navigate, useParams, useNavigate  } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const AgregarLibroFavorito = () => {
    const { lectorId } = useParams();
    const navigate = useNavigate();

    // --- 1. Definimos la base limpia para evitar el error .comapi ---
    const API_BASE = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "") + "/api";

    const [libros, setLibros] = useState([]);
    const [libroSeleccionado, setLibroSeleccionado] = useState("");
    const [mensaje, setMensaje] = useState("");

    const { store } = useGlobalReducer();
        
    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }

    // --- 2. GET Libros blindado para el Select ---
    useEffect(() => {
        fetch(`${API_BASE}/libro`)
            .then(res => {
                if (!res.ok) throw new Error("No se pudieron cargar los libros");
                return res.json();
            })
            .then(data => setLibros(data))
            .catch(err => console.error("Error cargando libros:", err));
    }, [API_BASE]);


    const guardarLibroFavorito = (e) => {
        e.preventDefault();

        if (!libroSeleccionado) {
            setMensaje("Por favor, selecciona un libro");
            return;
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "lector_id": parseInt(lectorId),
                "libro_id": parseInt(libroSeleccionado)
            })
        };

        // --- 3. POST de creación blindado ---
        fetch(`${API_BASE}/favoritos/libros`, requestOptions)
            .then(response => {
                if (response.status === 400) {
                    throw new Error("Este libro ya está en los favoritos de este lector");
                }
                if (!response.ok) throw new Error("Error al guardar el favorito");
                return response.json();
            })
            .then(() => {
                alert("¡Libro añadido a favoritos!");
                navigate(`/lector/${lectorId}/favoritos`);
            })
            .catch(error => setMensaje(error.message));
    };

    return (
        <div className="container mt-5">
            <h2>Añadir Libro a Favoritos</h2>
            <div className="card p-4 shadow-sm col-md-6">
                {mensaje && <div className="alert alert-danger">{mensaje}</div>}

                <form onSubmit={guardarLibroFavorito}>
                    <div className="mb-3">
                        <label className="form-label">Selecciona un Libro</label>
                        <select className="form-select" value={libroSeleccionado} onChange={(e) => setLibroSeleccionado(e.target.value)}>
                            <option value="">-- Elige un libro de la biblioteca --</option>
                            {libros.map(libro => (
                                <option key={libro.id} value={libro.id}>
                                    {libro.nombre} ({libro.nombre_autor})
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-success me-2">Guardar en Favoritos</button>
                    <Link to={`/lector/${lectorId}/favoritos`} className="btn btn-secondary">Cancelar</Link>
                </form>
            </div>
        </div>
    );
};


export default AgregarLibroFavorito
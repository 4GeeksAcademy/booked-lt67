import React, { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const LibrosFavoritos = () => {
    const { lectorId } = useParams();
    const [librosFavoritos, setLibrosFavoritos] = useState([]);
    const { store } = useGlobalReducer();

    // --- 1. Definimos la base limpia para las rutas de favoritos ---
    const API_BASE = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "") + "/api";

    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }

    // --- 2. GET Favoritos blindado ---
    function getLibrosFavoritos() {
        // Usamos la plantilla literal para evitar el error de concatenación
        fetch(`${API_BASE}/lector/${lectorId}/favoritos`)
            .then((response) => response.json())
            .then((data) => {
                if (Array.isArray(data)) setLibrosFavoritos(data);
                else setLibrosFavoritos([]);
            })
            .catch(err => console.error("Error cargando favoritos:", err));
    }

    useEffect(() => {
        getLibrosFavoritos();
    }, [lectorId]); // Añadimos lectorId por si cambia el parámetro

    // --- 3. DELETE Favorito blindado ---
    function deleteLibroFavorito(idToDelete) {
        if (!window.confirm("¿Quitar este libro de favoritos?")) return;

        const requestOptions = {
            method: "DELETE",
            redirect: "follow"
        };

        // Ruta compleja: /api/favoritos/libros/ID_LECTOR/ID_LIBRO
        fetch(`${API_BASE}/favoritos/libros/${lectorId}/${idToDelete}`, requestOptions)
            .then((response) => {
                if (response.ok) {
                    console.log("Favorito eliminado");
                    getLibrosFavoritos();
                } else {
                    throw new Error("No se pudo eliminar el favorito");
                }
            })
            .catch(error => console.error("Error al eliminar favorito:", error));
    }
    
    return (
        <>
            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1>Libros Favoritos</h1>
                    <Link to={`/lector/${lectorId}/favoritos/agregar`} className="btn btn-success me-2">Añadir Nuevo Libro Favorito</Link>
                    <Link to="/lector" className="btn btn-primary">Volver a Lector</Link>
                </div>
                <div className="row g-4">
                    {librosFavoritos.map((fav) => (
                        <div className="col-md-4" key={fav.id}>
                            <div className="card p-3 shadow-sm">
                                <h5 className="mb-3">{fav.libro?.nombre || "Sin título"}</h5>
                                <div className="d-flex flex-wrap gap-2">
                                    <Link to={"/ver_libro/" + fav.libro?.id} className="btn btn-sm btn-outline-primary">Ver</Link>
                                    <Link to={`/lector/${lectorId}/favoritos/editar/${fav.id}`} className="btn btn-sm btn-outline-warning">Editar</Link>
                                    <button onClick={() => deleteLibroFavorito(fav.libro?.id)} className="btn btn-sm btn-danger">Eliminar</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="d-flex justify-content-center">
                    <Link to={"/admin_home/"} className="m-3 btn btn-sm btn-outline-primary">Volver al Dashboard</Link>
                </div>
            </div>
        </>
    )
}

export default LibrosFavoritos
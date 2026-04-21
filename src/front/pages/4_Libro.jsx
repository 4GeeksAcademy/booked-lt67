import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer";

const Libro = () => {
    const [libros, setLibros] = useState([])
    const { store } = useGlobalReducer()

    // --- 1. Blindamos la base de la API ---
    const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "") + "/api";

    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }

    // --- 2. GET Libros blindado ---
    function getLibros() {
        fetch(`${API_URL}/libro/`)
            .then((response) => {
                if (!response.ok) throw new Error("Error al obtener libros");
                return response.json();
            })
            .then((data) => setLibros(data))
            .catch(error => console.error("Error en getLibros:", error));
    }

    useEffect(() => {
        getLibros()
    }, [])

    // --- 3. DELETE Libro blindado ---
    function deletelibro(idToDelete) {
        if (!window.confirm("¿Seguro que deseas eliminar este libro? Esta acción no se puede deshacer.")) return;
        
        const requestOptions = {
            method: "DELETE",
            redirect: "follow"
        };

        fetch(`${API_URL}/libro/${idToDelete}`, requestOptions)
            .then((response) => {
                if (response.ok) {
                    getLibros(); // Refrescamos la lista
                } else {
                    throw new Error("No se pudo eliminar el libro");
                }
            })
            .catch(error => console.error("Error al eliminar:", error));
    }

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="fw-bold">Gestión de Biblioteca</h1>
                <Link to="/nuevo_libro" className="btn btn-primary rounded-pill btn-sm d-flex align-items-center">
                    <i className="fas fa-plus-circle me-2"></i>Nuevo Libro
                </Link>
            </div>

            <div className="row g-4">
                {libros.map((libro) => {
                    // Placeholder para portadas si no hay imagen
                    const portadaFinal = libro.image_url || `https://via.placeholder.com/300x450?text=${encodeURIComponent(libro.nombre)}`;

                    return (
                        <div className="col-md-6 col-lg-4 col-xl-3" key={libro.id}>
                            <div className="card h-100 shadow-sm border-0 overflow-hidden">
                                <div className="position-relative" style={{ height: "250px" }}>
                                    <img
                                        src={portadaFinal}
                                        alt={libro.nombre}
                                        className="card-img-top w-100 h-100"
                                        style={{ objectFit: "cover" }}
                                    />
                                    {/* Badge si el autor del libro está verificado (opcional si lo tienes en el JSON) */}
                                    {libro.autor?.is_verified && (
                                        <span className="position-absolute top-0 end-0 m-2 badge bg-primary">
                                            Oficial
                                        </span>
                                    )}
                                </div>
                                
                                <div className="card-body d-flex flex-column">
                                    <h6 className="fw-bold mb-1 text-truncate" title={libro.nombre}>
                                        {libro.nombre}
                                    </h6>
                                    <p className="text-muted small mb-3">
                                        <i className="fas fa-pen-nib me-1"></i>
                                        {libro.autor_nombre || "Autor desconocido"}
                                    </p>

                                    <div className="d-flex justify-content-between gap-2 mt-auto">
                                        <div className="d-flex gap-1">
                                            <Link to={"/ver_libro/" + libro.id} className="btn btn-sm btn-light text-primary" title="Ver">
                                                <i className="fas fa-eye"></i>
                                            </Link>
                                            <Link to={"/editar_libro/" + libro.id} className="btn btn-sm btn-light text-warning" title="Editar">
                                                <i className="fas fa-edit"></i>
                                            </Link>
                                        </div>
                                        <button onClick={() => deletelibro(libro.id)} className="btn btn-sm btn-light text-danger" title="Eliminar">
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="text-center mt-5 mb-5">
                <Link to="/admin_home/" className="btn btn-link text-secondary text-decoration-none">
                    <i className="fas fa-chevron-left me-2"></i>Volver al Dashboard
                </Link>
            </div>
        </div>
    )
}

export default Libro;
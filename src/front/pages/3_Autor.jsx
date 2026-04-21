import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer";

const Autor = () => {
    const [autores, setautores] = useState([])
    const { store } = useGlobalReducer()

    // --- 1. Definimos la base limpia una sola vez ---
    const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "") + "/api";

    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }

    // --- 2. GET Autores con URL blindada ---
    function getAutores() {
        fetch(`${API_URL}/autor/`)
            .then((response) => response.json())
            .then((data) => setautores(data))
            .catch(error => console.error("Error cargando autores:", error));
    }

    useEffect(() => {
        getAutores()
    }, [])

    // --- 3. DELETE Autor con URL blindada ---
    function deleteautor(idToDelete) {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este autor?")) return;
        
        const requestOptions = {
            method: "DELETE",
            redirect: "follow"
        };

        fetch(`${API_URL}/autor/${idToDelete}`, requestOptions)
            .then((response) => {
                if (response.ok) {
                    getAutores(); // Refrescamos la lista tras eliminar
                } else {
                    throw new Error("No se pudo eliminar el autor");
                }
            })
            .catch(error => console.error("Error al eliminar:", error));
    }

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="fw-bold">Gestión de Autores</h1>
                <Link to="/nuevo_autor" className="btn btn-primary rounded-pill">
                    <i className="fas fa-plus me-2"></i>Nuevo autor
                </Link>
            </div>

            <div className="row g-4">
                {autores.map((autor) => {
                    // Lógica de imagen para cada autor en el map
                    const nombreCompleto = `${autor.nombre} ${autor.apellido || ""}`;
                    const imagenFinal = autor.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&background=random&color=fff`;

                    return (
                        <div className="col-md-4 col-lg-3" key={autor.id}>
                            <div className="card h-100 shadow-sm border-0 text-center p-3">
                                <div className="position-relative mb-3">
                                    <img
                                        src={imagenFinal}
                                        alt={nombreCompleto}
                                        className="rounded-circle border shadow-sm mx-auto"
                                        style={{ width: "100px", height: "100px", objectFit: "cover" }}
                                    />
                                    {autor.is_verified && (
                                        <span 
                                            className="position-absolute translate-middle badge rounded-pill bg-primary"
                                            style={{ top: "85%", left: "65%", border: "2px white solid" }}
                                            title="Verificado"
                                        >
                                            ✓
                                        </span>
                                    )}
                                </div>

                                <h5 className="mb-1 text-truncate" title={nombreCompleto}>
                                    {autor.nombre} {autor.apellido}
                                </h5>
                                <p className="text-muted small mb-3">{autor.pais || "Sin país"}</p>

                                <div className="d-flex justify-content-center gap-2 mt-auto">
                                    <Link to={"/ver_autor/" + autor.id} className="btn btn-sm btn-light text-primary" title="Ver detalles">
                                        <i className="fas fa-eye"></i>
                                    </Link>
                                    <Link to={"/editar_autor/" + autor.id} className="btn btn-sm btn-light text-warning" title="Editar">
                                        <i className="fas fa-edit"></i>
                                    </Link>
                                    <button onClick={() => deleteautor(autor.id)} className="btn btn-sm btn-light text-danger" title="Eliminar">
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="text-center mt-5">
                <Link to="/admin_home/" className="btn btn-link text-secondary text-decoration-none">
                    <i className="fas fa-chevron-left me-2"></i>Volver al Dashboard
                </Link>
            </div>
        </div>
    )
}

export default Autor
import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer";

const Editorial = () => {
    const [editoriales, setEditoriales] = useState([])
    const { store } = useGlobalReducer()

    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }

    function getEditoriales() {
        fetch(import.meta.env.VITE_BACKEND_URL + "api/editorial/")
            .then((response) => response.json())
            .then((data) => setEditoriales(data))
    }

    useEffect(() => {
        getEditoriales()
    }, [])

    function deleteEditorial(idToDelete) {
        if (!window.confirm("¿Estás seguro? Se eliminarán también los libros y posts vinculados.")) return;
        
        const requestOptions = {
            method: "DELETE",
            redirect: "follow"
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/editorial/" + idToDelete, requestOptions)
            .then((response) => response.text())
            .then(() => getEditoriales())
            .catch(error => console.error("Error al eliminar:", error));
    }

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="fw-bold">Gestión de Editoriales</h1>
                <div className="d-flex gap-2">
                    <Link to="/all_post_editorial/" className="btn btn-outline-primary rounded-pill btn-sm">
                        <i className="fas fa-stream me-1"></i> Publicaciones
                    </Link>
                    <Link to="/nueva_editorial" className="btn btn-primary rounded-pill btn-sm">
                        <i className="fas fa-plus me-1"></i> Nueva Editorial
                    </Link>
                </div>
            </div>

            <div className="row g-4">
                {editoriales.map((editorial) => {
                    const nombre = editorial.nombre || "Editorial";
                    const imagenFinal = editorial.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=0D6EFD&color=fff`;

                    return (
                        <div className="col-md-4 col-lg-3" key={editorial.id}>
                            <div className="card h-100 shadow-sm border-0 text-center p-3">
                                <div className="position-relative mb-3">
                                    <img
                                        src={imagenFinal}
                                        alt={nombre}
                                        className="rounded-circle border shadow-sm mx-auto"
                                        style={{ width: "100px", height: "100px", objectFit: "contain", backgroundColor: "#fff" }}
                                    />
                                    {editorial.is_verified && (
                                        <span 
                                            className="position-absolute translate-middle badge rounded-pill bg-primary"
                                            style={{ top: "85%", left: "65%", border: "2px white solid" }}
                                            title="Verificada"
                                        >
                                            ✓
                                        </span>
                                    )}
                                </div>

                                <h5 className="mb-1 text-truncate" title={nombre}>{nombre}</h5>
                                <p className="text-muted small mb-3">{editorial.pais || "Sin país"}</p>

                                <div className="d-flex justify-content-center flex-wrap gap-2 mt-auto">
                                    <Link to={"/ver_editorial/" + editorial.id} className="btn btn-sm btn-light text-primary" title="Ver">
                                        <i className="fas fa-eye"></i>
                                    </Link>
                                    <Link to={"/editar_editorial/" + editorial.id} className="btn btn-sm btn-light text-warning" title="Editar">
                                        <i className="fas fa-edit"></i>
                                    </Link>
                                    <Link to={"/post_editorial/" + editorial.id} className="btn btn-sm btn-light text-info" title="Posts">
                                        <i className="fas fa-file-alt"></i>
                                    </Link>
                                    <button onClick={() => deleteEditorial(editorial.id)} className="btn btn-sm btn-light text-danger" title="Eliminar">
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
                    <i className="fas fa-chevron-left me-2"></i>Dashboard
                </Link>
            </div>
        </div>
    );
};

export default Editorial;
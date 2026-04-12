import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer";

const Lector = () => {
    const { store } = useGlobalReducer()
    const [lectores, setLectores] = useState([])

    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }

    function getLectores() {
        fetch(import.meta.env.VITE_BACKEND_URL + "api/lector/")
            .then((response) => response.json())
            .then((data) => setLectores(data))
    }

    useEffect(() => {
        getLectores()
    }, [])

    function deleteLector(idToDelete) {
        if (!window.confirm("¿Estás seguro de eliminar este lector? Perderá sus favoritos y progreso de lectura.")) return;
        
        const requestOptions = {
            method: "DELETE",
            redirect: "follow"
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/lector/" + idToDelete, requestOptions)
            .then((response) => response.text())
            .then(() => getLectores())
            .catch(error => console.error("Error al eliminar:", error));
    }

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="fw-bold">Gestión de Lectores</h1>
                <Link to="/nuevo_lector" className="btn btn-primary rounded-pill btn-sm d-flex align-items-center">
                    <i className="fas fa-user-plus me-2"></i>Nuevo Lector
                </Link>
            </div>

            <div className="row g-4">
                {lectores.map((lector) => {
                    const nombreCompleto = `${lector.nombre} ${lector.apellido || ""}`;
                    // Usamos foto_url y el color naranja/warning para diferenciar lectores
                    const imagenFinal = lector.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&background=ffc107&color=333`;

                    return (
                        <div className="col-md-4 col-lg-3" key={lector.id}>
                            <div className="card h-100 shadow-sm border-0 text-center p-3">
                                <div className="mb-3">
                                    <img
                                        src={imagenFinal}
                                        alt={nombreCompleto}
                                        className="rounded-circle border shadow-sm mx-auto"
                                        style={{ width: "100px", height: "100px", objectFit: "cover" }}
                                    />
                                </div>

                                <h5 className="mb-1 text-truncate" title={nombreCompleto}>
                                    {lector.nombre} {lector.apellido}
                                </h5>
                                <p className="text-muted small mb-3">
                                    <i className="fas fa-envelope me-1 small"></i> {lector.email}
                                </p>

                                <div className="d-flex justify-content-center gap-2 mt-auto">
                                    <Link to={"/ver_lector/" + lector.id} className="btn btn-sm btn-light text-primary" title="Ver Perfil">
                                        <i className="fas fa-eye"></i>
                                    </Link>
                                    <Link to={"/editar_lector/" + lector.id} className="btn btn-sm btn-light text-warning" title="Editar">
                                        <i className="fas fa-user-edit"></i>
                                    </Link>
                                    <button onClick={() => deleteLector(lector.id)} className="btn btn-sm btn-light text-danger" title="Eliminar">
                                        <i className="fas fa-user-minus"></i>
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

export default Lector
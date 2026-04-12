import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

const VerEditorialFree = () => {
    const { theId } = useParams();
    const [editorial, setEditorial] = useState(null);

    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "api/editorial/" + theId)
            .then(response => response.json())
            .then(data => setEditorial(data))
            .catch(err => console.error("Error al cargar editorial:", err));
    }, [theId]);

    if (editorial === null) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2">Buscando la información de la editorial {theId}...</p>
            </div>
        );
    }

    const nombre = editorial?.nombre || "Editorial";
    const imagenFinal = editorial.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=random&color=fff&size=200`;

    return (
        <div className="container mt-5">
            <div className="card shadow border-0">
                <div className="card-body p-5">
                    <div className="row align-items-center">

                        <div className="col-md-4 text-center mb-4 mb-md-0">
                            <img
                                src={imagenFinal}
                                alt={editorial.nombre}
                                className="rounded-circle shadow-sm border" // <-- Añadimos rounded-circle
                                style={{
                                    width: "200px",
                                    height: "200px",
                                    objectFit: "cover", // 'cover' para que la imagen redonda no se deforme
                                    backgroundColor: "#fff"
                                }}
                            />
                        </div>


                        <div className="col-md-8">
                            <h1 className="display-5 d-flex align-items-center">
                                {editorial.nombre}
                                {editorial.is_verified && (
                                    <span
                                        className="badge rounded-pill bg-primary ms-3 d-flex align-items-center justify-content-center"
                                        style={{ width: "30px", height: "30px", fontSize: "14px" }}
                                        title="Editorial Verificada"
                                    >
                                        ✓
                                    </span>
                                )}
                            </h1>
                            <p className="text-muted mb-4">Sello Editorial</p>

                            <div className="row">
                                <div className="col-sm-6">
                                    <p className="mb-1 text-secondary">Email de Contacto</p>
                                    <p className="fw-bold">{editorial.email || "No disponible"}</p>
                                </div>
                                <div className="col-sm-6">
                                    <p className="mb-1 text-secondary">Sede Principal</p>
                                    <p className="fw-bold">{editorial.pais || "Desconocido"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="my-4" />

                    <div className="d-flex justify-content-between align-items-center">
                        <Link to="/ver_autor_editorial">
                            <button className="btn btn-outline-secondary">
                                <i className="fas fa-arrow-left me-2"></i> Volver a la lista
                            </button>
                        </Link>

                        <div className="text-end">
                            {/* editorial.is_verified ? (
                                <span className="badge bg-success">
                                    <i className="fas fa-check-double me-1"></i> Editorial Oficial
                                </span>
                            ) :  */editorial.verification_status === "pending" && editorial.email ? (
                                    <span className="badge bg-warning text-dark">
                                        <i className="fas fa-clock me-1"></i> Verificación en proceso
                                    </span>
                                ) : !editorial.email ? (
                                    <span className="badge bg-light text-dark border">
                                        <i className="fas fa-building-circle-exclamation me-1"></i> Perfil sin verificacion
                                    </span>
                                ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerEditorialFree;
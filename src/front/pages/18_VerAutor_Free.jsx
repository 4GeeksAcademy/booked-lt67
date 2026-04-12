import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

const VerAutorFree = () => {
    const { theId } = useParams();
    const [autor, setautor] = useState(null);


    useEffect(() => {
        fetch(import.meta.env.VITE_BACKEND_URL + "api/autor/" + theId)
            .then(response => {
                return response.json();
            })
            .then(data => setautor(data))
    }, [theId]);

    if (autor === null) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p>Buscando la información de la autor {theId}...</p>
            </div>
        );
    }

    const nombreCompleto = `${autor.nombre} ${autor.apellido || ""}`;
    const imagenFinal = autor.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&background=random&color=fff&size=200`;

    return (
        <div className="container mt-5">
            <div className="card shadow border-0">
                <div className="card-body p-5">
                    <div className="row align-items-center">
                        <div className="col-md-4 text-center mb-4 mb-md-0">
                            <img
                                src={imagenFinal}
                                alt={nombreCompleto}
                                className="rounded-circle shadow-sm border"
                                style={{ width: "200px", height: "200px", objectFit: "cover" }}
                            />
                        </div>

                        {/* COLUMNA DE DATOS */}
                        <div className="col-md-8">
                            <h1 className="display-5 d-flex align-items-center">
                                {autor.nombre} {autor.apellido}
                                {autor.is_verified && (
                                    <span
                                        className="badge rounded-pill bg-primary ms-3 d-flex align-items-center justify-content-center"
                                        style={{ width: "30px", height: "30px", fontSize: "14px" }}
                                        title="Perfil Verificado"
                                    >
                                        ✓
                                    </span>
                                )}
                            </h1>
                            <p className="text-muted mb-4">Autor</p>

                            <div className="row">
                                <div className="col-sm-6">
                                    <p className="mb-1 text-secondary">Email</p>
                                    <p className="fw-bold">{autor.email || "No disponible"}</p>
                                </div>
                                <div className="col-sm-6">
                                    <p className="mb-1 text-secondary">País</p>
                                    <p className="fw-bold">{autor.pais || "Desconocido"}</p>
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
                        {/* Un pequeño aviso si es un perfil fantasma */}
                        <div className="text-end">
                            {/* autor.is_verified ? (
                                <span className="badge bg-success">
                                    <i className="fas fa-check-circle me-1"></i> Perfil Oficial Verificado
                                </span>
                            ) : */ autor.verification_status === "pending" && autor.email ? (
                                    <span className="badge bg-warning text-dark">
                                        <i className="fas fa-clock me-1"></i> Verificación en proceso
                                    </span>
                                ) : !autor.email ? (
                                    <span className="badge bg-light text-dark">
                                        <i className="fas fa-ghost me-1"></i> Perfil sin verificacion
                                    </span>
                                ) :
                                    null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerAutorFree;
import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { Link } from "react-router-dom";

const VerPerfilEditorial = () => {
    const { store } = useGlobalReducer();
    const [editoriales, setEditoriales] = useState([]);
    const [autores, setAutores] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            const responseEd = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/editorial`);
            if (responseEd.ok) setEditoriales(await responseEd.json());

            const responseAut = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/autor`);
            if (responseAut.ok) setAutores(await responseAut.json());
        } catch (error) {
            console.error("Error cargando perfiles:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    // Función auxiliar para generar la imagen circular (Avatar)
    const renderAvatar = (url, nombre, size = "50px") => {
        const finalUrl = url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=random&color=fff`;
        return (
            <img
                src={finalUrl}
                alt={nombre}
                className="rounded-circle border shadow-sm"
                style={{ width: size, height: size, objectFit: "cover" }}
            />
        );
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container mt-5">
            <div className="text-center mb-5">
                <h1 className="fw-bold">Editoriales</h1>
                <p className="text-muted">Encuentra tus sellos editoriales y autores favoritos</p>
            </div>

            <div>
                {/* SECCIÓN EDITORIALES */}
                <div className="col-md-12">
                    <h3 className="mb-4 text-secondary text-center h4"><i className="fas fa-building me-2"></i>Editoriales</h3>
                    {editoriales.length === 0 ? (
                        <div className="alert alert-info">No hay editoriales registradas.</div>
                    ) : (
                        <div className="row px-2">
                            {editoriales.map((ed) => (
                                <div key={ed.id} className="col-12 mb-3">
                                    <div className="card shadow-sm hover-shadow transition-all border-0 border-start border-primary border-4">
                                        <div className="card-body d-flex align-items-center justify-content-between">
                                            <div className="d-flex align-items-center gap-3">
                                                {renderAvatar(ed.image_url, ed.nombre)}
                                                <div>
                                                    <p className="fw-bold mb-0 d-flex align-items-center">
                                                        {ed.nombre}
                                                        {ed.is_verified && <i className="fas fa-check-circle text-primary ms-1 small" title="Verificado"></i>}
                                                    </p>
                                                    <small className="text-muted"><i className="fas fa-map-marker-alt me-1"></i>{ed.pais}</small>
                                                </div>
                                            </div>
                                            <Link to={"/ver_editorial_free/" + ed.id} className="btn btn-sm btn-primary rounded-pill px-3">Ver</Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default VerPerfilEditorial;
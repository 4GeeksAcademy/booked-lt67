import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import Chat from "../components/37_Chat";

const VerEditorialFree = () => {

    const { store } = useGlobalReducer();
    const { theId } = useParams();
    const [editorial, setEditorial] = useState(null);
    const [mostrarChat, setMostrarChat] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
        fetch(`${baseUrl}/api/editorial/${theId}`)
            .then(response => response.json())
            .then(data => {
                setEditorial(data.editorial || data);
            })
            .catch(err => console.error("Error al cargar editorial:", err));
    }, [theId]);

    if (editorial === null) {
        return (
            <div className="container-fluid min-vh-100 d-flex flex-column align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
                <div className="spinner-border text-info-booked mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
                <h5 className="text-muted fw-bold">Buscando información de la editorial...</h5>
            </div>
        );
    }

    const nombre = editorial.nombre || "Editorial";
    const imagenFinal = editorial.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=24b0d9&color=fff&size=200`;

    return (
        <div className="container-fluid min-vh-100 py-5" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
            <div className="container">
                <div className="card shadow-lg border-0 rounded-5 overflow-hidden mx-auto" style={{ maxWidth: "1000px" }}>

                    {/* BANNER Y PERFIL (Igual que antes) */}
                    <div className="bg-info-booked position-relative" style={{ height: "140px", width: "100%" }}>
                        <i className="fas fa-book-open position-absolute text-white opacity-25" style={{ fontSize: "8rem", right: "20px", top: "-10px", transform: "rotate(-5deg)" }}></i>
                    </div>

                    <div className="card-body p-4 p-md-5 pt-0">
                        {/* INFO DE CABECERA (Nombre, Foto, badges...) */}
                        <div className="row mb-5">
                            <div className="col-12 col-md-4 text-center text-md-start mb-4 mb-md-0" style={{ marginTop: "-70px" }}>
                                <div className="position-relative d-inline-block">
                                    <img src={imagenFinal} alt={nombre} className="rounded-circle shadow bg-white p-1" style={{ width: "160px", height: "160px", objectFit: "cover", border: "4px solid white" }} />
                                    {editorial.is_verified && (
                                        <div className="position-absolute bg-primary text-white rounded-circle d-flex align-items-center justify-content-center border border-3 border-white shadow-sm" style={{ width: "35px", height: "35px", bottom: "10px", right: "10px" }}>
                                            <i className="fas fa-check"></i>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="col-12 col-md-8 pt-md-3 text-center text-md-start">
                                <h1 className="fw-bold text-dark mb-0 display-6">{nombre}</h1>
                                <p className="text-info-booked fw-bold text-uppercase small mb-4"><i className="fas fa-bookmark me-2"></i>Sello Editorial</p>
                                <div className="row g-3 bg-light p-4 rounded-4 border shadow-sm">
                                    {/* <div className="col-sm-6 text-break">
                                        <p className="mb-1 text-muted small fw-bold text-uppercase">Email</p>
                                        <p className="fw-bold text-dark mb-0">{editorial.email || "No disponible"}</p>
                                    </div> */}
                                    <div className="col-sm-6">
                                        <p className="mb-1 text-muted small fw-bold text-uppercase">País</p>
                                        <p className="fw-bold text-dark mb-0">{editorial.pais || "Desconocido"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- SECCIÓN: CATÁLOGO CON EL ESTILO DE LA BIBLIOTECA --- */}
                        <div className="mt-5">
                            <div className="mb-4">
                                <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— Catálogo Oficial</span>
                                <h3 className="fw-bold text-dark mt-2">Nuestras Publicaciones</h3>
                            </div>

                            <div className="row bookshelf-grid">
                                {editorial.libros && editorial.libros.length > 0 ? (
                                    editorial.libros.map((libro) => (
                                        <div key={libro.id} className="col-6 col-md-4 col-lg-3 mb-5 shelf-item px-3">
                                            {/* EL NICHO (Heredado de shelfStyles.css) */}
                                            <div className="shelf-cubby">
                                                <div className="book-3d" onClick={() => navigate(`/ver_libro/${libro.id}`)}>
                                                    <img src={libro.image_url || "https://via.placeholder.com/200x300?text=Booked"} alt={libro.nombre} />
                                                </div>
                                                <div className="shelf-floor-wood"></div>
                                            </div>

                                            {/* INFO DEL LIBRO DEBAJO DEL NICHO */}
                                            <div className="d-flex justify-content-center align-items-center gap-2 mt-2">
                                                <span
                                                    className="badge bg-info-booked bg-opacity-10 text-white rounded-pill d-inline-flex align-items-center justify-content-center border border-info-booked border-opacity-25"
                                                    style={{
                                                        padding: '0.25rem 0.75rem', // Match del padding vertical y horizontal del btn-sm
                                                        fontSize: '0.75rem',        // Tamaño de fuente estándar de btn-sm
                                                        minHeight: '31px',          // Altura aproximada de un btn-sm con py-1
                                                        lineHeight: '1'
                                                    }}
                                                >
                                                    {libro.genero}
                                                </span>

                                                
                                                <Link
                                                    to={`/ver_libro/${libro.id}`}
                                                    className="btn btn-sm btn-booked-blue rounded-pill px-3 py-1 shadow-sm d-inline-flex align-items-center"
                                                    style={{ fontSize: '0.75rem', minHeight: '31px' }}
                                                >
                                                    <i className="fas fa-eye me-1"></i> Ver
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12 text-center py-5 bg-light rounded-4 border">
                                        <i className="fas fa-book-open fa-2x text-muted opacity-25 mb-3"></i>
                                        <p className="text-muted mb-0">Esta editorial aún no ha registrado obras.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <hr className="my-5 opacity-25" />

                        {/* BOTONES DE ACCIÓN (Volver, Chat, etc.) */}
                        <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-3">
                            <button className="btn btn-light border rounded-pill px-4 shadow-sm fw-bold text-muted" onClick={() => navigate(-1)}>
                                <i className="fas fa-arrow-left me-2"></i> Volver atrás
                            </button>

                            {store.auth_lector ? (
                                <button className="btn btn-booked-blue shadow-sm px-4 rounded-pill fw-bold" onClick={() => setMostrarChat(true)}>
                                    <i className="fas fa-comments me-2"></i> Contactar Editorial
                                </button>
                            ) : (
                                <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => navigate("/login_lector")}>
                                    <i className="fas fa-user-lock me-2"></i> Loguéate para contactar
                                </button>
                            )}
                        </div>

                        {/* COMPONENTE CHAT */}
                        {mostrarChat && store.auth_lector && (
                            <Chat
                                lectorId={store.lector_id || localStorage.getItem("lector_id")}
                                editorialId={theId}
                                tipoUsuario="lector"
                                esPopUp={true}
                                abiertoInicial={mostrarChat}
                                nombreEditorial={editorial?.nombre}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerEditorialFree;
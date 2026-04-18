import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const NuevaReview = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { store } = useGlobalReducer();

    const libroPreseleccionado = location.state?.libroId ? String(location.state.libroId) : "";

    const [libroId, setLibroId] = useState(libroPreseleccionado);
    const [libros, setLibros] = useState([]);
    const [texto, setTexto] = useState("");
    const [puntuacion, setPuntuacion] = useState(10);
    const [cargando, setCargando] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const libroSeleccionado = libros.find(l => String(l.id) === libroId);

    useEffect(() => {
        if (store.auth_lector) {
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/libro`)
                .then(response => {
                    if (!response.ok) throw new Error("Error al cargar biblioteca");
                    return response.json();
                })
                .then(data => {
                    setLibros(data);
                    if (libroPreseleccionado) {
                        setLibroId(libroPreseleccionado);
                    }
                })
                .catch(err => {
                    console.error("Error:", err);
                    setErrorMsg("No se pudo conectar con la base de datos.");
                });
        }
    }, [store.auth_lector, libroPreseleccionado]);

    if (!store.auth_lector) return <Navigate to="/login_lector" />;

    const sendData = async (e) => {
        e.preventDefault();
        setCargando(true);
        setErrorMsg(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lector_id: parseInt(store.lector_id),
                    libro_id: parseInt(libroId),
                    texto: texto,
                    puntuacion: parseInt(puntuacion)
                })
            });

            if (response.ok) {
                navigate("/pagina_lector");
            } else {
                throw new Error("Error al publicar la reseña");
            }
        } catch (error) {
            setErrorMsg(error.message);
            setCargando(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: "100vh", background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="card shadow-lg border-0 rounded-5 overflow-hidden">
                            <div className="row g-0">
                                
                                {/* Lado Izquierdo: Visual del Libro CENTRADO */}
                                <div className="col-md-5 bg-info-booked text-white p-5 d-flex flex-column align-items-center justify-content-center text-center">
                                    {libroSeleccionado ? (
                                        <div className="animate__animated animate__fadeIn w-100 d-flex flex-column align-items-center">
                                            {/* Contenedor de imagen con flex para asegurar centrado total */}
                                            <div className="book-cover-floating mb-4 d-flex justify-content-center w-100">
                                                <img 
                                                    src={libroSeleccionado.image_url || "https://via.placeholder.com/200x300?text=No+Cover"} 
                                                    className="img-fluid rounded-3 shadow-lg" 
                                                    style={{ 
                                                        maxHeight: "300px", 
                                                        width: "auto",
                                                        display: "block",
                                                        objectFit: "contain"
                                                    }} 
                                                    alt="Portada"
                                                />
                                            </div>
                                            <div className="mt-2">
                                                <h3 className="fw-bold mb-1">{libroSeleccionado.nombre}</h3>
                                                <p className="opacity-75" style={{ fontStyle: 'italic' }}>{libroSeleccionado.nombre_autor}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 d-flex flex-column align-items-center">
                                            <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center text-info-booked mb-4 shadow" style={{ width: '80px', height: '80px' }}>
                                                <i className="fas fa-book-open fa-2x"></i>
                                            </div>
                                            <h2 className="fw-bold mb-3">Tu voz importa</h2>
                                            <p className="lead fs-6 opacity-75">Selecciona un libro para ver su portada y comenzar tu reseña.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Lado Derecho: Formulario */}
                                <div className="col-md-7 p-5 bg-white">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h3 className="fw-bold text-dark mb-0">Nueva Reseña</h3>
                                        <Link to="/pagina_lector" className="btn btn-sm btn-light rounded-pill px-3 text-muted border shadow-sm">
                                            <i className="fas fa-arrow-left me-1"></i> Volver
                                        </Link>
                                    </div>

                                    {errorMsg && <div className="alert alert-danger rounded-4 mb-4 small">{errorMsg}</div>}

                                    <form onSubmit={sendData}>
                                        <div className="mb-4">
                                            <label className="form-label fw-bold text-muted small text-uppercase">Libro a reseñar</label>
                                            <div className="input-group shadow-sm rounded-4 overflow-hidden">
                                                <span className="input-group-text bg-light border-0 text-muted px-3">
                                                    <i className="fas fa-search"></i>
                                                </span>
                                                <select 
                                                    className="form-select bg-light border-0 py-2" 
                                                    value={libroId} 
                                                    onChange={(e) => setLibroId(e.target.value)}
                                                    required
                                                >
                                                    <option value="">Selecciona de la biblioteca...</option>
                                                    {libros.map(l => (
                                                        <option key={l.id} value={String(l.id)}>{l.nombre}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label fw-bold text-muted small text-uppercase d-flex justify-content-between">
                                                Calificación 
                                                <span className="text-warning fw-bold">
                                                    {puntuacion} / 10 <i className="fas fa-star ms-1"></i>
                                                </span>
                                            </label>
                                            <input 
                                                type="range" className="form-range custom-range" min="0" max="10" step="1"
                                                value={puntuacion} onChange={(e) => setPuntuacion(e.target.value)} 
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label fw-bold text-muted small text-uppercase">Tu Opinión</label>
                                            <textarea 
                                                className="form-control bg-light border-0 rounded-4 p-3 shadow-sm" 
                                                rows="4"
                                                placeholder="¿Qué te pareció la historia?..."
                                                value={texto} 
                                                onChange={(e) => setTexto(e.target.value)} 
                                                required 
                                            ></textarea>
                                        </div>

                                        <div className="d-grid mt-5">
                                            <button 
                                                type="submit" 
                                                className="btn btn-booked-blue btn-lg rounded-pill fw-bold shadow-sm"
                                                disabled={cargando || !libroId}
                                            >
                                                {cargando ? (
                                                    <><span className="spinner-border spinner-border-sm me-2"></span> Publicando...</>
                                                ) : (
                                                    <><i className="fas fa-paper-plane me-2"></i> Publicar Reseña</>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NuevaReview;
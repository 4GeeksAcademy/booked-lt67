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

    // Buscamos el libro actual dentro de la lista cargada para mostrar su info
    const libroSeleccionado = libros.find(l => String(l.id) === libroId);

    useEffect(() => {
        if (store.auth_lector) {
            // Corregido el slash en la URL para evitar el ERR_NAME_NOT_RESOLVED
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/libro`)
                .then(response => {
                    if (!response.ok) throw new Error("No se pudieron cargar los libros.");
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
                    setErrorMsg("Error al conectar con la biblioteca.");
                });
        }
    }, [store.auth_lector, libroPreseleccionado]);

    if (!store.auth_lector) {
        return <Navigate to="/login_lector" />;
    }

    const sendData = async (e) => {
        e.preventDefault();
        setCargando(true);
        setErrorMsg(null);

        const requestBody = {
            lector_id: parseInt(store.lector_id),
            libro_id: parseInt(libroId),
            texto: texto,
            puntuacion: parseInt(puntuacion)
        };

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                navigate("/pagina_lector");
            } else {
                const errorData = await response.json();
                throw new Error(errorData.msg || "Error al publicar la reseña");
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
                    <div className="col-lg-9">
                        <div className="card shadow-lg border-0 rounded-5 overflow-hidden">
                            <div className="row g-0">
                                
                                {/* Lado Izquierdo: Visual (Aquí mostramos el libro) */}
                                <div className="col-md-5 bg-info-booked text-white p-5 d-flex flex-column justify-content-center align-items-center text-center position-relative overflow-hidden">
                                    {libroSeleccionado ? (
                                        <div className="position-relative z-index-1">
                                            <img 
                                                src={libroSeleccionado.imagen_url || "https://via.placeholder.com/200x300"} 
                                                className="img-fluid rounded shadow mb-3" 
                                                style={{ maxHeight: "250px" }}
                                                alt="Portada"
                                            />
                                            <h3 className="fw-bold">{libroSeleccionado.nombre}</h3>
                                            <p className="opacity-75">{libroSeleccionado.autor}</p>
                                        </div>
                                    ) : (
                                        <div className="position-relative z-index-1">
                                            <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center text-info-booked mb-4 shadow" style={{ width: '80px', height: '80px' }}>
                                                <i className="fas fa-pen-nib fa-2x"></i>
                                            </div>
                                            <h2 className="fw-bold mb-3">Tu voz importa</h2>
                                            <p className="lead fs-6 opacity-75">Selecciona un libro para comenzar tu reseña.</p>
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

                                    {errorMsg && (
                                        <div className="alert alert-danger rounded-4 mb-4 shadow-sm" role="alert">
                                            <i className="fas fa-exclamation-circle me-2"></i> {errorMsg}
                                        </div>
                                    )}

                                    <form onSubmit={sendData}>
                                        <div className="mb-4">
                                            <label className="form-label fw-bold text-muted small text-uppercase">Libro a reseñar</label>
                                            <div className="input-group shadow-sm rounded-4 overflow-hidden">
                                                <span className="input-group-text bg-light border-0 text-muted px-3">
                                                    <i className="fas fa-book"></i>
                                                </span>
                                                <select 
                                                    className="form-select bg-light border-0 py-2" 
                                                    value={libroId} 
                                                    onChange={(e) => setLibroId(e.target.value)}
                                                    required
                                                >
                                                    <option value="">Selecciona un libro...</option>
                                                    {libros.map(l => (
                                                        <option key={l.id} value={String(l.id)}>{l.nombre}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label fw-bold text-muted small text-uppercase d-block">
                                                Calificación <span className="text-warning"><i className="fas fa-star"></i></span>
                                            </label>
                                            <div className="d-flex align-items-center gap-3">
                                                <input 
                                                    type="range" className="form-range flex-grow-1" min="0" max="10" step="1"
                                                    value={puntuacion} onChange={(e) => setPuntuacion(e.target.value)} 
                                                    required 
                                                />
                                                <span className="badge bg-info-booked text-white fs-6 rounded-pill px-3 py-2 shadow-sm" style={{ minWidth: '65px' }}>
                                                    {puntuacion} / 10
                                                </span>
                                            </div>
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
                                                className="btn btn-booked-blue btn-lg rounded-pill fw-bold shadow-sm py-3"
                                                disabled={cargando || !libroId}
                                            >
                                                {cargando ? "Enviando..." : "Publicar Reseña"}
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
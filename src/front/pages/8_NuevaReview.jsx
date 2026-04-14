import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const NuevaReview = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { store } = useGlobalReducer();

    // Convertimos explícitamente a String para evitar problemas de compatibilidad en el select
    const libroPreseleccionado = location.state?.libroId ? String(location.state.libroId) : "";

    const [libroId, setLibroId] = useState(libroPreseleccionado);
    const [libros, setLibros] = useState([]);
    const [texto, setTexto] = useState("");
    const [puntuacion, setPuntuacion] = useState(10);
    const [cargando, setCargando] = useState(false);

    // Verificamos que el usuario esté logueado como lector
    useEffect(() => {
        if (store.auth_lector) {
            fetch(import.meta.env.VITE_BACKEND_URL + "api/libro")
                .then(response => response.json())
                .then(data => setLibros(data))
                .catch(err => console.error("Error cargando libros:", err));
        }
    }, [store.auth_lector]);

    // Si no está logueado, lo mandamos al login
    if (!store.auth_lector) {
        return <Navigate to="/login_lector" />;
    }

    const sendData = (e) => {
        e.preventDefault();
        setCargando(true);

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "lector_id": parseInt(store.lector_id), // Tomamos el lector directo del Store
                "libro_id": parseInt(libroId),
                "texto": texto,
                "puntuacion": parseInt(puntuacion)
            })
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/reviews", requestOptions)
            .then(response => {
                if(response.ok) return response.json();
                throw new Error("Error al crear la reseña");
            })
            .then(data => {
                console.log("Review creada:", data);
                // Volvemos a la página del lector tras publicar
                navigate("/pagina_lector");
            })
            .catch(error => {
                console.error(error);
                setCargando(false);
            });
    };

    return (
        <div className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: "100vh", background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-9">
                        <div className="card shadow-lg border-0 rounded-5 overflow-hidden">
                            <div className="row g-0">
                                
                                {/* Lado Izquierdo: Visual */}
                                <div className="col-md-5 bg-info-booked text-white p-5 d-flex flex-column justify-content-center align-items-center text-center position-relative overflow-hidden">
                                    <i className="fas fa-quote-left position-absolute opacity-10" style={{ fontSize: '15rem', top: '-20px', left: '-20px' }}></i>
                                    
                                    <div className="position-relative z-index-1">
                                        <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center text-info-booked mb-4 shadow" style={{ width: '80px', height: '80px' }}>
                                            <i className="fas fa-pen-nib fa-2x"></i>
                                        </div>
                                        <h2 className="fw-bold mb-3">Tu voz importa</h2>
                                        <p className="lead fs-6 opacity-75">
                                            Comparte tu opinión con la comunidad Booked. ¿Qué te hizo sentir esta lectura? ¿La recomendarías?
                                        </p>
                                    </div>
                                </div>

                                {/* Lado Derecho: Formulario */}
                                <div className="col-md-7 p-5 bg-white">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h3 className="fw-bold text-dark mb-0">Escribir Reseña</h3>
                                        <Link to="/pagina_lector" className="btn btn-sm btn-light rounded-pill px-3 text-muted border shadow-sm">
                                            <i className="fas fa-arrow-left me-1"></i> Volver
                                        </Link>
                                    </div>

                                    <form onSubmit={sendData}>
                                        {/* Dropdown de Libros */}
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
                                                    <option value="">Selecciona un libro de la biblioteca...</option>
                                                    {libros.map(l => (
                                                        // También forzamos a String aquí para que coincida perfectamente
                                                        <option key={l.id} value={String(l.id)}>{l.nombre}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Puntuación */}
                                        <div className="mb-4">
                                            <label className="form-label fw-bold text-muted small text-uppercase">
                                                Calificación <span className="text-warning"><i className="fas fa-star"></i></span>
                                            </label>
                                            <div className="d-flex align-items-center gap-3">
                                                <input 
                                                    type="range" 
                                                    className="form-range flex-grow-1" 
                                                    min="0" 
                                                    max="10" 
                                                    step="1"
                                                    value={puntuacion} 
                                                    onChange={(e) => setPuntuacion(e.target.value)} 
                                                    required 
                                                />
                                                <span className="badge bg-info-booked text-white fs-6 rounded-pill px-3 py-2 shadow-sm" style={{ minWidth: '60px' }}>
                                                    {puntuacion} / 10
                                                </span>
                                            </div>
                                        </div>

                                        {/* Área de Texto */}
                                        <div className="mb-4">
                                            <label className="form-label fw-bold text-muted small text-uppercase">Tu Opinión</label>
                                            <textarea 
                                                className="form-control bg-light border-0 rounded-4 p-3 shadow-sm" 
                                                rows="5"
                                                placeholder="Escribe aquí tu reseña. ¡No escatimes en detalles!"
                                                value={texto} 
                                                onChange={(e) => setTexto(e.target.value)} 
                                                required 
                                            ></textarea>
                                        </div>

                                        {/* Submit */}
                                        <div className="d-grid mt-5">
                                            <button 
                                                type="submit" 
                                                className="btn btn-booked-blue btn-lg rounded-pill fw-bold shadow-sm"
                                                disabled={cargando || !libroId}
                                            >
                                                {cargando ? (
                                                    <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span> Publicando...</>
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
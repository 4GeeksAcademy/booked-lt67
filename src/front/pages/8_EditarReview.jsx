import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const EditarReview = () => {
    const { theId } = useParams();
    const navigate = useNavigate();
    const { store } = useGlobalReducer();

    // --- 1. Definimos la base limpia para los 3 fetches del componente ---
    const API_BASE = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "") + "/api";

    const [lectorId, setLectorId] = useState("");
    const [libroId, setLibroId] = useState("");
    const [texto, setTexto] = useState("");
    const [puntuacion, setPuntuacion] = useState(10);
    const [libros, setLibros] = useState([]);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (!store.auth_lector && !store.auth_admin ) return;

        // 2. Cargar libros con URL blindada
        fetch(`${API_BASE}/libro`)
            .then(res => res.json())
            .then(data => setLibros(data))
            .catch(err => console.error("Error cargando libros:", err));

        // 3. Cargar datos de la reseña con URL blindada
        fetch(`${API_BASE}/reviews/${theId}`)
            .then(res => res.json())
            .then(data => {
                setLectorId(String(data.lector_id));
                // Aseguramos que libroId sea string para el select
                setLibroId(String(data.libro?.id || data.libro_id));
                setTexto(data.texto || "");
                setPuntuacion(data.puntuacion || 10);
            })
            .catch(err => console.error("Error cargando la reseña:", err));

    }, [theId, store.auth_lector, API_BASE]);

    if (!store.auth_lector && !store.auth_admin) {
        return <Navigate to="/login_lector" />;
    }

    const updateData = (e) => {
        e.preventDefault();
        setCargando(true);

        if (!lectorId || !libroId) {
            alert("Información incompleta");
            setCargando(false);
            return;
        }

        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "lector_id": parseInt(lectorId),
                "libro_id": parseInt(libroId),
                "texto": texto,
                "puntuacion": parseInt(puntuacion)
            })
        };

        // 4. PUT de actualización blindado
        fetch(`${API_BASE}/reviews/${theId}`, requestOptions)
            .then(response => {
                if (response.ok) {
                    navigate("/pagina_lector");
                } else {
                    throw new Error("No se pudo actualizar");
                }
            })
            .catch(err => {
                console.error(err);
                alert("Hubo un error al actualizar la reseña");
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
                                    <i className="fas fa-edit position-absolute opacity-10" style={{ fontSize: '15rem', top: '-20px', left: '-20px' }}></i>
                                    
                                    <div className="position-relative z-index-1">
                                        <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center text-info-booked mb-4 shadow" style={{ width: '80px', height: '80px' }}>
                                            <i className="fas fa-pencil-alt fa-2x"></i>
                                        </div>
                                        <h2 className="fw-bold mb-3">Refina tu opinión</h2>
                                        <p className="lead fs-6 opacity-75">
                                            Las perspectivas cambian y está bien. Ajusta tu calificación o mejora tu reseña para ayudar a otros lectores.
                                        </p>
                                    </div>
                                </div>

                                {/* Lado Derecho: Formulario */}
                                <div className="col-md-7 p-5 bg-white">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h3 className="fw-bold text-dark mb-0">Editar Reseña</h3>
                                        <Link to="/pagina_lector" className="btn btn-sm btn-light rounded-pill px-3 text-muted border shadow-sm">
                                            <i className="fas fa-arrow-left me-1"></i> Cancelar
                                        </Link>
                                    </div>

                                    <form onSubmit={updateData}>
                                        {/* Dropdown de Libros (Deshabilitado, porque no deberías cambiar de libro en una edición, sino hacer una nueva) */}
                                        <div className="mb-4">
                                            <label className="form-label fw-bold text-muted small text-uppercase">Libro reseñado</label>
                                            <div className="input-group shadow-sm rounded-4 overflow-hidden">
                                                <span className="input-group-text bg-light border-0 text-muted px-3">
                                                    <i className="fas fa-book"></i>
                                                </span>
                                                <select 
                                                    className="form-select bg-light border-0 py-2 text-muted" 
                                                    value={libroId} 
                                                    onChange={(e) => setLibroId(e.target.value)}
                                                    disabled // Deshabilitado por seguridad de la reseña
                                                >
                                                    <option value="">Cargando libro...</option>
                                                    {libros.map(l => (
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
                                                placeholder="Actualiza tu reseña aquí..."
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
                                                    <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span> Guardando...</>
                                                ) : (
                                                    <><i className="fas fa-save me-2"></i> Guardar Cambios</>
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

export default EditarReview;
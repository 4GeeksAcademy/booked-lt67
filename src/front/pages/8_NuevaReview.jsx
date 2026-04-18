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
    const [libroSeleccionado, setLibroSeleccionado] = useState(null); // Para mostrar los detalles
    const [texto, setTexto] = useState("");
    const [puntuacion, setPuntuacion] = useState(10);
    const [cargando, setCargando] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    // 1. Cargar todos los libros para el select
    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}api/libro`)
            .then(res => res.json())
            .then(data => setLibros(data))
            .catch(() => setErrorMsg("Error al cargar libros"));
    }, []);

    // 2. Buscar los detalles del libro específico cuando cambia libroId
    useEffect(() => {
        if (libroId) {
            fetch(`${import.meta.env.VITE_BACKEND_URL}api/libro/${libroId}`)
                .then(res => res.json())
                .then(data => setLibroSeleccionado(data))
                .catch(() => setLibroSeleccionado(null));
        }
    }, [libroId]);

    if (!store.auth_lector) return <Navigate to="/login_lector" />;

    const sendData = async (e) => {
        e.preventDefault();
        setCargando(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lector_id: parseInt(store.lector_id),
                    libro_id: parseInt(libroId),
                    texto: texto,
                    puntuacion: parseInt(puntuacion)
                })
            });
            if (response.ok) navigate("/pagina_lector");
            else throw new Error("Error al publicar");
        } catch (error) {
            setErrorMsg(error.message);
            setCargando(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: "100vh", background: '#f4f5f5' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="card shadow-lg border-0 rounded-5 overflow-hidden">
                            <div className="row g-0">
                                
                                {/* Lado Izquierdo: Visualización del Libro */}
                                <div className="col-md-5 bg-light p-5 d-flex flex-column align-items-center justify-content-center border-end">
                                    {libroSeleccionado ? (
                                        <div className="text-center animate__animated animate__fadeIn">
                                            <img 
                                                src={libroSeleccionado.imagen_url || "https://via.placeholder.com/200x300"} 
                                                alt={libroSeleccionado.nombre}
                                                className="img-fluid rounded shadow-lg mb-4"
                                                style={{ maxHeight: "350px", objectFit: "cover" }}
                                            />
                                            <h4 className="fw-bold text-dark">{libroSeleccionado.nombre}</h4>
                                            <p className="text-muted small">Autor: {libroSeleccionado.autor || "Desconocido"}</p>
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted">
                                            <i className="fas fa-book-open fa-4x mb-3 opacity-25"></i>
                                            <p>Selecciona un libro para ver los detalles</p>
                                        </div>
                                    )}
                                </div>

                                {/* Lado Derecho: Formulario */}
                                <div className="col-md-7 p-5 bg-white">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h3 className="fw-bold mb-0">Nueva Reseña</h3>
                                        <Link to="/pagina_lector" className="btn btn-sm btn-outline-secondary rounded-pill px-3">
                                            Volver
                                        </Link>
                                    </div>

                                    {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

                                    <form onSubmit={sendData}>
                                        <div className="mb-4">
                                            <label className="form-label fw-bold small text-uppercase">Libro</label>
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

                                        <div className="mb-4">
                                            <label className="form-label fw-bold small text-uppercase d-block">Calificación: {puntuacion}/10</label>
                                            <input 
                                                type="range" className="form-range" min="0" max="10" step="1"
                                                value={puntuacion} onChange={(e) => setPuntuacion(e.target.value)} 
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label fw-bold small text-uppercase">Tu Opinión</label>
                                            <textarea 
                                                className="form-control bg-light border-0 rounded-4 p-3" 
                                                rows="5"
                                                placeholder="¿Qué te pareció la historia?..."
                                                value={texto} 
                                                onChange={(e) => setTexto(e.target.value)} 
                                                required 
                                            ></textarea>
                                        </div>

                                        <div className="d-grid mt-4">
                                            <button 
                                                type="submit" 
                                                className="btn btn-primary btn-lg rounded-pill fw-bold"
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
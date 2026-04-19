import React, { useState } from 'react';
import successSound from "../assets/sounds/BookedAudioLogov2.mp3"
import { Link } from "react-router-dom";

const EscanerLibro = () => {
    const [cargando, setCargando] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState(null);

    const playSuccess = () => {
        const audio = new Audio(successSound);
        audio.volume = 0.4; // Ajustamos el volumen para que no asuste al usuario
        audio.play().catch(e => console.log("Audio bloqueado por el navegador"));
    };

    const analizarPortada = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setCargando(true);
        setError(null);
        setResultado(null);

        const formData = new FormData();
        formData.append("portada", file);

        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
            const urlFinal = `${baseUrl}/api/reconocer_portada`;

            const response = await fetch(urlFinal, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error en el servidor");
            }

            if (data.libro) {
                if (data.libro.portada_url) {
                    data.libro.portada_url = data.libro.portada_url.replace("http://", "https://");
                }
                setResultado(data.libro);
                playSuccess();
            } else {
                setError(data.message || "No se pudo reconocer el libro.");
            }

        } catch (err) {
            console.error("Error detallado:", err);
            setError(err.message || "Error de conexión con el servidor");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border position-relative overflow-hidden w-100" style={{ borderTop: '5px solid #24b0d9' }}>
            {/* Ícono de fondo decorativo */}
            <i className="fas fa-camera-retro position-absolute opacity-10" style={{ fontSize: '10rem', right: '-20px', bottom: '-20px', color: '#24b0d9' }}></i>

            <div className="position-relative z-index-1">
                <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="bg-light p-3 rounded-circle text-info-booked">
                        <i className="fas fa-camera fa-lg"></i>
                    </div>
                    <div>
                        <h4 className="fw-bold text-dark mb-0">Escáner IA de Portadas</h4>
                        <p className="text-muted small mb-0">Sube o toma una foto del libro y nuestra IA hará el resto.</p>
                    </div>
                </div>

                <div className="mb-4 mt-4 text-center">
                    <label className="btn btn-booked-blue btn-lg px-5 rounded-pill shadow-sm" style={{ cursor: 'pointer' }}>
                        {cargando ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Analizando portada...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-upload me-2"></i> Subir / Tomar Foto
                            </>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            hidden
                            onChange={analizarPortada}
                            disabled={cargando}
                        />
                    </label>
                </div>

                {error && (
                    <div className="alert alert-danger d-flex align-items-center rounded-3 border-0 shadow-sm" role="alert">
                        <i className="fas fa-exclamation-triangle me-3 fa-lg"></i>
                        <div>{error}</div>
                    </div>
                )}

                {resultado && (
                    <div className="card text-start border-0 shadow-sm bg-light rounded-4 mt-4 overflow-hidden">
                        <div className="row g-0 align-items-center">
                            <div className="col-4 p-3 d-flex align-items-center justify-content-center">
                                <img
                                    src={resultado.portada_url || "https://placehold.co/400x600?text=Sin+Portada"}
                                    alt={resultado.titulo}
                                    className="img-fluid rounded shadow-sm"
                                    style={{ maxHeight: '200px', objectFit: 'contain' }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://placehold.co/400x600/666/fff?text=Error+Imagen";
                                    }}
                                />
                            </div>
                            <div className="col-8">
                                <div className="card-body p-3 p-md-4">
                                    <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '1px' }}>— {resultado.categoria || "Lectura Encontrada"}</span>
                                    <h5 className="card-title fw-bold mb-1 text-truncate mt-1" title={resultado.titulo}>
                                        {resultado.titulo}
                                    </h5>
                                    <p className="card-text text-muted mb-3 small fw-semibold">
                                        <i className="fas fa-feather-alt me-1"></i> {resultado.autor}
                                    </p>

                                    <div className="d-flex flex-wrap gap-2 mb-3">
                                        <span className="badge bg-white text-dark border shadow-sm px-2 py-1"><i className="fas fa-building me-1 text-muted"></i> {resultado.editorial}</span>
                                        <span className="badge bg-white text-dark border shadow-sm px-2 py-1"><i className="fas fa-file-alt me-1 text-muted"></i> {resultado.paginas} págs</span>
                                    </div>

                                    <p className="card-text small mb-4 text-muted" style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: '3',
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        lineHeight: '1.5'
                                    }}>
                                        {resultado.descripcion}
                                    </p>
                                    <div className="mt-3 text-center">
                                        <Link 
                                            to={`/ver_libro/${resultado.id}`} 
                                            className="btn btn-booked-blue rounded-pill px-4 shadow-sm w-25 w-md-auto"
                                        >
                                            <i className="fas fa-info-circle me-2"></i>
                                            Ver detalles
                                        </Link>
                                    </div>

                                    {/* Botón de acción integrado (Asegúrate de conectarlo a tu lógica de agregar libros) */}

                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EscanerLibro;
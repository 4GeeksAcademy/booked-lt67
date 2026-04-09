import React, { useState } from 'react';

const EscanerLibro = () => {
    const [cargando, setCargando] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState(null);

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
            
            console.log("Respuesta del servidor completa:", data);

            if (data.libro) {
                if (data.libro.portada_url) {
                    data.libro.portada_url = data.libro.portada_url.replace("http://", "https://");
                }
                setResultado(data.libro);
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
        <div className="card p-4 shadow-sm border-0 bg-light text-center" style={{ maxWidth: '600px', margin: 'auto' }}>
            <h4 className="fw-bold text-primary mb-3">
                <i className="fas fa-camera me-2"></i>Escáner de Portadas
            </h4>
            <p className="text-muted small">Apunta la cámara a la portada de un libro para conocer todos sus detalles.</p>

            <div className="mb-4">
                <label className="btn btn-success btn-lg px-5 rounded-pill shadow" style={{ cursor: 'pointer' }}>
                    {cargando ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Analizando IA...
                        </>
                    ) : (
                        "Escanear Libro"
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
                <div className="alert alert-danger d-flex align-items-center justify-content-center" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    <div>{error}</div>
                </div>
            )}

            {resultado && (
                <div className="card text-start border-primary shadow mt-3">
                    <div className="row g-0">
                        <div className="col-4 p-2 d-flex align-items-center justify-content-center bg-white">

                            <img
                                src={resultado.portada_url || "https://placehold.co/400x600?text=Sin+Portada"}
                                alt={resultado.titulo}
                                className="img-fluid rounded shadow-sm"
                                style={{ maxHeight: '180px', width: '100%', objectFit: 'contain' }}
                                onError={(e) => { 
                                    // Evitamos bucle infinito si el placeholder también falla
                                    e.target.onerror = null; 
                                    e.target.src = "https://placehold.co/400x600/666/fff?text=Error+Imagen"; 
                                }}
                            />

                        </div>
                        <div className="col-8">
                            <div className="card-body p-3">
                                <h5 className="card-title fw-bold mb-1 text-truncate" title={resultado.titulo}>
                                    {resultado.titulo}
                                </h5>
                                <p className="card-text text-muted mb-2 small">{resultado.autor}</p>

                                <div className="d-flex flex-wrap gap-1 mb-2">
                                    <span className="badge bg-secondary small">{resultado.editorial}</span>
                                    <span className="badge bg-info text-dark small">{resultado.paginas} págs</span>
                                    {/* NUEVA CATEGORÍA */}
                                    <span className="badge bg-warning text-dark small">{resultado.categoria}</span>
                                </div>

                                <p className="card-text small mb-3" style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: '3',
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    lineHeight: '1.4'
                                }}>
                                    {resultado.descripcion}
                                </p>

                                <button className="btn btn-sm btn-primary w-100 shadow-sm">
                                    <i className="fas fa-plus me-1"></i> Agregar a mi Biblioteca
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EscanerLibro;
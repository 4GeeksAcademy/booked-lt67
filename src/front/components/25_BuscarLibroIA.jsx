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

        // Preparamos la imagen para mandarla al backend
        const formData = new FormData();
        formData.append("portada", file);

        try {
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + "api/reconocer_portada", {
                method: 'POST',
                body: formData // No le ponemos Content-Type, el navegador lo calcula automático con FormData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error al reconocer el libro.");
            }

            setResultado(data.libro);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="card p-4 shadow-sm border-0 bg-light text-center">
            <h4 className="fw-bold text-primary mb-3">
                <i className="fas fa-camera me-2"></i>Escáner de Portadas
            </h4>
            <p className="text-muted small">Apunta la cámara a la portada de un libro para conocer todos sus detalles.</p>

            {/* BOTÓN MÁGICO DE LA CÁMARA */}
            <div className="mb-4">
                <label className="btn btn-success btn-lg px-5 rounded-pill shadow">
                    {cargando ? "Analizando IA..." : "Escanear Libro"}
                    <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" // Esto abre la cámara trasera en el celular
                        hidden 
                        onChange={analizarPortada} 
                        disabled={cargando}
                    />
                </label>
            </div>

            {/* MANEJO DE ESTADOS */}
            {cargando && (
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            )}

            {error && <div className="alert alert-danger">{error}</div>}

            {/* RESULTADO (LA TARJETA DEL LIBRO) */}
            {resultado && (
                <div className="card text-start border-primary shadow mt-3">
                    <div className="row g-0">
                        <div className="col-4 p-2 text-center">
                            {resultado.portada_url ? (
                                <img src={resultado.portada_url} alt={resultado.titulo} className="img-fluid rounded shadow-sm" />
                            ) : (
                                <div className="bg-secondary text-white p-3 rounded h-100 d-flex align-items-center">Sin Portada</div>
                            )}
                        </div>
                        <div className="col-8">
                            <div className="card-body p-2">
                                <h5 className="card-title fw-bold mb-1">{resultado.titulo}</h5>
                                <p className="card-text text-muted mb-1 small">{resultado.autor}</p>
                                <div className="d-flex gap-2 mb-2">
                                    <span className="badge bg-secondary">{resultado.editorial}</span>
                                    <span className="badge bg-info text-dark">{resultado.paginas} págs</span>
                                </div>
                                <p className="card-text small text-truncate" style={{maxHeight: '60px', whiteSpace: 'normal', overflow: 'hidden'}}>
                                    {resultado.descripcion}
                                </p>
                                <button className="btn btn-sm btn-outline-primary w-100 mt-2">
                                    + Agregar a mi Biblioteca
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
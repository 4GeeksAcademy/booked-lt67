import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const FormularioReview = () => {
    const { theId } = useParams();
    const navigate = useNavigate();
    const { store } = useGlobalReducer();

    const [reviewsLibro, setReviewsLibro] = useState([]);
    const [libro, setLibro] = useState(null);
    
    // Estados del formulario
    const [texto, setTexto] = useState("");
    const [puntuacion, setPuntuacion] = useState(5);
    
    // Estado para controlar si estamos editando o creando
    const [miReviewExistente, setMiReviewExistente] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    
    const [loading, setLoading] = useState(true);

    const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
    const lectorIdActual = store.lector_id;

    const cargarDatos = useCallback(async () => {
        if (!theId) return;
        try {
            setLoading(true);
            const respLibro = await fetch(`${baseUrl}/api/libro/${theId}`);
            if (respLibro.ok) setLibro(await respLibro.json());

            const respReviews = await fetch(`${baseUrl}/api/reviews`);
            if (respReviews.ok) {
                const todasLasReviews = await respReviews.json();
                const filtradasPorLibro = todasLasReviews.filter(r => 
                    r.libro && Number(r.libro.id) === Number(theId)
                );

                const miReview = filtradasPorLibro.find(r => 
                    Number(r.lector_id) === Number(lectorIdActual)
                );

                // Solo guardamos la referencia, no llenamos el form automáticamente
                setMiReviewExistente(miReview);
                
                const ordenadas = [...filtradasPorLibro].sort((a, b) => {
                    if (Number(a.lector_id) === Number(lectorIdActual)) return -1;
                    return b.id - a.id;
                });
                setReviewsLibro(ordenadas);
            }
        } catch (error) {
            console.error("Error cargando reviews:", error);
        } finally {
            setLoading(false);
        }
    }, [theId, lectorIdActual, baseUrl]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    // Función para activar la edición desde la lista
    const activarEdicion = () => {
        if (miReviewExistente) {
            setTexto(miReviewExistente.texto);
            setPuntuacion(miReviewExistente.puntuacion);
            setModoEdicion(true);
            window.scrollTo(0, 0); // Sube la pantalla al formulario
        }
    };

    // Cancelar edición y limpiar form
    const cancelarEdicion = () => {
        setTexto("");
        setPuntuacion(5);
        setModoEdicion(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!lectorIdActual) return alert("Inicia sesión");

        // Usamos el ID de miReviewExistente si estamos en modoEdicion
        const url = modoEdicion ? `${baseUrl}/api/reviews/${miReviewExistente.id}` : `${baseUrl}/api/reviews`;
        const method = modoEdicion ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "lector_id": parseInt(lectorIdActual),
                    "libro_id": parseInt(theId),
                    "texto": texto,
                    "puntuacion": parseInt(puntuacion)
                })
            });

            if (response.ok) {
                alert("¡Guardado correctamente!");
                setModoEdicion(false);
                setTexto("");
                setPuntuacion(5);
                await cargarDatos(); 
            }
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm("¿Borrar reseña?")) return;
        try {
            const response = await fetch(`${baseUrl}/api/reviews/${reviewId}`, { method: 'DELETE' });
            if (response.ok) {
                alert("Eliminada");
                if (modoEdicion) cancelarEdicion();
                await cargarDatos();
            }
        } catch (error) { console.error(error); }
    };

    if (loading) return <div className="text-center mt-5"><h3>Cargando comunidad...</h3></div>;

    return (
        <div className="container mt-5">
            <button onClick={() => navigate(-1)} className="btn btn-outline-secondary mb-4 btn-sm">
                <i className="fas fa-arrow-left me-2"></i>Volver
            </button>

            <div className="row">
                {/* LADO IZQUIERDO: FORMULARIO */}
                <div className="col-md-5">
                    <div className="card shadow-sm border-0 p-3 bg-white">
                        <h2 className="text-primary h4">{libro?.nombre}</h2>
                        <p className="text-muted small">Autor: {libro?.nombre_autor}</p>
                        <hr />
                        
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="fw-bold m-0">
                                {modoEdicion ? "Editando mi opinión" : "Escribir nueva reseña"}
                            </h6>
                            {modoEdicion && (
                                <button className="btn btn-sm btn-link text-secondary p-0" onClick={cancelarEdicion}>
                                    Cancelar
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit}>
                            <textarea 
                                className="form-control mb-3" 
                                rows="4" 
                                placeholder="Escribe tu opinión aquí..."
                                value={texto} 
                                onChange={(e) => setTexto(e.target.value)} 
                                required 
                            />
                            <div className="d-flex align-items-center gap-3">
                                <label className="mb-0 small fw-bold">Nota:</label>
                                <input type="number" className="form-control" style={{width: "70px"}}
                                    min="0" max="10" value={puntuacion} 
                                    onChange={(e) => setPuntuacion(e.target.value)} required 
                                />
                                <button type="submit" className={`btn ${modoEdicion ? "btn-warning text-dark" : "btn-primary"} flex-grow-1 fw-bold`}>
                                    {modoEdicion ? "Actualizar Cambios" : "Publicar Review"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* LADO DERECHO: LISTA */}
                <div className="col-md-7">
                    <h4 className="mb-4">Comunidad ({reviewsLibro.length})</h4>
                    <div className="list-group">
                        {reviewsLibro.map(rev => {
                            const esMia = Number(rev.lector_id) === Number(lectorIdActual);
                            return (
                                <div key={rev.id} className={`list-group-item mb-3 rounded border-0 shadow-sm p-3 ${esMia ? "border-start border-4 border-primary bg-light" : ""}`}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className={`fw-bold ${esMia ? "text-primary" : ""}`}>
                                            {rev.nombre_lector} {esMia && <span className="badge bg-primary ms-1">Tú</span>}
                                        </span>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="badge bg-warning text-dark">{rev.puntuacion}/10</span>
                                            {esMia && (
                                                <>
                                                    {/* BOTÓN EDITAR QUE CARGA EL FORMULARIO */}
                                                    <button className="btn btn-sm btn-outline-primary border-0" onClick={activarEdicion} title="Editar">
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleDelete(rev.id)} title="Borrar">
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <p className="mt-2 mb-0 text-secondary italic small">"{rev.texto}"</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormularioReview;
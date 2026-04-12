import React, { useEffect, useState, useCallback } from "react"
import logoBookedUrl from "../assets/img/logo_booked.png";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Link, useNavigate } from "react-router-dom";
import BuscadorGoogleBooks from "../components/23_BuscadorGoogleBooks";

// 1. Componente TarjetaLibro con los nuevos campos de la API
const TarjetaLibro = ({ libro, esFavorito, loEstaLeyendo, alHacerClic, lectorId, esLector }) => (
    <div className="col-12 col-md-6 col-lg-4 mb-4">
        <div className="card h-100 shadow-sm border-0 overflow-hidden">
            <div className="row g-0 h-100">
                {/* Columna de la Imagen */}
                <div className="col-4 bg-light d-flex align-items-center justify-content-center">
                    <img 
                        src={libro.image_url || "https://via.placeholder.com/150x200?text=Sin+Portada"} 
                        className="img-fluid rounded-start" 
                        alt={libro.nombre}
                        style={{ objectFit: "cover", height: "100%", width: "100%" }}
                    />
                </div>
                
                {/* Columna de Información */}
                <div className="col-8">
                    <div className="card-body p-3 d-flex flex-column h-100">
                        <h6 className="fw-bold mb-1 text-truncate" title={libro.nombre}>{libro.nombre}</h6>
                        <p className="text-muted small mb-1">
                            <i className="fas fa-user me-1"></i>{libro.nombre_autor}
                        </p>
                        <div className="mb-2">
                            <span className="badge bg-info text-dark me-1" style={{ fontSize: '0.65rem' }}>{libro.genero}</span>
                            <span className="badge bg-light text-secondary border" style={{ fontSize: '0.65rem' }}>{libro.nombre_editorial}</span>
                        </div>

                        <div className="mt-auto">
                            <div className="d-grid gap-1 mb-1">
                                <Link to={`/ver_libro/${libro.id}`} className="btn btn-sm btn-success py-1" style={{ fontSize: '0.75rem' }}>
                                    <i className="fas fa-eye me-1"></i>Ver Detalles
                                </Link>
                            </div>

                            {esLector && (
                                <div className="d-flex gap-1">
                                    <button 
                                        className={`btn btn-sm py-1 flex-grow-1 ${loEstaLeyendo ? 'btn-warning' : 'btn-outline-warning'}`}
                                        style={{ fontSize: '0.7rem' }}
                                        onClick={() => alHacerClic(loEstaLeyendo ? `leyendo/libros/${lectorId}/${libro.id}` : `leyendo/libros`, loEstaLeyendo ? "DELETE" : "POST", loEstaLeyendo ? null : { lector_id: lectorId, libro_id: libro.id })}>
                                        {loEstaLeyendo ? "Leyendo" : "Leer"}
                                    </button>
                                    <button 
                                        className={`btn btn-sm py-1 flex-grow-1 ${esFavorito ? 'btn-danger' : 'btn-outline-danger'}`}
                                        style={{ fontSize: '0.7rem' }}
                                        onClick={() => alHacerClic(esFavorito ? `favoritos/libros/${lectorId}/${libro.id}` : `favoritos/libros`, esFavorito ? "DELETE" : "POST", esFavorito ? null : { lector_id: lectorId, libro_id: libro.id })}>
                                        <i className={`fa${esFavorito ? 's' : 'r'} fa-heart`}></i>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const Home = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    const lectorLogueado = store.auth_lector;
    const [db, setDb] = useState({ favoritos: [], leyendo: [], todos: [], loading: true });
    const api = `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")}/api`;

    const request = async (url, m = "GET", b = null) => {
        try {
            const res = await fetch(`${api}/${url}`, {
                method: m, headers: { "Content-Type": "application/json" },
                body: b ? JSON.stringify(b) : null
            });
            return res.ok ? await res.json() : null;
        } catch (e) { return null; }
    };

    const load = useCallback(async () => {
        const [f, l, t] = await Promise.all([
            store.lector_id ? request(`lector/${store.lector_id}/favoritos`) : Promise.resolve([]),
            store.lector_id ? request(`lector/${store.lector_id}/leyendo`) : Promise.resolve([]),
            request(`libro`)
        ]);
        setDb({ favoritos: f || [], leyendo: l || [], todos: t || [], loading: false });
    }, [store.lector_id]);

    const exec = async (u, m, b) => { if (await request(u, m, b)) load(); };

    const irAlLibro = (libroId) => {
        if (libroId) {
            load();
            navigate(`/ver_libro/${libroId}`);
        }
    };

    useEffect(() => { load(); }, [load]);

    return (
        <div className="text-center mt-5 container">
            <h1 className="display-4 fw-bold">Bienvenido a Booked!</h1>
            <p className="lead">
                <img src={logoBookedUrl} style={{ width: "350px", height: "auto" }} className="img-fluid mb-4" alt="Logo Booked" />
            </p>

            <div className="bg-light p-4 rounded-3 shadow-sm mb-5">
                <div className="w-75 mx-auto">
                    <BuscadorGoogleBooks onLibroAgregado={irAlLibro} />
                </div>
                <h6 className="fw-bold mt-3 text-secondary">Busca y añade libros a la biblioteca comunitaria</h6>
            </div>

            <div className="row text-start">
                <h3 className="fw-bold mb-4 border-bottom pb-2">
                    <i className="fas fa-book-reader me-2 text-primary"></i>Explorar Biblioteca
                </h3>
                {db.loading ? (
                    <div className="text-center w-100 p-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-2">Cargando tesoros literarios...</p>
                    </div>
                ) : db.todos.length > 0 ? (
                    db.todos.map(l => (
                        <TarjetaLibro
                            key={l.id}
                            libro={l}
                            lectorId={store.lector_id}
                            alHacerClic={exec}
                            esLector={lectorLogueado}
                            esFavorito={db.favoritos.some(f => (f.libro?.id || f.libro_id) === l.id)}
                            loEstaLeyendo={db.leyendo.some(ley => (ley.libro?.id || ley.libro_id) === l.id)}
                        />
                    ))
                ) : (
                    <div className="text-center p-5 text-muted w-100">
                        <p className="h5">La biblioteca está vacía.</p>
                        <p>¡Sé el primero en añadir un libro usando el buscador de arriba!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
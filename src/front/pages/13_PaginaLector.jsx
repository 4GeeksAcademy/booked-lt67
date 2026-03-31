import React, { useEffect, useState, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import BotonSeguirComunidad from "./13_NuevoSeguidor_Lector"; 
import BotonAgregarLibroExistente from "./13_NuevoLibro_Lector"; 

const PaginaLector = () => {
    const { store } = useGlobalReducer();
    const [datoslector, setDatoslector] = useState(null);
    const [libros, setLibros] = useState([]); // Mis favoritos
    const [todosLosLibros, setTodosLosLibros] = useState([]); // Catálogo global
    const [loading, setLoading] = useState(true);

    const lectorId = store.lector_id;
    const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

    const cargarPanel = useCallback(async () => {
        if (!lectorId) return;
        try {
            setLoading(true);
            
            // 1. Datos del perfil (Aquí vienen seguidores y siguiendo)
            const respLector = await fetch(`${baseUrl}/api/lector/${lectorId}`);
            if (respLector.ok) setDatoslector(await respLector.json());

            // 2. Mis libros favoritos
            const respLibrosFav = await fetch(`${baseUrl}/api/lector/${lectorId}/favoritos`);
            if (respLibrosFav.ok) setLibros(await respLibrosFav.json());

            // 3. Catálogo Global
            const respTodos = await fetch(`${baseUrl}/api/libro`);
            if (respTodos.ok) setTodosLosLibros(await respTodos.json());

        } catch (error) {
            console.error("Error cargando el panel:", error);
        } finally {
            setLoading(false);
        }
    }, [lectorId, baseUrl]);

    const handleRemoveLibro = async (libroId) => {
        try {
            const resp = await fetch(`${baseUrl}/api/favoritos/libros/${lectorId}/${libroId}`, { method: 'DELETE' });
            if (resp.ok) cargarPanel();
        } catch (error) { console.error("Error:", error); }
    };

    const handleUnfollow = async (relacionId) => {
        try {
            const resp = await fetch(`${baseUrl}/api/unfollow/${relacionId}`, { method: 'DELETE' });
            if (resp.ok) cargarPanel(); 
        } catch (error) { console.error("Error:", error); }
    };

    useEffect(() => {
        if (store.auth_lector) cargarPanel();
    }, [store.auth_lector, cargarPanel]);

    if (!store.auth_lector) return <Navigate to="/login_lector" />;
    if (loading && !datoslector) return <div className="text-center mt-5"><h3>Cargando...</h3></div>;

    return (
        <div className="container mt-5">
            <div className="mb-4 border-bottom pb-3 text-center">
                <h1>Panel de {datoslector?.nombre}</h1>
            </div>

            <div className="row">
                {/* COLUMNA IZQUIERDA: Perfil, Siguiendo y SEGUIDORES */}
                <div className="col-md-4">
                    <div className="card shadow-sm mb-4 border-0 bg-light">
                        <div className="card-body">
                            <h5 className="card-title text-success">Mi Perfil</h5>
                            <p className="mb-1 small"><strong>Siguiendo:</strong> {datoslector?.siguiendo?.length || 0}</p>
                            <p className="mb-1 small"><strong>Seguidores:</strong> {datoslector?.seguidores?.length || 0}</p>
                        </div>
                    </div>

                    <BotonSeguirComunidad onFollowSuccess={cargarPanel} siguiendoActualmente={datoslector?.siguiendo} />

                    {/* LISTA DE PERSONAS QUE SIGO */}
                    <div className="card shadow-sm mb-4 border-0">
                        <div className="card-body">
                            <h6 className="card-title fw-bold text-primary">Siguiendo</h6>
                            <div style={{maxHeight: "150px", overflowY: "auto"}}>
                                {datoslector?.siguiendo?.map(s => (
                                    <div key={s.relacion_id} className="d-flex justify-content-between align-items-center mb-2 small border-bottom pb-1">
                                        <span>{s.nombre_seguido}</span>
                                        <button className="btn btn-sm text-danger border-0 p-0" onClick={() => handleUnfollow(s.relacion_id)}>
                                            <i className="fas fa-user-minus"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN RESTAURADA: MIS SEGUIDORES (Quienes me siguen a mí) */}
                    <div className="card shadow-sm mb-4 border-0">
                        <div className="card-body">
                            <h6 className="card-title fw-bold text-info">Mis Seguidores</h6>
                            <div style={{maxHeight: "150px", overflowY: "auto"}}>
                                {datoslector?.seguidores && datoslector.seguidores.length > 0 ? (
                                    datoslector.seguidores.map(f => (
                                        <div key={f.relacion_id} className="mb-2 small border-bottom pb-1">
                                            <i className="fas fa-user-check me-2 text-muted"></i>
                                            {f.nombre_seguidor}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted tiny">Aún no tienes seguidores.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: BIBLIOTECA GLOBAL */}
                <div className="col-md-8">
                    <h3 className="border-bottom pb-2">Mis Libros Favoritos</h3>
                    <BotonAgregarLibroExistente onAddSuccess={cargarPanel} librosActuales={libros.map(f => f.libro)} />
                    
                    <div className="row mb-5">
                        {libros.length > 0 ? libros.map(item => (
                            <div key={item.id} className="col-md-6 mb-3">
                                <div className="card h-100 border-start border-4 border-success shadow-sm">
                                    <div className="card-body py-2 d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="mb-0">{item.libro?.nombre}</h6>
                                            <small className="text-muted">{item.libro?.genero}</small>
                                        </div>
                                        <button className="btn btn-sm text-danger border-0" onClick={() => handleRemoveLibro(item.libro?.id)}>
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : <p className="text-muted small ms-3">No has añadido libros a tu lista.</p>}
                    </div>

                    <h3 className="border-bottom pb-2">Explorar Biblioteca</h3>
                    <div className="row">
                        {todosLosLibros.map(libro => {
                            const yaLoTengo = libros.some(f => f.libro?.id === libro.id);

                            return (
                                <div key={libro.id} className="col-md-6 mb-4">
                                    <div className="card h-100 shadow-sm border-0">
                                        <div className="card-body">
                                            <h5 className="card-title text-primary mb-1">{libro.nombre}</h5>
                                            <p className="text-muted small mb-3">Autor: {libro.nombre_autor}</p>
                                            
                                            <div className="d-grid gap-2">
                                                <Link 
                                                    to={`/pagina_lector/${libro.id}/reviews`} 
                                                    className="btn btn-sm btn-outline-secondary"
                                                >
                                                    <i className="fas fa-star me-2 text-warning"></i>Ver Opiniones
                                                </Link>

                                                {!yaLoTengo ? (
                                                    <button 
                                                        className="btn btn-sm btn-primary" 
                                                        onClick={async () => {
                                                            const resp = await fetch(`${baseUrl}/api/favoritos/libros`, {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ lector_id: lectorId, libro_id: libro.id })
                                                            });
                                                            if (resp.ok) cargarPanel();
                                                        }}
                                                    >
                                                        <i className="fas fa-plus me-2"></i>Añadir a mi lista
                                                    </button>
                                                ) : (
                                                    <span className="badge bg-success py-2">En mi biblioteca</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaginaLector;
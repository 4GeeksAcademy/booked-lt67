import React, { useEffect, useState, } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const Seguidores = () => {
    const [lectores, setLectores] = useState([]);
    const [cargando, setCargando] = useState(true);

    const { store, dispatch } = useGlobalReducer()

    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }

    const cargarTodo = () => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}api/lector/`)
            .then(res => res.json())
            .then(data => {
                setLectores(data);
                setCargando(false);
            })
            .catch(error => console.error("Error:", error));
    };

    useEffect(() => {
        cargarTodo();
    }, []);


    const handleUnfollow = (idRelacion) => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}api/unfollow/${idRelacion}`, { method: "DELETE" })
            .then(() => cargarTodo());
    };

    if (cargando) return <div className="container mt-5 text-center"><div className="spinner-border"></div></div>;

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Tabla de Seguidores</h1>
                <Link to="/nuevo_seguidor" className="btn btn-primary">Agregar Seguidor</Link>
            </div>

            <div className="row g-4">
                {lectores.map((lector) => (
                    <div className="col-md-6" key={lector.id}>
                        <div className="card shadow-sm h-100">
                            <div className="card-header text-dark">
                                <h5 className="m-0">{lector.username}</h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    {/* Sub-sección: Siguiendo */}
                                    <div className="col-6 border-end">
                                        <h6 className="text-primary small fw-bold">SIGUE A:</h6>
                                        {lector.siguiendo && lector.siguiendo.length > 0 ? (
                                            lector.siguiendo.map(s => (
                                                <div key={s.relacion_id} className="d-flex justify-content-between align-items-center mb-1 p-1 bg-light rounded">
                                                    <span className="small">{s.nombre_seguido}</span>
                                                    <div className="d-flex gap-1">
                                                        <Link to={`/editar_seguido/${s.relacion_id}`} className="text-warning">Editar</Link>
                                                        <span onClick={() => handleUnfollow(s.relacion_id)} className="text-danger" style={{ cursor: 'pointer' }}>Dejar de Seguir</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : <span className="text-muted small">A nadie</span>}
                                    </div>

                                    <div className="col-6">
                                        <h6 className="text-success small fw-bold">LO SIGUEN:</h6>
                                        {lector.seguidores && lector.seguidores.length > 0 ? (lector.seguidores.map(f => (
                                            <div key={f.relacion_id} className="mb-1 p-1 bg-light rounded">
                                                <span className="small">{f.nombre_seguidor}</span>
                                            </div>
                                        ))
                                        ) : <span className="text-muted small">Nadie</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="d-flex justify-content-center">
                <Link to={"/admin_home/"} className="m-3 btn btn-sm btn-outline-primary">Volver al Dashboard</Link>
            </div>
        </div>
    );
};

export default Seguidores;
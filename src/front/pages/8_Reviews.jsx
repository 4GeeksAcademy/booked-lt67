import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const Seguidores = () => {
    const [lectores, setLectores] = useState([]);
    const [cargando, setCargando] = useState(true);

    const { store } = useGlobalReducer();

    // --- 1. Definimos la base limpia ---
    const API_BASE = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "") + "/api";

   /*  if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }
 */
    // --- 2. Función de carga blindada ---
    const cargarTodo = () => {
        fetch(`${API_BASE}/lector/`)
            .then(res => {
                if (!res.ok) throw new Error("Error al cargar la red de seguidores");
                return res.json();
            })
            .then(data => {
                setLectores(data);
                setCargando(false);
            })
            .catch(error => {
                console.error("Error en cargarTodo:", error);
                setCargando(false);
            });
    };

    useEffect(() => {
        cargarTodo();
    }, [API_BASE]); // Añadimos API_BASE a dependencias


    // --- 3. Borrado de relación blindado ---
    const handleUnfollow = (idRelacion) => {
        if (!window.confirm("¿Seguro que quieres eliminar este seguimiento?")) return;

        fetch(`${API_BASE}/unfollow/${idRelacion}`, { method: "DELETE" })
            .then(res => {
                if (res.ok) {
                    console.log("Relación eliminada");
                    cargarTodo();
                } else {
                    throw new Error("No se pudo realizar el unfollow");
                }
            })
            .catch(error => console.error("Error al eliminar relación:", error));
    };

    if (cargando) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1>Reviews</h1>
                    <Link to="/nueva_review" className="btn btn-primary">Hacer una Nueva Review</Link>
                </div>

                <div className="row g-4">
                    {reviews.map((rev) => (
                        <div className="col-md-4" key={rev.id}>
                            <div className="card p-3 shadow-sm">
                                <h5 className="mb-3">{rev.nombre_lector}</h5>
                                <h5 className="mb-3">{rev.libro.nombre}</h5>
                                <div className="d-flex flex-wrap gap-2">
                                    <Link to={"/ver_review/" + rev.id} className="btn btn-sm btn-outline-primary">Ver</Link>
                                    <Link to={"/editar_review/" + rev.id} className="btn btn-sm btn-outline-primary">Editar</Link>
                                    <button onClick={() => deleteReviews(rev.id)} className="btn btn-sm btn-danger">Eliminar</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="d-flex justify-content-center">
                    <Link to={"/admin_home/"} className="m-3 btn btn-sm btn-outline-primary">Volver al Dashboard</Link>
                </div>
            </div>

        </>
    )
}

export default Reviews

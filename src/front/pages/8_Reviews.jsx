import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer";

const Reviews = () => {
    const [reviews, setReviews] = useState([])
    const { store } = useGlobalReducer()

    // --- 1. Blindaje de la base de la API ---
    const API_BASE = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "") + "/api";

    /* Si decides reactivar la protección:
    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    } */

    // --- 2. GET Reviews blindado ---
    function getReviews() {
        fetch(`${API_BASE}/reviews/`)
            .then((response) => {
                if (!response.ok) throw new Error("Error al obtener reviews");
                return response.json();
            })
            .then((data) => setReviews(data))
            .catch(err => console.error(err));
    }

    useEffect(() => {
        getReviews()
    }, [])

    // --- 3. DELETE Review blindado ---
    function deleteReviews(idToDelete) {
        if (!window.confirm("¿Estás seguro de que deseas eliminar esta review?")) return;

        const requestOptions = {
            method: "DELETE",
            redirect: "follow"
        };

        fetch(`${API_BASE}/reviews/${idToDelete}`, requestOptions)
            .then((response) => {
                if (response.ok) {
                    console.log("Review eliminada con éxito");
                    getReviews(); // Refrescamos la lista
                } else {
                    throw new Error("No se pudo eliminar");
                }
            })
            .catch(err => console.error("Error al borrar:", err));
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
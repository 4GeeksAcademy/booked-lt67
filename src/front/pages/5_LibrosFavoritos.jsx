import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const LibrosFavoritos = () => {

    const { lectorId } = useParams();
    const [librosFavoritos, setLibrosFavoritos] = useState([])

    function getLibrosFavoritos() {
        fetch(`${import.meta.env.VITE_BACKEND_URL}api/lector/${lectorId}/favoritos`)
            .then((response) => response.json())
            .then((data) => {
                if (Array.isArray(data)) setLibrosFavoritos(data);
                else setLibrosFavoritos([]);
            });
    }

    useEffect(() => {
        console.log("se cargaron los libros favoritos")
        getLibrosFavoritos()
    }, [])

    function deleteLibroFavorito(idToDelete) {
        console.log("se va a eliminar el LibroFavorito" + idToDelete)
        const requestOptions = {
            method: "DELETE",
            redirect: "follow"
        };

        fetch(`${import.meta.env.VITE_BACKEND_URL}api/favoritos/libros/${lectorId}/${idToDelete}`, requestOptions)
            .then((response) => {
                if (response.ok) getLibrosFavoritos();
            })
            .then((result) => {
                console.log(result)
                getLibrosFavoritos()
            })

    }

    return (
        <>
            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1>Libros Favoritos</h1>
                    <Link to={`/lector/${lectorId}/favoritos/agregar`} className="btn btn-success me-2">Añadir Nuevo Libro Favorito</Link>
                    <Link to="/lector" className="btn btn-primary">Volver a Lector</Link>
                </div>
                <div className="row g-4">
                    {librosFavoritos.map((fav) => (
                        <div className="col-md-4" key={fav.id}>
                            <div className="card p-3 shadow-sm">
                                <h5 className="mb-3">{fav.libro?.nombre || "Sin título"}</h5>
                                <div className="d-flex flex-wrap gap-2">
                                    <Link to={"/ver_libro/" + fav.libro?.id} className="btn btn-sm btn-outline-primary">Ver</Link>
                                    <Link to={`/lector/${lectorId}/favoritos/editar/${fav.id}`} className="btn btn-sm btn-outline-warning">Editar</Link>
                                    <button onClick={() => deleteLibroFavorito(fav.libro?.id)} className="btn btn-sm btn-danger">Eliminar</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default LibrosFavoritos
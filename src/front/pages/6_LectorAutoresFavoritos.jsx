import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer";

const LectorAutoresFavoritos = () => {

    const [lectorAutoresFavoritos, setLectorAutoresFavoritos] = useState([])
    const { store, dispatch } = useGlobalReducer()
    
        if (!store.auth_admin) {
            return <Navigate to="/login_admin" />;
        }

    function getLectorAutoresFavoritos() {
        fetch(import.meta.env.VITE_BACKEND_URL + "api/lector_autores_favoritos/")
            .then((response) => response.json())
            .then((data) => setLectorAutoresFavoritos(data))
    }

    useEffect(() => {
        console.log("se cargaron las autores")
        getLectorAutoresFavoritos()
    }, [])

    function deleteLectorAutoresFavoritos(idToDelete) {
        console.log("se va a eliminar la autor" + idToDelete)
        const requestOptions = {
            method: "DELETE",
            redirect: "follow"
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/lector_autores_favoritos/" + idToDelete, requestOptions)
            .then((response) => response.text())
            .then((result) => {
                console.log(result)
                getLectorAutoresFavoritos()
            })

    }

    return (
        <>
            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1>lector_autores_favoritos</h1>
                    <Link to="/nuevo_lector_autores_favoritos" className="btn btn-primary">Nuevo lector_autores_favoritos</Link>
                </div>

                <div className="row g-4">
                    {lectorAutoresFavoritos.map((fav) => (
                        <div className="col-md-4" key={fav.id}>
                            <div className="card p-3 shadow-sm">
                                <h5 className="mb-3">{fav.nombre_lector}</h5>
                                <h5 className="mb-3">{fav.nombre_autor}</h5>
                                <div className="d-flex flex-wrap gap-2">
                                    <Link to={"/ver_lector_autores_favoritos/" + fav.id} className="btn btn-sm btn-outline-primary">Ver</Link>
                                    <Link to={"/editar_lector_autores_favoritos/" + fav.id} className="btn btn-sm btn-outline-primary">Editar</Link>
                                    <button onClick={() => deleteLectorAutoresFavoritos(fav.id)} className="btn btn-sm btn-danger">Eliminar</button>
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

export default LectorAutoresFavoritos

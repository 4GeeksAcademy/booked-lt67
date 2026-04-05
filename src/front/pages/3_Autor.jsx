import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer";

const Autor = () => {

    const [autores, setautores] = useState([])
    const { store, dispatch } = useGlobalReducer()

    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }


    function getAutores() {
        fetch(import.meta.env.VITE_BACKEND_URL + "api/autor/")
            .then((response) => response.json())
            .then((data) => setautores(data))
    }

    useEffect(() => {
        console.log("se cargaron las autores")
        getAutores()
    }, [])


    function deleteautor(idToDelete) {
        console.log("se va a eliminar la autor" + idToDelete)
        const requestOptions = {
            method: "DELETE",
            redirect: "follow"
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/autor/" + idToDelete, requestOptions)
            .then((response) => response.text())
            .then((result) => {
                console.log(result)
                getAutores()
            })

    }

    /* const imagenFinal = autor.foto || `https://ui-avatars.com/api/?name=${autor.nombre}+${autor.apellido}&background=random`; */

    return (
        <>
            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1>autor</h1>
                    <Link to="/nuevo_autor" className="btn btn-primary">Nuevo autor</Link>
                </div>

                <div className="row g-4">
                    {autores.map((autor) => (
                        <div className="col-md-4" key={autor.id}>
                            <div className="card p-3 shadow-sm">
                                <h5 className="mb-3">{autor.nombre} {autor.apellido}</h5>
                                <img
                                    src={autor.foto}
                                    alt={autor.nombre}
                                    className="img-thumbnail"
                                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                                />

                                <div className="d-flex flex-wrap gap-2">
                                    <Link to={"/ver_autor/" + autor.id} className="btn btn-sm btn-outline-primary">Ver</Link>
                                    <Link to={"/editar_autor/" + autor.id} className="btn btn-sm btn-outline-primary">Editar</Link>
                                    <button onClick={() => deleteautor(autor.id)} className="btn btn-sm btn-danger">Eliminar</button>
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

export default Autor
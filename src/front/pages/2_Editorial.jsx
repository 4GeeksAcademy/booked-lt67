import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer";

const Editorial = () => {

    const [editoriales, setEditoriales] = useState([])
    const { store, dispatch } = useGlobalReducer()

    function getEditoriales() {
        fetch(import.meta.env.VITE_BACKEND_URL + "api/editorial/")
            .then((response) => response.json())
            .then((data) => setEditoriales(data))
    }

    if (!store.auth_admin) {
                return <Navigate to="/login_admin" />;
            }

    useEffect(() => {
        console.log("se cargaron las editoriales")
        getEditoriales()
    }, [])


    // acá no se si dejarlo igual

    function deleteEditorial(idToDelete) {
        console.log("se va a eliminar la editorial" + idToDelete)
        const requestOptions = {
            method: "DELETE",
            redirect: "follow"
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/editorial/" + idToDelete, requestOptions)
            .then((response) => response.text())
            .then((result) => {
                console.log(result)
                getEditoriales()
            })

    }

    return (
        <>
            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1>EDITORIAL</h1>
                    <Link to={"/all_post_editorial/"} className="btn btn-sm btn-outline-primary">Ver Publicaciones</Link>
                    <Link to="/nueva_editorial" className="btn btn-primary">Nueva Editorial</Link>
                </div>

                <div className="row g-4">
                    {editoriales.map((editorial) => (
                        <div className="col-md-4" key={editorial.id}>
                            <div className="card p-3 shadow-sm">
                                <h5 className="mb-3">{editorial.nombre}</h5>
                                <div className="d-flex flex-wrap gap-2">
                                    <Link to={"/ver_editorial/" + editorial.id} className="btn btn-sm btn-outline-primary">Ver</Link>
                                    <Link to={"/editar_editorial/" + editorial.id} className="btn btn-sm btn-outline-primary">Editar</Link>
                                    <Link to={"/post_editorial/" + editorial.id} className="btn btn-sm btn-outline-primary">Ver Posts</Link>
                                    <button onClick={() => deleteEditorial(editorial.id)} className="btn btn-sm btn-danger">Eliminar</button>
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

export default Editorial
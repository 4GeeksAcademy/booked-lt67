import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer";

const Lector = () => {

    const { store, dispatch } = useGlobalReducer()
    const [lectores, setLectores] = useState([])

    if (!store.auth_admin) {
            return <Navigate to="/login_admin" />;
        }

    function getLectores() {
        fetch(import.meta.env.VITE_BACKEND_URL + "api/lector/")
            .then((response) => response.json())
            .then((data) => setLectores(data))
    }

    useEffect(() => {
        console.log("se cargaron los lectores")
        getLectores()
    }, [])

    function deleteLector(idToDelete) {
        console.log("se va a eliminar el lector" + idToDelete)
        const requestOptions = {
            method: "DELETE",
            redirect: "follow"
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/lector/" + idToDelete, requestOptions)
            .then((response) => response.text())
            .then((result) => {
                console.log(result)
                getLectores()
            })

    }

    

    return (
        <>

            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1>Lector</h1>
                    <Link to="/nuevo_lector" className="btn btn-primary">Nuevo Lector</Link>
                </div>

                <div className="row g-4">
                    {lectores.map((lector) => (
                        <div className="col-md-4" key={lector.id}>
                            <div className="card p-3 shadow-sm">
                                <h5 className="mb-3">{lector.nombre}</h5>
                                <div className="d-flex flex-wrap gap-2">
                                    <Link to={"/ver_lector/" + lector.id} className="btn btn-sm btn-outline-primary">Ver</Link>
                                    <Link to={"/editar_lector/" + lector.id} className="btn btn-sm btn-outline-primary">Editar</Link>
                                    <button onClick={() => deleteLector(lector.id)} className="btn btn-sm btn-danger">Eliminar</button>
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

export default Lector
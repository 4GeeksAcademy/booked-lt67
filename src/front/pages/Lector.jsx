import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Lector = () => {

    const [lectores, setLectores] = useState([])

    function getLectores(){
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

        fetch(import.meta.env.VITE_BACKEND_URL + "api/lector/"+idToDelete, requestOptions)
            .then((response) => response.text())
            .then((result) => {
                console.log(result)
                getLectores() 
            })
                
    }

    return (
        <>
            <Link to="/nuevo_lector">
                <button className="btn btn-primary">Nuevo Lector</button>
            </Link>
            <h1>LECTOR</h1>
            {lectores.map((lector) =>
                <p key={lector.id}>
                    {lector.username}
                    <Link to={"/ver_lector/" + lector.id}>
                        <button className="btn btn-primary">Ver Lector</button>
                    </Link>
                    <Link to={"/editar_lector/" + lector.id}>
                        <button className="btn btn-primary">Editar Lector</button>
                    </Link>
                    <button onClick={() => deleteLector(lector.id)} className="btn btn-danger">Eliminar Lector</button>

                </p>)}
        </>
    )
}

export default Lector
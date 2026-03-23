import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Autor = () => {

    const [autores, setautores] = useState([])

    function getAutores(){
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
    
            fetch(import.meta.env.VITE_BACKEND_URL + "api/autor/"+idToDelete, requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    console.log(result)
                    getAutores() 
                })
                    
        }

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
                                    <h5 className="mb-3">{autor.nombre}</h5>
                                    <div className="d-flex flex-wrap gap-2">
                                        <Link to={"/ver_autor/" + autor.id} className="btn btn-sm btn-outline-primary">Ver</Link>
                                        <Link to={"/editar_autor/" + autor.id} className="btn btn-sm btn-outline-primary">Editar</Link>
                                        <button onClick={() => deleteautor(autor.id)} className="btn btn-sm btn-danger">Eliminar</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
 
                </>
    )
}

export default Autor
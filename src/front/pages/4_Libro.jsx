import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Libro = () => {

    const [libros, setLibros] = useState([])

    function getLibros(){
            fetch(import.meta.env.VITE_BACKEND_URL + "api/libro/")
                .then((response) => response.json())
                .then((data) => setLibros(data))
        }
    
        useEffect(() => {
            console.log("se cargaron los libros")
            getLibros()
        }, [])


        function deletelibro(idToDelete) {
            console.log("se va a eliminar el libro" + idToDelete)
            const requestOptions = {
                method: "DELETE",
                redirect: "follow"
            };
    
            fetch(import.meta.env.VITE_BACKEND_URL + "api/libro/"+idToDelete, requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    console.log(result)
                    getLibros() 
                })
                    
        }

    return (
                <>
                <div className="container mt-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1>Libros</h1>
                        <Link to="/nuevo_libro" className="btn btn-primary">Nuevo Libro</Link>
                    </div>

                    <div className="row g-4"> 
                        {libros.map((libro) => (
                            <div className="col-md-4" key={libro.id}>
                                <div className="card p-3 shadow-sm">
                                    <h5 className="mb-3">{libro.nombre}</h5>
                                    <div className="d-flex flex-wrap gap-2">
                                        <Link to={"/ver_libro/" + libro.id} className="btn btn-sm btn-outline-primary">Ver</Link>
                                        <Link to={"/editar_libro/" + libro.id} className="btn btn-sm btn-outline-primary">Editar</Link>
                                        <button onClick={() => deletelibro(libro.id)} className="btn btn-sm btn-danger">Eliminar</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
 
                </>
    )
}

export default Libro
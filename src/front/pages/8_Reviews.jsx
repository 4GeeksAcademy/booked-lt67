import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Reviews = () => {

    const [reviews, setReviews] = useState([])

    function getReviews(){
            fetch(import.meta.env.VITE_BACKEND_URL + "api/reviews/")
                .then((response) => response.json())
                .then((data) => setReviews(data))
        }
    
        useEffect(() => {
            console.log("se cargaron las autores")
            getReviews()
        }, [])

        function deleteReviews(idToDelete) {
            console.log("se va a eliminar la autor" + idToDelete)
            const requestOptions = {
                method: "DELETE",
                redirect: "follow"
            };
    
            fetch(import.meta.env.VITE_BACKEND_URL + "api/reviews/"+idToDelete, requestOptions)
                .then((response) => response.text())
                .then((result) => {
                    console.log(result)
                    getReviews() 
                })
                    
        }

    return (
                <>
                <div className="container mt-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1>Reviews</h1>
                        <Link to="/nueva_review" className="btn btn-primary">Nuevo lector_autores_favoritos</Link>
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
                </div>
 
                </>
    )
}

export default Reviews

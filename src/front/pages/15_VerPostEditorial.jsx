import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // Importante para capturar el ID


const VerPostEditorial = () => {
    const { theId } = useParams();
    const [posts, setPosts] = useState([]);

    const fetchPostsByEditorial = async () => {
        try {

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/posteditorial/editorial/${theId}`);
            if (response.ok) {
                const data = await response.json();
                setPosts(data);
            }
        } catch (error) {
            console.error("Error cargando posts:", error);
        }
    };

    useEffect(() => {
        if (theId) {
            fetchPostsByEditorial();
        }
    }, [theId]);

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>Publicaciones de la Editorial {posts.length > 0 ? posts[0].nombre_editorial : "la Editorial"}</h3>
                <Link to={`/nueva_publicacion_editorial/${theId}`} className="btn btn-success">
                    <i className="fas fa-plus"></i> Crear Nuevo Post
                </Link>
            </div>

            <hr />
            {posts.length === 0 ? (
                <p>Esta editorial aún no tiene publicaciones.</p>
            ) : (
                posts.map(post => (
                    <div key={post.id} className="col-12  mb-3 shadow-sm">
                        <div className="card-body m-1">
                            <p>{post.texto}</p>
                            <div>
                                <button className="btn btn-outline-primary btn-sm me-2">
                                    <i className="">Editar</i>
                                </button>
                                <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => handleDelete(post.id)}
                                >
                                    <i className="">Borrar</i>
                                </button>
                            </div>
                            <small className="text-muted">{post.fecha}</small>
                            <hr />
                        </div>
                    </div>
                ))
            )}
            <Link to="/pagina_editorial">
                <button className="btn btn-secondary m-3">Volver a Editoriales</button>
            </Link>
        </div>
    );
};

export default VerPostEditorial;
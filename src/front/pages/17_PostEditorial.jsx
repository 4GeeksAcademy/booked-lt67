import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { Link } from "react-router-dom";

const PostEditorial = () => {
    const { store, dispatch } = useGlobalReducer();
    const [postsEditorial, setPostsEditorial] = useState([]);
    const [postsAutor, setPostsAutor] = useState([]);
    const [loading, setLoading] = useState(true);


    const fetchPosts = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/posteditorial`);
            if (response.ok) {
                const data = await response.json();
                setPostsEditorial(data);
            }
        } 

        catch (error) {
            console.error("Error cargando posts:", error);}

        try {const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/postautor`);
            if (response.ok) {
                const data = await response.json();
                setPostsAutor(data);
            }}

        catch (error) {
            console.error("Error cargando posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);


    if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;

    return (
    <div className="container mt-5">
        <div className="d-flex justify-content-center align-items-center mb-4">
            <h1>Publicaciones</h1>
        </div>

        {/* Contenedor principal de las dos columnas */}
        <div className="row">
            
            {/* --- COLUMNA DE EDITORIALES --- */}
            <div className="col-md-12"> 
                <h3 className="mb-4 text-secondary text-center">Editoriales</h3>
                {postsEditorial.length === 0 ? (
                    <div className="alert alert-info">No hay publicaciones de editoriales.</div>
                ) : (
                    <div className="row">
                        {postsEditorial.map((post) => (
                            <div key={post.id} className="col-12 mb-3">
                                <div className="card shadow-sm border-left-primary">
                                    <div className="card-body">
                                        <h6 className="card-subtitle mb-2 text-muted">
                                            <i className="far fa-calendar-alt me-2"></i>
                                            {post.fecha}
                                        </h6>
                                        <p className="card-text mt-2">{post.texto}</p>
                                        <small className="fw-bold text-primary">Ed: {post.nombre_editorial}</small>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    </div>
);
};

export default PostEditorial;
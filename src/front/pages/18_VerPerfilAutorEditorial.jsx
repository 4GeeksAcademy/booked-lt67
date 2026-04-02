import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { Link } from "react-router-dom";

const VerPerfilAutorEditorial = () => {
    const { store, dispatch } = useGlobalReducer();
    const [editoriales, setEditoriales] = useState([]);
    const [autores, setAutores] = useState([]);
    const [loading, setLoading] = useState(true);


    const fetchPosts = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/editorial`);
            if (response.ok) {
                const data = await response.json();
                setEditoriales(data);
            }
        } 

        catch (error) {
            console.error("Error cargando posts:", error);}

        try {const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/autor`);
            if (response.ok) {
                const data = await response.json();
                setAutores(data);
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

        <div className="row">
            
            <div className="col-md-6 border-end"> 
                <h3 className="mb-4 text-secondary text-center">Editoriales</h3>
                {editoriales.length === 0 ? (
                    <div className="alert alert-info">No hay publicaciones de editoriales.</div>
                ) : (
                    <div className="row">
                    {editoriales.map((post) => (
                        <div key={post.id} className="col-12 mb-3">
                            <div className="card shadow-sm border-left-primary">
                                <div className="card-body">
                                    <div className="d-flex align-items-center gap-3">
                                        <p className="fw-bold card-text mt-2">{post.nombre}</p>                                        
                                        <Link to={"/ver_editorial_free/" + post.id} className="btn btn-sm btn-outline-primary">Ver</Link>                                        
                                    </div>
                                    <small className="fw-bold text-primary">País: {post.pais}</small>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                )}
            </div>

            <div className="col-md-6">
                <h3 className="mb-4 text-secondary text-center">Autores</h3>
                {autores.length === 0 ? (
                    <div className="alert alert-info">No hay publicaciones de autores.</div>
                ) : (
                    <div className="row">
                        {autores.map((post) => (
                            <div key={post.id} className="col-12 mb-3">
                                <div className="card shadow-sm border-left-success">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center gap-3">
                                            <p className="fw-bold card-text mt-2">{post.nombre} {post.apellido}</p>                                  
                                            <Link to={"/ver_autor_free/" + post.id} className="btn btn-sm btn-outline-primary">Ver</Link>
                                        </div>
                                        <small className="fw-bold text-primary">País: {post.pais}</small>      
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

export default VerPerfilAutorEditorial;
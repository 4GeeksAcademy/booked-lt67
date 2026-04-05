import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { Link } from "react-router-dom";

const TodosLosPostEditorial = () => {
    const { store, dispatch } = useGlobalReducer();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);


    const fetchPosts = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/posteditorial`);
            if (response.ok) {
                const data = await response.json();
                setPosts(data);
            }
        } catch (error) {
            console.error("Error cargando posts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm("¿Estás seguro de eliminar este post?")) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/posteditorial/${id}`, {
                method: "DELETE"
            });
            if (response.ok) {
                setPosts(posts.filter(p => p.id !== id));
            }
        } catch (error) {
            alert("No se pudo eliminar el post");
        }
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border"></div></div>;

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Publicaciones</h1>
                <Link to="/nueva_publicacion_editorial" className="btn btn-success">
                    <i className="fas fa-plus"></i> Crear Nuevo Post
                </Link>
            </div>

            {posts.length === 0 ? (
                <div className="alert alert-info">Aún no has realizado ninguna publicación.</div>
            ) : (
                <div className="row">
                    {posts.map((post) => (
                        <div key={post.id} className="col-12 mb-3">
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between">
                                        <h6 className="card-subtitle mb-2 text-muted">
                                            <i className="far fa-calendar-alt me-2"></i>
                                            {post.fecha}
                                        </h6>
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
                                    </div>
                                    <p className="card-text mt-2">{post.texto}</p>
                                    <small className="text-primary">Publicado por: {post.nombre_editorial}</small>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="d-flex justify-content-center">
                <Link to={"/pagina_editorial/"} className="m-3 btn btn-sm btn-outline-primary">Volver al Dashboard</Link>
            </div>
        </div>

    );
};

export default TodosLosPostEditorial;
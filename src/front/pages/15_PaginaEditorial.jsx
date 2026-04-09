import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

// 1. IMPORTAMOS EL COMPONENTE DEL MAPA
import LectoresUbi from "../components/25_LectoresUbi"; 

const PaginaEditorial = () => {
    const { store } = useGlobalReducer();

    console.log("ID de la editorial en el store:", store.editorial_id);
    console.log("¿Está autorizado?:", store.auth_editorial);


    const editorialId = store.editorial_id;

    const [posts, setPosts] = useState([]);
    const [datosEditorial, setDatosEditorial] = useState(null);
    const [libros, setLibros] = useState([]);

    // --- NUEVO: ESTADOS PARA EL MAPA ---
    const [mapaViews, setMapaViews] = useState({
        favLibros: [],
        leyendo: []
    });
    const [vistaMapaActual, setVistaMapaActual] = useState('favLibros');
    // -----------------------------------

    if (!store.auth_editorial) {
        return <Navigate to="/login_editorial" />;
    }

    const cargarPanel = async () => {
        try {

            const respEd = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/editorial/${editorialId}`);
            if (respEd.ok) setDatosEditorial(await respEd.json());

            const respPosts = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/posteditorial/editorial/${editorialId}`);
            if (respPosts.ok) setPosts(await respPosts.json());

            const respLibros = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/libro/editorial/${editorialId}`);
            if (respLibros.ok) {
                const dataLibros = await respLibros.json();
                setLibros(dataLibros);
            }

            // --- NUEVO: FETCH PARA EL MAPA ---
            const respFavLibros = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/lectores_fav_libros_editorial/${editorialId}`);
            const respLeyendo = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/lectores_leyendo_editorial/${editorialId}`);

            setMapaViews({
                favLibros: respFavLibros.ok ? await respFavLibros.json() : [],
                leyendo: respLeyendo.ok ? await respLeyendo.json() : []
            });
            // ---------------------------------

        } catch (error) {
            console.error("Error cargando el panel:", error);
        }
    };

    useEffect(() => {
        if (editorialId) cargarPanel();
    }, [editorialId]);

    function deletelibro(idToDelete) {
        if (!confirm("¿De verdad quieres eliminar este libro?")) {
            return;
        }
        console.log("se va a eliminar el libro" + idToDelete)
        const requestOptions = {
            method: "DELETE",
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/libro/" + idToDelete, requestOptions)
            .then((response) => response.text())
            .then((result) => {
                console.log(result)
                cargarPanel()
            })

    }

    function deletepost(idToDelete) {
        if (!confirm("¿Estás seguro que quieres eliminar este post?")) {
            return;
        }
        console.log("se va a eliminar el post" + idToDelete)
        const requestOptions = {
            method: "DELETE",
        };

        fetch(import.meta.env.VITE_BACKEND_URL + "api/posteditorial/" + idToDelete, requestOptions)
            .then((response) => response.text())
            .then((result) => {
                console.log(result)
                cargarPanel()
            })

    }

    return (
        <div className="container mt-5">

            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <div>
                    <h1>Panel de {datosEditorial?.nombre || "Editorial"}</h1>
                    <p className="text-muted">Gestiona tus libros y publicaciones</p>
                </div>
                <div className="gap-2 d-flex">
                    <Link to={`/nuevo_libro_editorial/${editorialId}`} className="btn btn-primary">
                        <i className="fas fa-book me-2"></i>Agregar Libro
                    </Link>
                    <Link to={`/nueva_publicacion_editorial/${editorialId}`} className="btn btn-success">
                        <i className="fas fa-plus me-2"></i>Nueva Publicación
                    </Link>
                </div>
            </div>

            <div className="row">

                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm border-0 bg-light">
                        <div className="card-body">
                            <h5>Informacion</h5>
                            <p className="mb-1"><strong>Publicaciones:</strong> {posts.length}</p>
                            <p className="mb-1"><strong>Email:</strong> {datosEditorial?.email}</p>
                            <Link to={`/actualizar_editorial/${editorialId}`} className="btn btn-sm btn-outline-warning mt-2">
                                Editar Perfil
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="row mt-5">
                    <div className="col-12">
                        <h3 className="border-bottom pb-2">Catálogo de Libros</h3>
                    </div>
                    {libros.length === 0 ? (
                        <div className="col-12"><p className="text-muted">No has registrado libros aún.</p></div>
                    ) : (
                        libros.map(libro => (
                            <div key={libro.id} className="col-md-3 mb-4">
                                <div className="card h-100 shadow-sm border-0">
                                    <div className="card-body">
                                        <h5 className="card-title text-primary"><Link
                                            to={`/ver_libro/${libro.id}`}
                                            className="text-primary text-decoration-none"
                                        >
                                            {libro.nombre}
                                        </Link></h5>
                                        <p className="card-text text-muted small">Género: {libro.genero}</p>
                                        <div className="d-flex gap-2">
                                            <Link to={`/ver_libro/${libro.id}`} className="btn btn-sm btn-outline-primary">Ver</Link>
                                            <Link to={`/editar_libro_editorial/${libro.id}`} className="btn btn-sm btn-outline-warning">Editar</Link>
                                            <button onClick={() => deletelibro(libro.id)} className="btn btn-sm btn-outline-danger">Eliminar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>


                <div className="col-md-8">
                    <h3>Tus últimas publicaciones</h3>
                    {posts.length === 0 ? (
                        <div className="alert alert-info">Aún no has publicado nada. ¡Empieza ahora!</div>
                    ) : (
                        posts.map(post => (
                            <div key={post.id} className="card mb-3 shadow-sm border-0">
                                <div className="card-body">
                                    <p>{post.texto}</p>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted">{post.fecha}</small>
                                        <div>
                                            <button onClick={() => deletepost(post.id)} className="btn btn-sm btn-link text-danger">Borrar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* --- NUEVO: COMPONENTE DEL MAPA CON SWITCH --- */}
                    <div className="mt-5 mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="mb-0">Ubicación de los Lectores</h3>
                            <div className="btn-group shadow-sm" role="group">
                                <button 
                                    className={`btn btn-sm ${vistaMapaActual === 'favLibros' ? 'btn-primary' : 'btn-outline-primary'}`} 
                                    onClick={() => setVistaMapaActual('favLibros')}>Fans de nuestros libros</button>
                                <button 
                                    className={`btn btn-sm ${vistaMapaActual === 'leyendo' ? 'btn-primary' : 'btn-outline-primary'}`} 
                                    onClick={() => setVistaMapaActual('leyendo')}>Leyendo Ahora</button>
                            </div>
                        </div>
                        <div className="card shadow-sm border-0 p-2">
                            <LectoresUbi lectores={mapaViews[vistaMapaActual]} />
                        </div>
                    </div>
                    {/* --------------------------------------------- */}

                </div>
            </div>
        </div>
    );
}

export default PaginaEditorial;
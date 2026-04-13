import React, { useEffect, useState, useCallback } from "react";
import logoBookedUrl from "../assets/img/logo_booked1.png";
import chicaLeyendoUrl from "../assets/img/chica-pensativa-sentada-sobre-libros.png";
import dateLeyendoUrl from "../assets/img/medium-shot-couple-having-bookstore-date.jpg";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Link, useNavigate } from "react-router-dom";
import BuscadorGoogleBooks from "../components/23_BuscadorGoogleBooks";

export const Home = () => {
    const navigate = useNavigate();
    const [librosRecientes, setLibrosRecientes] = useState([]);
    const [autoresUnicos, setAutoresUnicos] = useState([]);
    const [editorialesUnicas, setEditorialesUnicas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postsRecientes, setPostsRecientes] = useState([]);
    const api = `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")}/api`;

    const load = useCallback(async () => {
        try {
            const res = await fetch(`${api}/libro`);
            if (res.ok) {
                const data = await res.json();

                // 1. Libros Recientes (estos mejor dejarlos ordenados por fecha/ID como ya tienes)
                const ultimos4 = data.sort((a, b) => b.id - a.id).slice(0, 4);
                setLibrosRecientes(ultimos4);

                // --- LÓGICA PARA AUTORES ALEATORIOS ---
                const autoresMap = data.reduce((acc, current) => {
                    if (current.nombre_autor && !acc.find(item => item.nombre === current.nombre_autor)) {

                        // --- DEBUG: Esto imprimirá en tu consola el objeto para que veas los nombres de las llaves ---
                        console.log("Revisando objeto libro:", current);

                        acc.push({
                            id: current.autor_id || current.id,
                            nombre: current.nombre_autor,
                            // Agregamos todas las posibilidades de nombres de columna para la imagen
                            imagen: current.imagen_autor || current.foto_autor || current.image_url_autor || current.url_foto || null
                        });
                    }
                    return acc;
                }, [])
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 2);

                setAutoresUnicos(autoresMap);

                // --- LÓGICA PARA EDITORIALES ALEATORIAS ---
                const editorialesMap = data.reduce((acc, current) => {
                    const nombreEdit = current.editorial || current.nombre_editorial || current.publisher;
                    if (nombreEdit && !acc.find(item => item.nombre === nombreEdit)) {
                        acc.push({
                            id: current.editorial_id || current.id,
                            nombre: nombreEdit
                        });
                    }
                    return acc;
                }, [])
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 2);

                setEditorialesUnicas(editorialesMap);
            }
        } catch (e) {
            console.error("Error cargando datos:", e);
        } finally {
            setLoading(false);
        }
    }, [api]);

    const loadPosts = useCallback(async () => {
        try {
            const [resEditorial, resAutor] = await Promise.all([
                fetch(`${import.meta.env.VITE_BACKEND_URL}api/posteditorial`),
                fetch(`${import.meta.env.VITE_BACKEND_URL}api/postautor`)
            ]);

            if (resEditorial.ok && resAutor.ok) {
                const dataEditorial = await resEditorial.json();
                const dataAutor = await resAutor.json();

                // Unificamos ambos y ordenamos por fecha (asumiendo que post.fecha es comparable)
                const todosLosPosts = [...dataEditorial, ...dataAutor]
                    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                    .slice(0, 4); // Solo los 4 más nuevos

                setPostsRecientes(todosLosPosts);
            }
        } catch (error) {
            console.error("Error cargando feeds:", error);
        }
    }, []);

    useEffect(() => {
        load();
        loadPosts();
    }, [load, loadPosts]);

    const irAlLibro = (libroId) => { if (libroId) navigate(`/ver_libro/${libroId}`); };

    return (
        <div className="pb-5">
            {/* --- SECCIÓN 1: HERO --- */}
            <div className="py-5" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)', minHeight: '550px', display: 'flex', alignItems: 'center' }}>
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6 text-start">
                            <img src={logoBookedUrl} style={{ width: "250px" }} className="mb-4" alt="Logo Booked" />
                            <h1 className="display-3 mb-3 fw-bold">Your Digital <br />Book <span className="text-info-booked" style={{ fontStyle: 'italic' }}>Ecosystem.</span></h1>
                            <p className="lead text-muted mb-5">Busca cualquier libro en el mundo, agrégalo a nuestra comunidad y organiza tu vida literaria.</p>

                            <div className="p-2 bg-white shadow-lg rounded-4 d-flex align-items-center border">
                                <div className="flex-grow-1 px-2">
                                    <BuscadorGoogleBooks onLibroAgregado={irAlLibro} />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 d-none d-lg-block text-center">
                            {/* Uso de tu variable local */}
                            <img src={chicaLeyendoUrl} style={{ width: '85%' }} alt="Hero Booked" />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN 2: NOVEDADES (Portadas Rectangulares) --- */}
            <div className="container mt-1" style={{ marginTop: '-40px' }}>
                <div className="row">
                    {loading ? (
                        <div className="text-center w-100"><div className="spinner-border text-info"></div></div>
                    ) : (
                        librosRecientes.map(l => (
                            <div key={l.id} className="col-md-3 mb-5">
                                <div className="card-feature text-center h-100 shadow-sm border-0">
                                    {/* Este es el div que flota */}
                                    <div className="book-cover-floating">
                                        <img
                                            src={l.image_url || "https://via.placeholder.com/150x225?text=No+Cover"}
                                            alt={l.nombre}
                                            className="portada-full"
                                        />
                                    </div>
                                    {/* El contenido de abajo */}
                                    <h6 className="fw-bold text-dark mt-2 mb-1 text-truncate px-2">{l.nombre}</h6>
                                    <p className="small text-muted mb-3">
                                        {l.nombre_autor}
                                    </p>
                                    <Link to={`/ver_libro/${l.id}`} className="btn btn-sm btn-booked-blue rounded-pill px-4">
                                        Detalles
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* --- SECCIÓN 3: ABOUT US --- */}
            <div className="container py-5 mt-5">
                <div className="row align-items-center">
                    <div className="col-lg-6 pr-lg-5">
                        <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— About Us</span>
                        <h2 className="display-5 fw-bold mt-2 mb-4">Cultivating a Digital <br />Reading Community.</h2>
                        <p className="text-muted mb-4 lead" style={{ fontSize: '1.1rem' }}>
                            En Booked creemos que el conocimiento debe ser compartido. Nuestra plataforma te permite descubrir tesoros literarios y mantener un registro impecable de lo que has leído.
                        </p>

                        <div className="bg-white p-3 rounded-4 shadow-sm border d-flex align-items-center gap-3 mb-3" style={{ borderLeft: '5px solid #24b0d9' }}>
                            <div className="bg-light p-3 rounded-circle text-info-booked">
                                <i className="fas fa-solid fa-share"></i>
                            </div>
                            <div>
                                <h6 className="fw-bold mb-0">Comparte!</h6>
                                <p className="small text-muted mb-0">Lo que estas leyendo y tu opinion al respecto!.</p>
                            </div>
                        </div>
                        <div className="bg-white p-3 rounded-4 shadow-sm border d-flex align-items-center gap-3 mb-3" style={{ borderLeft: '5px solid #24b0d9' }}>
                            <div className="bg-light p-3 rounded-circle text-info-booked">
                                <i className="fa-solid fa-newspaper"></i>
                            </div>
                            <div>
                                <h6 className="fw-bold mb-0">Encuentra!</h6>
                                <p className="small text-muted mb-0">Lectores como tu y aprende de ellos!</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-6 text-center position-relative">
                        <div className="position-relative d-inline-block">
                            <img
                                src={dateLeyendoUrl}
                                className="img-fluid rounded-circle shadow-lg"
                                style={{ width: '500px', height: '500px', objectFit: 'cover', border: '15px solid white' }}
                                alt="Student Booked"
                            />
                            <div className="position-absolute bg-white p-3 shadow rounded-4 d-flex align-items-center gap-2" style={{ bottom: '40px', right: '-20px' }}>
                                <div className="bg-success rounded-circle p-2 text-white">
                                    <i className="fas fa-check"></i>
                                </div>
                                <div className="text-start">
                                    <p className="fw-bold mb-0 small">Comunidad Activa</p>
                                    <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>Basado en lecturas reales</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="reviews-ticker-container mt-5">
                <div className="container mb-4">
                    <h3 className="fw-bold text-center">Lo que nuestros lectores piensan!</h3>
                </div>

                <div className="ticker-wrapper">
                    {/* Duplicamos los items para que el loop sea infinito sin saltos */}
                    {[1, 2, 3, 4, 5, 1, 2, 3, 4, 5].map((item, index) => (
                        <div key={index} className="review-card border">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <div className="bg-info-booked rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '40px', height: '40px' }}>
                                    <i className="fas fa-user"></i>
                                </div>
                                <div>
                                    <h6 className="mb-0 fw-bold small">Lector #{item}</h6>
                                    <div className="text-warning small">
                                        <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                    </div>
                                </div>
                            </div>
                            <p className="small text-muted mb-0">"Booked ha cambiado mi forma de organizar mis lecturas. ¡El buscador es increíble!"</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="container py-5 mt-5">
                <div className="text-center mb-5">
                    <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>
                        — Comunidad Real
                    </span>
                    <h2 className="fw-bold mt-2">Nuestros Autores y Editoriales</h2>
                </div>

                <div className="row justify-content-center">
                    {autoresUnicos.map((autor, i) => (
                        <div key={`author-${i}`} className="col-md-3 mb-5">
                            <div className="card-feature text-center h-100 shadow-sm border-0">
                                {/* Contenedor de la imagen o icono */}
                                <div className="book-cover-floating bg-white d-flex align-items-center justify-content-center shadow overflow-hidden"
                                    style={{ borderRadius: '50%', width: '100px', height: '100px', margin: '0 auto' }}>

                                    {autor.imagen ? (
                                        <img
                                            src={autor.imagen}
                                            alt={autor.nombre}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.style.display = 'none'; }} // Si la URL falla, se oculta para mostrar la pluma
                                        />
                                    ) : (
                                        <i className="fas fa-feather-alt fa-2xl text-info-booked"></i>
                                    )}
                                </div>

                                <div className="d-flex align-items-center justify-content-center mt-3 px-2">
                                    <h6 className="fw-bold text-dark mb-0 text-truncate">{autor.nombre}</h6>
                                    <span className="ms-2 d-flex align-items-center justify-content-center text-white shadow-sm"
                                        style={{ width: "18px", height: "18px", fontSize: "10px", backgroundColor: "#24b0d9", borderRadius: "50%" }}>✓</span>
                                </div>

                                <p className="small text-muted mb-4 mt-1">Autor en <span className="text-info-booked fw-bold">Booked</span></p>

                                <Link to={`/ver_autor_free/${autor.id}`} className="btn btn-sm btn-booked-blue rounded-pill px-4">
                                    Ver Perfil
                                </Link>
                            </div>
                        </div>
                    ))}


                    {/* Mapeo de Editoriales (Sin check, o puedes ponérselo también) */}
                    {editorialesUnicas.map((edit, i) => (
                        <div key={`edit-${i}`} className="col-md-3 mb-5">
                            <div className="card-feature text-center h-100 shadow-sm border-0">
                                <div className="book-cover-floating bg-white d-flex align-items-center justify-content-center shadow"
                                    style={{ borderRadius: '50%', width: '90px', height: '90px' }}>
                                    <i className="fas fa-university fa-2xl text-info-booked"></i>
                                </div>

                                {/* Usamos edit.nombre en lugar de edit */}
                                <h6 className="fw-bold text-dark mt-3 mb-1 text-truncate px-2">
                                    {edit.nombre}
                                </h6>

                                <p className="small text-muted mb-4">Editorial Partner</p>

                                {/* Usamos edit.id para la navegación real */}
                                <Link to={`/ver_editorial_free/${edit.id}`} className="btn btn-sm btn-booked-blue rounded-pill px-4">
                                    Ver Perfil
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- SECCIÓN 7: ÚLTIMAS NOTICIAS / POSTS (DATOS REALES) --- */}
                <div className="container py-5">
                    <div className="d-flex justify-content-between align-items-end mb-5">
                        <div>
                            <span className="text-info-booked fw-bold small text-uppercase">— Feed de Comunidad</span>
                            <h2 className="fw-bold">Últimos Posts de Autores y Editoriales</h2>
                        </div>
                        <Link to="/posts" className="btn btn-outline-info rounded-pill px-4">Ver todo el Feed</Link>
                    </div>

                    <div className="row">
                        {postsRecientes.map((post, index) => {
                            // --- ESTO ES LO QUE NO SABÍAS DÓNDE IBA ---
                            // Si tiene nombre_autor y no está vacío, es un Autor. Si no, es Editorial.
                            const esAutor = post.nombre_autor && post.nombre_autor.trim() !== "";

                            return (
                                <div key={index} className="col-md-3 mb-4">
                                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                                        <div className="card-body p-3 d-flex flex-column">
                                            <div className="mb-2">
                                                {/* Badge corregido con el color de Booked para Editorial */}
                                                <span
                                                    className={`badge rounded-pill ${esAutor ? 'bg-success' : 'bg-info-booked'}`}
                                                    style={{ fontSize: '10px' }}
                                                >
                                                    {esAutor ? 'Autor' : 'Editorial'}
                                                </span>
                                            </div>

                                            <h6 className="fw-bold mb-2 text-dark" style={{ fontSize: '0.9rem' }}>
                                                {post.texto ? post.texto.substring(0, 50) + "..." : "Publicación"}
                                            </h6>

                                            <p className="small text-muted mb-3 flex-grow-1">
                                                {post.texto}
                                            </p>

                                            <div className="d-flex align-items-center gap-2 pt-2 border-top">
                                                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-muted" style={{ width: '30px', height: '30px' }}>
                                                    <i className={`fas ${esAutor ? 'fa-user' : 'fa-university'} small`}></i>
                                                </div>
                                                <div className="text-start">
                                                    <p className="very-small fw-bold mb-0 text-dark">
                                                        {/* Evitamos el undefined del apellido */}
                                                        {esAutor
                                                            ? `${post.nombre_autor} ${post.apellido_autor || ""}`
                                                            : (post.nombre_editorial || "Editorial Booked")
                                                        }
                                                    </p>
                                                    <p className="text-muted mb-0" style={{ fontSize: '0.6rem' }}>
                                                        {post.fecha}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="container py-5 my-5">
                    <div className="bg-dark rounded-5 p-5 text-center text-white position-relative overflow-hidden"
                        style={{ background: 'linear-gradient(45deg, #1a1f1c 0%, #2a322d 100%)' }}>

                        {/* Adorno sutil de fondo */}
                        <div className="position-absolute opacity-25" style={{ top: '-20px', right: '-20px' }}>
                            <i className="fas fa-book-open fa-10x"></i>
                        </div>

                        <div className="position-relative z-index-1">
                            <h2 className="display-5 fw-bold mb-3">¿Listo para organizar tu <br /> propia biblioteca?</h2>
                            <p className="lead mb-4 opacity-75">Únete a miles de lectores y empieza a registrar tus lecturas hoy mismo.</p>
                            <div className="d-flex justify-content-center gap-3">
                                <Link to="/signup_lector" className="btn btn-booked-blue btn-lg rounded-pill px-5">Unete Ahora!</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
};


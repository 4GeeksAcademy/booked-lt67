import React, { useEffect, useState, useCallback } from "react";
import logoBookedUrl from "../assets/img/logo_booked1.png";
import chicaLeyendoUrl from "../assets/img/chica-pensativa-sentada-sobre-libros.png";
import dateLeyendoUrl from "../assets/img/medium-shot-couple-having-bookstore-date.jpg";
import cosmosFlotanteUrl from '../assets/img/cosmos.png';
import explosionFlotanteUrl from '../assets/img/explosion.png';
import ideaFlotanteUrl from '../assets/img/idea.png';
import fenixFlotanteUrl from '../assets/img/fenix.png';
import mapaFlotanteUrl from '../assets/img/mapa.png';
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Link, useNavigate } from "react-router-dom";
import BuscadorGoogleBooks from "../components/23_BuscadorGoogleBooks";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

import "../shelfStyles.css";
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export const Home = () => {
    const navigate = useNavigate();
    const [librosRecientes, setLibrosRecientes] = useState([]);
    const [autoresUnicos, setAutoresUnicos] = useState([]);
    const [editorialesUnicas, setEditorialesUnicas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postsRecientes, setPostsRecientes] = useState([]);
    const [listaReviews, setListaReviews] = useState([]);
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
                    const nombreEdit = current.nombre_editorial || current.editorial || current.publisher;
                    if (nombreEdit && !acc.find(item => item.nombre === nombreEdit)) {
                        acc.push({
                            id: current.editorial_id || current.id,
                            nombre: nombreEdit,
                            // Asegúrate de que esta llave coincida con lo que devuelve el backend en el objeto libro
                            image_url: current.imagen_editorial || null
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
                fetch(`${import.meta.env.VITE_BACKEND_URL}/api/posteditorial`),
                fetch(`${import.meta.env.VITE_BACKEND_URL}/api/postautor`)
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


    const loadReviews = useCallback(async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reviews`);
            if (res.ok) {
                const data = await res.json();
                // Mezclamos un poco para que no siempre salgan las mismas primeras
                setListaReviews(data.sort(() => Math.random() - 0.5));
            }
        } catch (e) {
            console.error("Error cargando reviews:", e);
        }
    }, []);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);


    const irAlLibro = (libroId) => { if (libroId) navigate(`/ver_libro/${libroId}`); };

    return (
        <div className="pb-5">
            {/* --- SECCIÓN 1: HERO --- */}
            <div className="py-5 mb-3" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)', minHeight: '550px', display: 'flex', alignItems: 'center' }}>
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
                            {/* Contenedor Ancla para que los PNGs no se pierdan */}
                            <div className="hero-right-content">

                                {/* La Chica: Nuestra referencia central */}
                                <img
                                    src={chicaLeyendoUrl}
                                    className="main-hero-img"
                                    style={{ width: '85%' }}
                                    alt="Hero Booked"
                                />

                                {/* PNGs Flotantes: Ahora heredarán su posición de 'hero-right-content' */}
                                <img
                                    src={ideaFlotanteUrl}
                                    alt="Libro Flotante"
                                    className="floating-png png-1"
                                />

                                <img
                                    src={explosionFlotanteUrl}
                                    alt="Fenix"
                                    className="floating-png png-2"
                                />

                                <img
                                    src={cosmosFlotanteUrl}
                                    alt="Cosmos"
                                    className="floating-png png-3"
                                />

                                <img
                                    src={fenixFlotanteUrl}
                                    alt="Fenix"
                                    className="floating-png png-4"
                                />

                                <img
                                    src={mapaFlotanteUrl}
                                    alt="Mapa"
                                    className="floating-png png-5"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN 2: NOVEDADES (Portadas Rectangulares) --- */}
            <div className="container mt-5">
                <div className="row bookshelf-grid">
                    {loading ? (
                        <div className="text-center w-100"><div className="spinner-border text-info"></div></div>
                    ) : (
                        librosRecientes.map(l => (
                            <div key={l.id} className="col-md-3 mb-5 shelf-item">
                                <div className="shelf-cubby">
                                    <div className="book-3d" onClick={() => irAlLibro(l.id)}>
                                        <img src={l.image_url || "placeholder"} alt={l.nombre} />
                                    </div>
                                    <div className="shelf-floor-wood"></div>
                                </div>
                                {/* Texto debajo del mueble */}
                                <div className="text-center mt-3">
                                    <h6 className="fw-bold text-dark mb-1 text-truncate px-2">{l.nombre}</h6>
                                    <Link to={`/ver_libro/${l.id}`} className="btn btn-sm btn-booked-blue rounded-pill px-4 mt-2">Detalles</Link>
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


            <div className="reviews-ticker-container">
                {/* ENCABEZADO UNIFICADO */}
                <div className="text-center mb-5 position-relative" style={{ zIndex: 2 }}>
                    <span className="text-info-booked fw-bold text-uppercase" style={{ letterSpacing: '3px', fontSize: '0.75rem' }}>
                        — Comunidad Booked —
                    </span>
                    <h2 className="display-5 fw-bold text-dark mt-2">La voz de los lectores</h2>
                    <div className="mx-auto mt-3" style={{ width: '60px', height: '4px', background: '#24b0d9', borderRadius: '10px' }}></div>
                </div>

                {/* WRAPPER DEL MOVIMIENTO */}
                <div className="ticker-wrapper">
                    {listaReviews.length > 0 ? (
                        [...listaReviews, ...listaReviews].map((rev, index) => (
                            <div key={index} className="review-card hover-up">

                                {/* 1. BANNER DE PORTADA (MÁS GRANDE: 55%) */}
                                <div className="position-relative" style={{ height: '48%', width: '100%', flexShrink: 0 }}>
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 0, left: 0, right: 0, bottom: 0,
                                            backgroundImage: `url(${rev.libro?.image_url || 'https://via.placeholder.com/300x150?text=Booked+Reader'})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            filter: 'brightness(0.85)'
                                        }}
                                    />
                                    {/* DEGRADADO MÁS BAJO PARA MOSTRAR MÁS LIBRO */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0, left: 0, right: 0,
                                        height: '50%',
                                        background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.9) 75%, #ffffff 100%)'
                                    }} />

                                    <Link to={`/ver_libro/${rev.libro?.id}`} className="position-absolute top-0 end-0 m-3 text-decoration-none" style={{ zIndex: 3 }}>
                                        <span className="badge bg-blur-dark rounded-pill py-2 px-3 shadow-sm" style={{ fontSize: '0.65rem' }}>
                                            <i className="fas fa-eye me-1"></i> Ver Libro
                                        </span>
                                    </Link>
                                </div>

                                {/* 2. CUERPO DE LA REVIEW */}
                                <div className="card-body pt-0 px-4 d-flex flex-column align-items-center text-center">
                                    {/* Avatar Flotante con ajuste de margen */}
                                    <div className="bg-white rounded-circle p-1 shadow-lg mb-2" style={{ marginTop: '-40px', zIndex: 10 }}>
                                        <Link to={`/perfil_lector/${rev.lector_id}`}>
                                            <div className="bg-info-booked rounded-circle overflow-hidden border border-2 border-white"
                                                style={{ width: '60px', height: '60px' }}>
                                                {rev.foto_lector ? (
                                                    <img src={rev.foto_lector} alt={rev.username_lector} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div className="h-100 d-flex align-items-center justify-content-center text-white fw-bold">
                                                        {rev.username_lector?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    </div>

                                    <h6 className="fw-bold mb-1 text-dark">@{rev.username_lector || 'lector'}</h6>

                                    <div className="text-warning mb-3" style={{ fontSize: '0.75rem' }}>
                                        {[...Array(5)].map((_, i) => (
                                            <i key={i} className={`${i < Math.round(rev.puntuacion / 2) ? 'fas' : 'far'} fa-star`}></i>
                                        ))}
                                    </div>

                                    <p className="small text-muted fst-italic mb-0 px-2"
                                        style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            lineHeight: '1.4'
                                        }}>
                                        "{rev.texto}"
                                    </p>
                                </div>

                                {/* 3. FOOTER TOTALMENTE INTEGRADO */}
                                <div className="review-card-footer mt-auto text-center">
                                    <small className="text-info-booked fw-bold text-truncate d-block px-3">
                                        <i className="fas fa-bookmark me-2 opacity-75"></i>
                                        {rev.libro?.nombre || "Lectura Booked"}
                                    </small>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center w-100 py-5">
                            <div className="spinner-border text-info-booked"></div>
                        </div>
                    )}
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
                                <div className="foto-cover-floating bg-white d-flex align-items-center justify-content-center shadow overflow-hidden"
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
                                {/* Contenedor de la imagen */}
                                <div className="foto-cover-floating bg-white d-flex align-items-center justify-content-center shadow overflow-hidden"
                                    style={{ borderRadius: '50%', width: '100px', height: '100px', margin: '0 auto' }}>

                                    {/* CAMBIO: Usamos image_url que es como viene de tu base de datos */}
                                    {edit.image_url ? (
                                        <img
                                            src={edit.image_url}
                                            alt={edit.nombre}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => {
                                                // Si el link falla, usamos el avatar de respaldo
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(edit.nombre)}&background=24b0d9&color=fff`;
                                            }}
                                        />
                                    ) : (
                                        /* Fallback: Si no hay imagen en la DB, mostramos el icono */
                                        <i className="fas fa-university fa-2xl text-info-booked"></i>
                                    )}
                                </div>

                                <div className="d-flex align-items-center justify-content-center mt-3 px-2">
                                    <h6 className="fw-bold text-dark mb-0 text-truncate">{edit.nombre}</h6>
                                    <span className="ms-2 d-flex align-items-center justify-content-center text-white shadow-sm"
                                        style={{ width: "18px", height: "18px", fontSize: "10px", backgroundColor: "#1a3a4a", borderRadius: "50%" }}>
                                        <i className="fas fa-handshake"></i>
                                    </span>
                                </div>

                                <p className="small text-muted mb-4 mt-1">Editorial <span className="text-info-booked fw-bold">Partner</span></p>

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
                        <Link to="/post_autores" className="btn btn-outline-info rounded-pill px-4 mx-2">Ver feed de Autores</Link>
                        <Link to="/post_editoriales" className="btn btn-outline-info rounded-pill px-4 mx-2">Ver feed de Editoriales</Link>
                    </div>

                    <div className="row">
                        {postsRecientes.map((post, index) => {
                            // 1. Identificamos si es Autor o Editorial
                            const esAutor = post.nombre_autor && post.nombre_autor.trim() !== "";

                            // 2. Construimos la ruta (Asegúrate de que el backend envíe estos IDs)
                            const rutaPerfil = esAutor
                                ? `/ver_autor_free/${post.autor_id}`
                                : `/ver_editorial_free/${post.editorial_id}`;

                            return (
                                <div key={index} className="col-md-3 mb-4">
                                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                                        <div className="card-body p-3 d-flex flex-column">
                                            <div className="mb-2">
                                                <span
                                                    className={`badge rounded-pill ${esAutor ? 'bg-success' : 'bg-info-booked'}`}
                                                    style={{ fontSize: '10px' }}
                                                >
                                                    {esAutor ? 'Autor' : 'Editorial'}
                                                </span>
                                            </div>

                                            <p className="small text-muted mb-3 flex-grow-1">
                                                {post.texto}
                                            </p>

                                            {/* --- LINK AL PERFIL --- */}
                                            <Link to={rutaPerfil} className="text-decoration-none border-top pt-2">
                                                <div className="d-flex align-items-center gap-2 pt-1">
                                                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center text-muted overflow-hidden border"
                                                        style={{ width: '35px', height: '35px' }}>

                                                        {esAutor ? (
                                                            post.foto_autor ? (
                                                                <img
                                                                    src={post.foto_autor}
                                                                    alt={post.nombre_autor}
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                />
                                                            ) : (
                                                                <i className="fas fa-user small"></i>
                                                            )
                                                        ) : (
                                                            post.foto_editorial ? (
                                                                <img
                                                                    src={post.foto_editorial}
                                                                    alt={post.nombre_editorial}
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                />
                                                            ) : (
                                                                <i className="fas fa-university small"></i>
                                                            )
                                                        )}
                                                    </div>

                                                    <div className="text-start">
                                                        <p className="very-small fw-bold mb-0 text-dark hover-info-booked">
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
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <section className="testimonials-full-bg py-60">
                    <div className="container">
                        <div className="row align-items-center">

                            {/* COLUMNA IZQUIERDA: Texto */}
                            <div className="col-xl-5 mb-5  mb-xl-0">
                                <div className="testimonials_text_block ml-2 position-relative">
                                    <h6 className="text-info-booked mb-2 fw-bold">–––– Testimoniales</h6>
                                    <h2 className="mb-4 fw-bold display-5">
                                        ¡Historias de Lectores! Algunos comentarios de nuestros <span className="text-info-booked">Usuarios</span>
                                    </h2>
                                    <p className="text-muted fs-5">
                                        Únete a los miles de apasionados por la lectura que ya están organizando su mundo literario con Booked.
                                    </p>

                                    {/* Dots decorativos */}
                                    <div className="mt-4 d-flex gap-2 opacity-25">
                                        {[...Array(12)].map((_, i) => (
                                            <div key={i} className="bg-dark rounded-circle" style={{ width: '6px', height: '6px' }}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* COLUMNA DERECHA: Slider */}
                            <div className="col-xl-7">
                                <Swiper
                                    spaceBetween={40}
                                    centeredSlides={true}
                                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                                    pagination={{
                                        clickable: true,
                                        /* dynamicBullets: false, // Quítalo o ponlo en false */
                                    }}
                                    // navigation={false} // Ya las quitamos
                                    modules={[Autoplay, Pagination]}
                                    className="mySwiper p-4"
                                >
                                    <SwiperSlide>
                                        <div className="testimonial_card shadow-sm p-4 p-md-5">
                                            <div className="d-md-flex align-items-center gap-4">
                                                <div className="position-relative mb-3 mb-md-0">
                                                    <img src="https://i.pravatar.cc/150?u=1" alt="User" className="rounded-circle shadow" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                                                    <div className="quote-badge">
                                                        <i className="fas fa-quote-right fa-xs text-white"></i>
                                                    </div>
                                                </div>
                                                <div className="text-start">
                                                    <h4 className="fw-bold mb-1">Jophie Alen</h4>
                                                    <div className="text-warning mb-2 small">
                                                        <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                                    </div>
                                                    <p className="text-muted fst-italic">"Booked cambió totalmente cómo registro mis lecturas. Ahora no olvido ningún detalle de los libros que termino."</p>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>

                                    <SwiperSlide>
                                        <div className="testimonial_card shadow-sm p-4 p-md-5">
                                            <div className="d-md-flex align-items-center gap-4">
                                                <div className="position-relative mb-3 mb-md-0">
                                                    <img src="https://i.pravatar.cc/150?u=2" alt="User" className="rounded-circle shadow" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                                                    <div className="quote-badge">
                                                        <i className="fas fa-quote-right fa-xs text-white"></i>
                                                    </div>
                                                </div>
                                                <div className="text-start">
                                                    <h4 className="fw-bold mb-1">Angel Whites</h4>
                                                    <div className="text-warning mb-2 small">
                                                        <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star-half-alt"></i>
                                                    </div>
                                                    <p className="text-muted fst-italic">"La interfaz es súper limpia y fácil de usar. Me encanta poder ver las fotos de otros lectores y sus reseñas."</p>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                </Swiper>
                            </div>

                        </div>
                    </div>
                </section>

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


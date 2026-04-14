import React from "react";
import logoBookedUrl from "../assets/img/logo_booked1.png";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate, Link, Navigate, NavLink } from "react-router-dom";
import AdminVerification from "../components/27_AdminVerification.jsx";

const AdminHome = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    // Redirección si no es admin
    if (!store.auth_admin) {
        return <Navigate to="/login_admin" />;
    }

    // Array de rutas de administración para renderizar el menú dinámicamente
    const adminModules = [
        { path: "/lector", title: "Lectores", icon: "users" },
        { path: "/autor", title: "Autores", icon: "feather-alt" },
        { path: "/editorial", title: "Editoriales", icon: "building" },
        { path: "/libro", title: "Libros", icon: "book" },
        { path: "/review", title: "Reseñas", icon: "star" },
        { path: "/lector_autores_favoritos", title: "Favoritos", icon: "heart" },
        { path: "/ver_seguidores", title: "Seguidores", icon: "project-diagram" }
    ];

    return (
        <div className="d-flex position-relative" style={{ minHeight: "100vh" }}>
            
            {/* --- SIDEBAR IZQUIERDO --- */}
            <div className="bg-white shadow-sm border-end d-flex flex-column" style={{ width: "280px", minWidth: "280px", zIndex: 10 }}>
                <div className="p-4 text-center border-bottom">
                    <div className="position-relative d-inline-block mb-3 bg-light rounded-circle p-3">
                        <i className="fas fa-user-shield fa-3x text-info-booked"></i>
                    </div>
                    <h6 className="fw-bold mb-0 text-dark">Administrador</h6>
                    <span className="text-muted small">Panel de Control</span>
                </div>

                <div className="list-group list-group-flush p-3 mt-2 flex-grow-1">
                    {/* Botón Activo (Dashboard) */}
                    <div className="list-group-item border-0 rounded-4 mb-2 py-3 px-4 d-flex align-items-center bg-info-booked text-white shadow">
                        <i className="fas fa-house me-3" style={{ width: "20px" }}></i> 
                        <span className="fw-bold">Dashboard</span>
                    </div>

                    {/* Mapeo de Módulos en el Sidebar */}
                    {adminModules.map((mod, index) => (
                        <Link 
                            key={index} 
                            to={mod.path} 
                            className="list-group-item list-group-item-action border-0 rounded-4 mb-2 py-3 px-4 d-flex align-items-center text-muted text-decoration-none"
                        >
                            <i className={`fas fa-${mod.icon} me-3`} style={{ width: "20px" }}></i>
                            <span className="fw-bold">{mod.title}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className="flex-grow-1 overflow-auto" style={{ background: 'linear-gradient(135deg, #e3f6fd 0%, #f4f5f5 100%)' }}>
                <div className="container-fluid p-5">
                    
                    {/* Componente de verificación */}
                    <AdminVerification />

                    {/* SECCIÓN BIENVENIDA */}
                    <div className="row align-items-center mb-5 mt-4">
                        <div className="col-lg-8">
                            <span className="text-info-booked fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>— Centro de Mando</span>
                            <h1 className="display-4 fw-bold text-dark mt-2 mb-4">
                                Hola, <span className="text-info-booked" style={{ fontStyle: 'italic' }}>Admin.</span>
                            </h1>
                            <p className="lead text-muted mb-4">
                                Bienvenido al panel de administración de Booked. 
                                Selecciona un módulo en el menú lateral izquierdo para gestionar la base de datos, moderar la comunidad y administrar el ecosistema literario.
                            </p>
                        </div>
                        <div className="col-lg-4 d-none d-lg-block text-center">
                            <img 
                                src={logoBookedUrl} 
                                alt="Logo Booked" 
                                className="img-fluid" 
                                style={{ maxHeight: "200px", filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.1))" }} 
                            />
                        </div>
                    </div>

                    {/* MENSAJE DE INDICACIÓN (Opcional, para que no quede vacío abajo) */}
                    <div className="text-center mt-5 p-5 bg-white rounded-4 shadow-sm border border-light" style={{ borderStyle: 'dashed !important' }}>
                        <i className="fas fa-hand-pointer fa-3x text-muted mb-3 opacity-50"></i>
                        <h4 className="fw-bold text-muted">Selecciona una opción del menú</h4>
                        <p className="text-muted">Utiliza el menú lateral para navegar entre las diferentes secciones administrativas.</p>
                    </div>

                </div>
            </div>
        </div>
    );
}; 

export default AdminHome;
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import logoBookedUrl from "../assets/img/logo_booked.png";

export const Navbar = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    // Lógica de estados de autenticación
    const autorLogueado = store.auth_autor || !!localStorage.getItem("token_autor");
    const lectorLogueado = store.auth_lector || !!localStorage.getItem("token_lector");
    const editorialLogueada = store.auth_editorial || !!localStorage.getItem("token_editorial");
    const adminLogueado = store.auth_admin || !!localStorage.getItem("token_admin");

    const isAuthorized = autorLogueado || lectorLogueado || editorialLogueada || adminLogueado;

    const handleLogout = (type, storageKey) => {
        localStorage.removeItem(storageKey);
        dispatch({ type: type, payload: false });
        navigate('/');
    };

    const getDashboardPath = () => {
        if (lectorLogueado) return "/pagina_lector";
        if (autorLogueado) return "/pagina_autor";
        if (editorialLogueada) return "/pagina_editorial";
        if (adminLogueado) return "/admin_home/";
        return "/";
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm py-3">
            <div className="container">
                {/* LOGO */}
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <img 
                        src={logoBookedUrl} 
                        alt="Logo" 
                        style={{ height: "100px", width: "auto" }} 
                        className="me-2" 
                    />
                </Link>

                {/* BOTÓN MÓVIL */}
                <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* CONTENIDO DEL NAVBAR */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    {/* MENÚ CENTRAL (mx-auto centra los elementos) */}
                    <ul className="navbar-nav mx-auto mb-2 mb-lg-0 fw-semibold text-uppercase" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                        <li className="nav-item px-2">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>

                        {/* DROPDOWN FOROS */}
                        <li className="nav-item dropdown px-2">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                Foros
                            </a>
                            <ul className="dropdown-menu border-0 shadow mt-lg-3 rounded-3">
                                <li><Link className="dropdown-item py-2" to="/foro_autores">Foro Autores</Link></li>
                                <li><Link className="dropdown-item py-2" to="/foro_editoriales">Foro Editoriales</Link></li>
                            </ul>
                        </li>

                        {/* DROPDOWN CONOCE */}
                        <li className="nav-item dropdown px-2">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                Conoce
                            </a>
                            <ul className="dropdown-menu border-0 shadow mt-lg-3 rounded-3">
                                <li><Link className="dropdown-item py-2" to="/explorar_autores">Autores</Link></li>
                                <li><Link className="dropdown-item py-2" to="/explorar_editoriales">Editoriales</Link></li>
                            </ul>
                        </li>

                        {/* DROPDOWN ACCESO USUARIOS (Condicional) */}
                        {!isAuthorized && (
                            <li className="nav-item dropdown px-2">
                                <a className="nav-link dropdown-toggle text-primary" href="#" role="button" data-bs-toggle="dropdown">
                                    Acceso
                                </a>
                                <ul className="dropdown-menu border-0 shadow mt-lg-3 rounded-3">
                                    <li><Link className="dropdown-item py-2" to="/login_lector">Lector</Link></li>
                                    <li><Link className="dropdown-item py-2" to="/login_autor">Autor</Link></li>
                                    <li><Link className="dropdown-item py-2" to="/login_editorial">Editorial</Link></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><Link className="dropdown-item py-2 text-muted small" to="/login_admin">Admin</Link></li>
                                </ul>
                            </li>
                        )}

                        <li className="nav-item px-2">
                            <Link className="nav-link" to="/contact">Contacto</Link>
                        </li>
                    </ul>

                    {/* LADO DERECHO: ICONOS Y BOTÓN */}
                    <div className="d-flex align-items-center gap-3">
                        {/* Iconos estéticos como en el ejemplo de Educate */}
                        <div className="d-none d-xl-flex gap-3 me-2">
                            <i className="fas fa-search text-secondary cursor-pointer"></i>
                            <i className="far fa-user text-secondary cursor-pointer"></i>
                        </div>

                        {isAuthorized ? (
                            <div className="btn-group">
                                <Link to={getDashboardPath()} className="btn btn-primary rounded-pill px-4 fw-bold">
                                    Dashboard
                                </Link>
                                <button 
                                    className="btn btn-primary rounded-pill ms-2"
                                    onClick={() => {
                                        if(lectorLogueado) handleLogout("set_auth_lector", "token_lector");
                                        if(autorLogueado) handleLogout("set_auth_autor", "token_autor");
                                        if(editorialLogueada) handleLogout("set_auth_editorial", "token_editorial");
                                        if(adminLogueado) handleLogout("set_auth_admin", "token_admin");
                                    }}
                                >
                                    <i className="fas fa-power-off"></i>
                                </button>
                            </div>
                        ) : (
                            <Link to="/login_lector" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
                                Únete Ahora
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
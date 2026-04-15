import { Link, useNavigate, NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import logoBookedUrl from "../assets/img/logo_booked1.png";

export const Navbar = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const location = useLocation();

    const [openDropdown, setOpenDropdown] = useState(null);

    useEffect(() => {
        setOpenDropdown(null);
    }, [location.pathname]);

    const autorLogueado = store.auth_autor || !!localStorage.getItem("token_autor");
    const lectorLogueado = store.auth_lector || !!localStorage.getItem("token_lector");
    const editorialLogueada = store.auth_editorial || !!localStorage.getItem("token_editorial");
    const adminLogueado = store.auth_admin || !!localStorage.getItem("token_admin");

    const isAuthorized = autorLogueado || lectorLogueado || editorialLogueada || adminLogueado;

    // --- LÓGICA DE LOGOUT ---
    const handleLogout = () => {
        localStorage.clear();
        
        dispatch({ type: "set_auth_lector", payload: false });
        dispatch({ type: "set_auth_autor", payload: false });
        dispatch({ type: "set_auth_editorial", payload: false });
        dispatch({ type: "set_auth_admin", payload: false }); 
        
        dispatch({ type: "set_lector_id", payload: null });

        navigate('/');
    };

    const getDashboardPath = () => {
        if (lectorLogueado) return "/pagina_lector";
        if (autorLogueado) return "/pagina_autor";
        if (editorialLogueada) return "/pagina_editorial";
        if (adminLogueado) return "/admin_home";
        return "/";
    };

    const isPathActive = (paths) => paths.some(path => location.pathname.includes(path));

    const toggleDropdown = (name) => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    // CLASES DINÁMICAS
    // Mantenemos tu clase original. El CSS se encargará de que no parpadee en azul.
    const navLinkClass = ({ isActive }) => `nav-link nav-link-booked ${isActive ? "active" : ""}`;
    
    // Función para mantener tus clases originales en el dropdown pero sumando el fondo azul al seleccionar
    const getDropdownItemClass = (isActive, extraClasses = "") => {
        return `dropdown-item py-2 ${extraClasses} ${isActive ? "bg-info-booked text-white fw-bold" : ""}`;
    };

    return (
        <>

            <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm py-2">
                <div className="container">
                    <Link className="navbar-brand d-flex align-items-center" to="/" onClick={() => setOpenDropdown(null)}>
                        <img
                            src={logoBookedUrl}
                            alt="Logo"
                            style={{ height: "45px", width: "auto" }} 
                        />
                    </Link>

                    <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav mx-auto mb-2 mb-lg-0 fw-bold text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                            
                            {/* Devolvemos el px-lg-2 al <li> para mantener tu distancia original */}
                            <li className="nav-item px-lg-2">
                                <NavLink className={navLinkClass} to="/" end>
                                    Home
                                </NavLink>
                            </li>

                            <li className="nav-item dropdown px-lg-2">
                                <a
                                    className={`nav-link nav-link-booked dropdown-toggle ${isPathActive(['post_autores', 'post_editoriales']) ? 'active' : ''} ${openDropdown === 'foros' ? 'show' : ''}`}
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); toggleDropdown('foros'); }}
                                >
                                    Foros
                                </a>
                                <ul className={`dropdown-menu border-0 shadow-sm mt-lg-2 rounded-4 overflow-hidden ${openDropdown === 'foros' ? 'show' : ''}`}>
                                    <li><NavLink className={({ isActive }) => getDropdownItemClass(isActive)} to="/post_autores">Foro Autores</NavLink></li>
                                    <li><NavLink className={({ isActive }) => getDropdownItemClass(isActive)} to="/post_editoriales">Foro Editoriales</NavLink></li>
                                </ul>
                            </li>

                            <li className="nav-item dropdown px-lg-2">
                                <a
                                    className={`nav-link nav-link-booked dropdown-toggle ${isPathActive(['ver_autores', 'ver_editoriales']) ? 'active' : ''} ${openDropdown === 'conoce' ? 'show' : ''}`}
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); toggleDropdown('conoce'); }}
                                >
                                    Conoce
                                </a>
                                <ul className={`dropdown-menu border-0 shadow-sm mt-lg-2 rounded-4 overflow-hidden ${openDropdown === 'conoce' ? 'show' : ''}`}>
                                    <li><NavLink className={({ isActive }) => getDropdownItemClass(isActive)} to="/ver_autores">Autores</NavLink></li>
                                    <li><NavLink className={({ isActive }) => getDropdownItemClass(isActive)} to="/ver_editoriales">Editoriales</NavLink></li>
                                </ul>
                            </li>

                            {!isAuthorized && (
                                <li className="nav-item dropdown px-lg-2">
                                    <a
                                        className={`nav-link nav-link-booked dropdown-toggle ${isPathActive(['login', 'signup']) ? 'active' : ''} ${openDropdown === 'acceso' ? 'show' : ''}`}
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); toggleDropdown('acceso'); }}
                                    >
                                        Acceso
                                    </a>
                                    <ul className={`dropdown-menu border-0 shadow-sm mt-lg-2 rounded-4 overflow-hidden ${openDropdown === 'acceso' ? 'show' : ''}`}>
                                        <li><NavLink className={({ isActive }) => getDropdownItemClass(isActive)} to="/login_lector">Lector</NavLink></li>
                                        <li><NavLink className={({ isActive }) => getDropdownItemClass(isActive)} to="/login_autor">Autor</NavLink></li>
                                        <li><NavLink className={({ isActive }) => getDropdownItemClass(isActive)} to="/login_editorial">Editorial</NavLink></li>
                                        <li><hr className="dropdown-divider m-0" /></li>
                                        {/* Devolvemos las clases "text-muted small" originales a Admin */}
                                        <li><NavLink className={({ isActive }) => getDropdownItemClass(isActive, "text-muted small")} to="/login_admin">Admin</NavLink></li>
                                    </ul>
                                </li>
                            )}

                            <li className="nav-item px-lg-2">
                                <NavLink className={navLinkClass} to="/contact">Contacto</NavLink>
                            </li>
                        </ul>

                        <div className="d-flex align-items-center gap-3">
                            {isAuthorized ? (
                                <div className="d-flex align-items-center bg-light rounded-pill p-1 shadow-sm border">
                                    <Link to={getDashboardPath()} className="btn btn-booked-blue rounded-pill px-4 fw-bold border-0 shadow-sm">
                                        Dashboard
                                    </Link>
                                    <button className="btn btn-link text-danger text-decoration-none ms-1 px-3" onClick={handleLogout} title="Cerrar Sesión">
                                        <i className="fas fa-power-off"></i>
                                    </button>
                                </div>
                            ) : (
                                <Link to="/signup_lector" className="btn btn-booked-blue rounded-pill px-4 py-2 fw-bold shadow-sm">
                                    Únete Ahora
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
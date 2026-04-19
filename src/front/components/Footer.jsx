import { Link } from "react-router-dom";

export const Footer = () => (
    <footer className="footer-booked pt-80 pb-40">
        <div className="container">
            <div className="row gy-5">
                {/* LADO IZQUIERDO: Logo y Descripción */}
                <div className="col-lg-3 col-md-6">
                    <div className="footer-brand mb-4">
                        <h2 className="text-info-booked fw-bold mb-0">Booked</h2>
                    </div>
                    <p className="text-muted small">
                        La biblioteca digital definitiva para organizar tus lecturas y conectar con el mundo literario.
                    </p>
                    <div className="social-links d-flex gap-3 mt-4">
                        <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
                        <a href="#" className="social-icon"><i className="fab fa-x-twitter"></i></a>
                        <a href="#" className="social-icon"><i className="fab fa-github"></i></a>
                    </div>
                </div>

                {/* CENTRO 1: Explorar */}
                <div className="col-lg-2 col-md-6">
                    <h6 className="fw-bold mb-4 text-uppercase small">Explorar</h6>
                    <ul className="list-unstyled footer-links">
                        <li><Link to="/" className="text-decoration-none">Inicio</Link></li>
                        <li><Link to="/biblioteca" className="text-decoration-none">Libros</Link></li>
                        <li><Link to="/ver_autores" className="text-decoration-none">Autores</Link></li>
                    </ul>
                </div>

                {/* CENTRO 2: Comunidad */}
                <div className="col-lg-2 col-md-6">
                    <h6 className="fw-bold mb-4 text-uppercase small">Comunidad</h6>
                    <ul className="list-unstyled footer-links">
                        <li><Link to="/post_autores" className="text-decoration-none">Foro Autores</Link></li>
                        <li><Link to="/post_editoriales" className="text-decoration-none">Foro Editorial</Link></li>
                    </ul>
                </div>

                {/* CENTRO 3: Ayuda/Soporte (NUEVA) */}
                <div className="col-lg-2 col-md-6">
                    <h6 className="fw-bold mb-4 text-uppercase small">Soporte</h6>
                    <ul className="list-unstyled footer-links">
                        <li><Link to="/ayuda/preguntas-frecuentes" className="text-decoration-none">Cómo funciona</Link></li>
                        <li><Link to="/ayuda/limitaciones" className="text-decoration-none">Limitaciones IA</Link></li>
                    </ul>
                </div>

                {/* DERECHA: Contacto */}
                <div className="col-lg-3 col-md-6">
                    <h6 className="fw-bold mb-4 text-uppercase small">Contacto</h6>
                    <p className="text-muted small mb-2">
                        <i className="fas fa-envelope text-info-booked me-2"></i> hello@bookedapp.com
                    </p>
                </div>
            </div>
        </div>

        <div className="footer-bottom-bar mt-5 py-3">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-md-6 text-center text-md-start">
                        <p className="text-white small mb-0 opacity-75">
                            © 2026 **Booked**. Hecho con <i className="fas fa-heart mx-1"></i> por el equipo de desarrollo.
                        </p>
                    </div>
                    <div className="col-md-6 text-center text-md-end mt-2 mt-md-0">
                        <Link to="/legal/terminos" className="text-white small text-decoration-none me-3 opacity-75">Términos</Link>
                        <Link to="/legal/privacidad" className="text-white small text-decoration-none opacity-75">Privacidad</Link>
                    </div>
                </div>
            </div>
        </div>
    </footer>
);
import { Link } from "react-router-dom";

export const Footer = () => (
    <footer className="footer-booked pt-80 pb-40">
        <div className="container">
            <div className="row gy-5">
                {/* LADO IZQUIERDO: Logo y Descripción */}
                <div className="col-lg-4 col-md-6">
                    <div className="footer-brand mb-4">
                        {/* Sustituye esto por tu <img /> del logo de Booked */}
                        <h2 className="text-info-booked fw-bold mb-0">Booked</h2>
                    </div>
                    <p className="text-muted pe-lg-5">
                        Organiza tus lecturas, descubre nuevos mundos y conecta con otros lectores apasionados. La biblioteca digital que siempre quisiste.
                    </p>
                    <div className="social-links d-flex gap-3 mt-4">
                        <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
                        <a href="#" className="social-icon"><i className="fab fa-x-twitter"></i></a>
                        <a href="#" className="social-icon"><i className="fab fa-github"></i></a>
                    </div>
                </div>

                {/* CENTRO: Links Rápidos */}
                <div className="col-lg-2 col-md-6">
                    <h5 className="fw-bold mb-4">Explorar</h5>
                    <ul className="list-unstyled footer-links">
                        <li>
                            <Link to="/" className="text-decoration-none">Inicio</Link>
                        </li>
                        <li>
                            <Link to="/ver_autores" className="text-decoration-none">Autores</Link>
                        </li>
                        <li>
                            {/* Supongo que "Libros" va a tu lista general o catálogo */}
                            <Link to="/libros" className="text-decoration-none">Libros</Link>
                        </li>
                        <li>
                            <Link to="/ver_editoriales" className="text-decoration-none">Editoriales</Link>
                        </li>
                    </ul>
                </div>

                {/* CENTRO: Soporte */}
                <div className="col-lg-2 col-md-6">
                    <h5 className="fw-bold mb-4">Soporte</h5>
                    <ul className="list-unstyled footer-links">
                        <li><a href="#">Ayuda</a></li>
                        <li><a href="#">Términos</a></li>
                        <li><a href="#">Privacidad</a></li>
                    </ul>
                </div>

                {/* DERECHA: Contacto */}
                <div className="col-lg-4 col-md-6">
                    <h5 className="fw-bold mb-4">Contacto</h5>
                    <p className="text-muted mb-2">
                        <i className="fas fa-envelope text-info-booked me-2"></i> hello@bookedapp.com
                    </p>
                    {/* <p className="text-muted">
                    <i className="fas fa-location-dot text-info-booked me-2"></i> San Antonio de los Altos, Venezuela
                </p> */}
                </div>
            </div>
        </div>

        <div className="footer-bottom-bar mt-5 py-3">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-12 text-center">
                        <p className="text-white small mb-0 opacity-90">
                            © 2026 **Booked**. Hecho con <i className="fas fa-heart mx-1"></i> por el equipo de desarrollo.
                        </p>
                    </div>
                </div>
            </div>
        </div>

    </footer>
);

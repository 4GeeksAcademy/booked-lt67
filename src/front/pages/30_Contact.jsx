import React from "react";
import { Link } from "react-router-dom";
import logoBookedUrl from "../assets/img/logo_booked.png";
import FotoRodolfo from "../assets/img/RodolfoImage.jpg";

const Contact = () => {
    const team = [
        {
            name: "Rodolfo",
            role: "Full Stack Developer",
            description: "Especialista en arquitectura de backend y gestión de bases de datos. Apasionado por la eficiencia y el código limpio.",
            image: FotoRodolfo, // Corregido: pasamos la variable directamente
            linkedin: "www.linkedin.com/in/rodolfo-porras-avila-a75392b8",
            github: "https://github.com/porrasrodolfo7-hub",
            email: "porrasrodolfo7@gmail.com"
        },
        {
            name: "Daniel",
            role: "Full Stack Developer",
            description: "Experto en desarrollo frontend y diseño de interfaces de usuario. Enfocado en crear experiencias digitales intuitivas.",
            image: logoBookedUrl, // Corregido: pasamos la variable directamente
            linkedin: "#",
            github: "#"
        }
    ];

    return (
        <div className="container py-5">
            {/* Encabezado del Proyecto */}
            <div className="text-center mb-5">
                <h2 className="display-4 fw-bold text-info-booked">El Equipo detrás de Booked</h2>
                <p className="lead text-muted">
                    Desarrollado con dedicación por Rodolfo y Daniel para transformar la experiencia de lectura.
                </p>
                <div className="mx-auto bg-info-booked" style={{ height: "3px", width: "60px" }}></div>
            </div>

            <div className="row justify-content-center g-4">
                {team.map((member, index) => (
                    <div className="col-md-5 col-lg-4" key={index}>
                        <div className="card border-0 shadow-lg h-100 text-center p-4 rounded-4">
                            <div className="mb-4 d-flex justify-content-center">
                                <div 
                                    className="rounded-circle shadow-sm border border-4 border-white d-flex align-items-center justify-content-center bg-light"
                                    style={{ width: "130px", height: "130px", overflow: "hidden" }}
                                >
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        style={{ width: "100%", height: "auto", objectFit: "contain" }}
                                    />
                                </div>
                            </div>
                            <div className="card-body p-0">
                                <h4 className="fw-bold mb-1">{member.name}</h4>
                                <p className="text-info-booked fw-semibold mb-3">{member.role}</p>
                                <p className="card-text text-muted mb-4 small">
                                    {member.description}
                                </p>
                                
                                <div className="d-flex justify-content-center gap-3">
                                    <a href={member.linkedin} className="btn btn-booked-blue btn-sm rounded-circle p-2">
                                        <i className="fab fa-linkedin-in" style={{ width: "18px" }}></i>
                                    </a>
                                    <a href={member.github} className="btn btn-outline-dark btn-sm rounded-circle p-2">
                                        <i className="fab fa-github" style={{ width: "18px" }}></i>
                                    </a>
                                    <a href={`mailto:${member.email}`} className="btn btn-outline-secondary btn-sm rounded-circle p-2">
                                        <i className="far fa-envelope" style={{ width: "18px" }}></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-5">
                <Link to="/" className="btn btn-booked-blue rounded-pill px-4 shadow-sm fw-bold">
                    Volver al Inicio
                </Link>
            </div>
        </div>
    );
};

export default Contact;
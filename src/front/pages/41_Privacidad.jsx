import React from 'react';
import InfoPage from "../components//InfoPage"; 
const Privacidad = () => {
    return (
        <InfoPage 
            title="Política de Privacidad" 
            icon="fa-shield-alt"
            subtitle="Tranquilidad para tus datos."
        >
            <section className="mb-4">
                <h4 className="fw-bold mb-3"><i className="fas fa-handshake me-2 text-info-booked"></i> Tus Datos Personales</h4>
                <p>En Booked valoramos tu privacidad. Solo solicitamos la información mínima necesaria (como tu correo electrónico) para que puedas gestionar tu cuenta y guardar tus preferencias</p>
            </section>

            <section className="mb-4">
                <h4 className="fw-bold mb-3"><i className="fas fa-book me-2 text-info-booked"></i> Catálogo y Google Books</h4>
                <p>Cuando utilizas el Escáner IA, la imagen de la portada se procesa de forma temporal y segura mediante la API de Google Gemini para extraer la información del libro. No almacenamos tus fotos personales en nuestros servidores</p>
                
            </section>

            <section>
                <h4 className="fw-bold mb-3"><i className="fas fa-user-lock me-2 text-info-booked"></i> Cookies y Almacenamiento</h4>
                <p>Utilizamos tecnologías estándar para mantener tu sesión activa y recordar tus preferencias de navegación, garantizando una experiencia fluida.</p>
            </section>

            <section>
                <h4 className="fw-bold mb-3"><i className="fas fa-graduation-cap me-2 text-info-booked"></i> Transparencia</h4>
                <p>Booked es un proyecto educativo y de comunidad. No vendemos tus datos a terceros ni los utilizamos para fines publicitarios.</p>
            </section>
        </InfoPage>
    );
};

export default Privacidad;
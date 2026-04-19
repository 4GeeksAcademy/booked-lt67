import React from 'react';
import InfoPage from "../components//InfoPage"; 
const LimitacionesIA = () => {
    return (
        <InfoPage 
            title="Limitaciones del Sistema" 
            icon="fa-microchip"
            subtitle="Transparencia sobre nuestra tecnología y cómo mejorar tus resultados."
        >
            <section className="mb-5">
                <h4 className="fw-bold mb-3"><i className="fas fa-camera me-2 text-info-booked"></i> Escáner de Portadas</h4>
                <p>Nuestro escáner utiliza <strong>Gemini 2.5 Flash</strong>. Aunque es sumamente potente, su precisión depende de:</p>
                <ul>
                    <li><strong>Iluminación:</strong> Evita reflejos de luz directa sobre la portada.</li>
                    <li><strong>Nitidez:</strong> Si la imagen está movida, la IA podría confundir caracteres.</li>
                    <li><strong>Tipografías artísticas:</strong> Algunos títulos de fantasía o terror usan fuentes complejas que pueden ser difíciles de leer para el algoritmo.</li>
                </ul>
            </section>

            <section className="mb-5">
                <h4 className="fw-bold mb-3"><i className="fas fa-database me-2 text-info-booked"></i> Catálogo y Google Books</h4>
                <p>Booked se conecta con la API de Google Books para obtener metadatos oficiales:</p>
                <ul>
                    <li><strong>Disponibilidad:</strong> Si un libro es muy raro, auto-publicado o muy antiguo, Google podría no tener su portada o descripción.</li>
                    <li><strong>Conexión:</strong> Si los servicios de Google experimentan una caída, las búsquedas podrían fallar momentáneamente.</li>
                </ul>
            </section>

            <section>
                <h4 className="fw-bold mb-3"><i className="fas fa-copy me-2 text-info-booked"></i> Duplicidad de Datos</h4>
                <p>Es posible encontrar autores o editoriales repetidas. Esto sucede cuando el sistema recibe nombres con variaciones (ej: "Penguin" vs "Penguin Books"). Estamos trabajando en un algoritmo de limpieza para unificar estos registros.</p>
            </section>
        </InfoPage>
    );
};

export default LimitacionesIA;
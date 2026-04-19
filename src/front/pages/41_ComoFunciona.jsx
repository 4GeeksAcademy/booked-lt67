import React from 'react';
import InfoPage from "../components//InfoPage"; 
const ComoFunciona = () => {
    return (
        <InfoPage 
            title="¿Cómo funciona?" 
            icon="fa-info-circle"
            subtitle="Guia facil y sencilla de Booked"
        >
            <section className="mb-4">
                <h4 className="fw-bold mb-3"><i className="fas fa-compass me-2 text-info-booked"></i> Explora el Catálogo</h4>
                <p>Busca tus libros favoritos por título o autor. Nuestra base de datos se conecta con Google Books para ofrecerte la información más completa y actualizada.</p>
            </section>

            <section className="mb-4">
                <h4 className="fw-bold mb-3"><i className="fas fa-box-archive me-2 text-info-booked"></i> Escanea y Guarda</h4>
                <p>Nuestra funcionalidad estrella. Simplemente toma una foto de la portada de un libro físico y nuestra Inteligencia Artificial lo identificará y lo añadirá automáticamente a nuestra biblioteca común.</p>
                
            </section>

            <section>
                <h4 className="fw-bold mb-3"><i className="fas fa-users me-2 text-info-booked"></i> Conoce otros Lectores y comparte con ellos </h4>
                <p>En Booked conseguiras a muchos otros amantes de la lectura, conecta y comparte con ellos lo que lees, piensas y te gusta.</p>
            </section>

            <section>
                <h4 className="fw-bold mb-3"><i className="fas fa-pen me-2 text-info-booked"></i> Conecta con Autores y Editoriales</h4>
                <p>Sigue los feeds de noticias para estar al tanto de los últimos lanzamientos y publicaciones directamente desde las fuentes oficiales.</p>
            </section>

            <section>
                <h4 className="fw-bold mb-3"><i className="fas fa-book-atlas me-2 text-info-booked"></i> Gestiona tu Biblioteca</h4>
                <p>Añade libros a tus favoritos, consulta detalles técnicos, géneros y descripciones para organizar tu próxima gran lectura.</p>
            </section>
        </InfoPage>
    );
};

export default ComoFunciona;
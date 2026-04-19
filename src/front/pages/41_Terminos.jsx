import React from 'react';
import InfoPage from "../components//InfoPage"; 
const Terminos = () => {
    return (
        <InfoPage 
            title="Terminos" 
            icon="fa-gavel"
            subtitle="Acerca de derechos de Autor."
        >
            <section className="mb-5">
                <h4 className="fw-bold mb-3"><i className="fas fa-brain me-2 text-info-booked"></i> Propiedad Intelectual</h4>
                <p>"Booked es una herramienta de organización personal. No poseemos los derechos de las portadas de libros ni los logos de editoriales mostrados; estos pertenecen a sus respectivos autores y casas editoras."</p>
                
            </section>

            <section className="mb-5">
                <h4 className="fw-bold mb-3"><i className="fas fa-hand me-2 text-info-booked"></i> Responsabilidad</h4>
                <p>"No nos hacemos responsables por la exactitud de los datos generados por la IA. El usuario debe verificar la información antes de darla por definitiva."</p>
            </section>

        </InfoPage>
    );
};

export default Terminos;
"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Lector, Editorial, Autor, Libro, LibrosFavoritos, Lector_Autores_Favoritos, Reviews
from api.utils import generate_sitemap, APIException
from flask_cors import CORS

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

 
@api.route('/lector', methods=['GET'])
def get_lectores():

    all_lectores = Lector.query.all()
    print(all_lectores)
    results = list( map(lambda lector: lector.serialize(),all_lectores) )
    return jsonify(results), 200

@api.route('/lector/<int:lector_id>', methods=['GET'])
def get_lector(lector_id):

    lector = Lector.query.filter_by(id=lector_id).first()
    print(lector.serialize)
    return jsonify(lector.serialize()), 200

@api.route('/lector/<int:lector_id>', methods=['DELETE'])
def delete_lector(lector_id):

    lector = Lector.query.filter_by(id=lector_id).first()
    if lector is None:
        return {
            "message": "No se encontro el lector con el id" + str(lector_id)
        }, 400
    print(lector.serialize)
    db.session.delete(lector)
    db.session.commit()
    response_body = {
        "message": "Se elimino el lector: " + lector.username 
    }

    return jsonify(response_body), 200

@api.route('/lector', methods=['POST'])
def add_lectores():
    body = request.get_json()

    email_existente = Lector.query.filter_by(email=body["email"]).first()
    if email_existente:
        return jsonify({"message": "El correo electrónico ya está registrado"}), 400
    
    username_existente = Lector.query.filter_by(username=body["username"]).first()
    if username_existente:
        return jsonify({"message": "El username ya existe, prueba otro"}), 400

    
    lector = Lector(
        email=body["email"], 
        username=body["username"], 
        nombre=body["nombre"],
        apellido=body["apellido"],
        pais_donde_reside=body["pais donde reside"],
        password=body["password"], 
        is_active=True
        )
    
    db.session.add(lector)
    db.session.commit()
    
    response_body = {
        "message": "Se creo el lector",
        "lector": lector.serialize()
    }

    return jsonify(response_body), 200

@api.route('/lector/<int:lector_id>', methods=['PUT'])
def update_lector(lector_id):
    
    lector = Lector.query.filter_by(id=lector_id).first()

    body = request.get_json()

    lector.email = body.get("email", lector.email)
    lector.username = body.get("username", lector.username)
    lector.nombre = body.get("nombre", lector.nombre)
    lector.apellido = body.get("apellido", lector.apellido)
    lector.pais_donde_reside = body.get("pais donde reside", lector.pais_donde_reside)
    
    db.session.commit()
    
    response_body = {
        "message": "se actualizo la informacion del lector",
        "lector": lector.serialize()
    }
    

    return jsonify(response_body), 200

 
@api.route('/autor', methods=['GET'])
def get_autores():

    all_autores = Autor.query.all()
    print(all_autores)
    results = list( map(lambda autor: autor.serialize(),all_autores) )
    return jsonify(results), 200

@api.route('/autor/<int:autor_id>', methods=['GET'])
def get_autor(autor_id):

    autor = Autor.query.filter_by(id=autor_id).first()
    print(autor.serialize)
    return jsonify(autor.serialize()), 200

@api.route('/autor', methods=['POST'])
def create_autor():
    body = request.get_json()

    if not body or "nombre" not in body or "apellido" not in body or "pais" not in body or "email" not in body or "password" not in body:
        return jsonify({"msg": "Todos los campos son obligatorios"}), 400

    new_autor = Autor(
        nombre=body.get("nombre"),
        apellido=body.get("apellido"),
        pais=body.get("pais"),
        email=body.get("email"),
        password=body.get("password")
    )
    
    db.session.add(new_autor)
    db.session.commit()
    return jsonify({"msg": "Autor creadao", "autor": new_autor.serialize()}), 201

@api.route('/autor/<int:autor_id>', methods=['DELETE'])
def delete_autor(autor_id):

    autor = Autor.query.get(autor_id)

    if autor is None:
        return jsonify({"msg": f"La autor con ID {autor_id} no existe"}), 404

    db.session.delete(autor)
    db.session.commit()
    return jsonify({"msg": "Autor eliminada con éxito"}), 200

@api.route('/autor/<int:autor_id>', methods=['PUT'])
def update_autor(autor_id):
    
    autor = Autor.query.filter_by(id=autor_id).first()

    body = request.get_json()

    autor.email = body.get("email", autor.email)
    autor.password = body.get("password", autor.password)
    autor.nombre = body.get("nombre", autor.nombre)
    autor.apellido = body.get("apellido", autor.apellido)
    autor.pais= body.get("pais donde reside", autor.pais)
    
    db.session.commit()
    
    response_body = {
        "message": "se actualizo la informacion del autor",
        "autor": autor.serialize()
    }

    return jsonify(response_body), 200

@api.route('/editorial', methods=['GET'])
def get_editoriales():

    all_editoriales = Editorial.query.all()
    print(all_editoriales)
    results = list( map(lambda editorial: editorial.serialize(),all_editoriales) )
    return jsonify(results), 200

@api.route('/editorial/<int:editorial_id>', methods=['GET'])
def get_editorial(editorial_id):

    editorial = Editorial.query.filter_by(id=editorial_id).first()
    print(editorial.serialize)
    return jsonify(editorial.serialize()), 200

@api.route('/editorial', methods=['POST'])
def create_editorial():
    body = request.get_json()

    if not body or "nombre" not in body or "pais" not in body or "email" not in body or "password" not in body:
        return jsonify({"msg": "Todos los campos son obligatorios"}), 400

    new_editorial = Editorial(
        nombre=body.get("nombre"),
        pais=body.get("pais"),
        email=body.get("email"),
        password=body.get("password")
    )
    
    db.session.add(new_editorial)
    db.session.commit()
    return jsonify({"msg": "Editorial creada", "editorial": new_editorial.serialize()}), 201

@api.route('/editorial/<int:editorial_id>', methods=['DELETE'])
def delete_editorial(editorial_id):

    editorial = Editorial.query.get(editorial_id)

    if editorial is None:
        return jsonify({"msg": f"La editorial con ID {editorial_id} no existe"}), 404

    db.session.delete(editorial)
    db.session.commit()
    return jsonify({"msg": "Editorial eliminada con éxito"}), 200

@api.route('/editorial/<int:editorial_id>', methods=['PUT'])
def update_editorial(editorial_id):
    
    editorial = Editorial.query.filter_by(id=editorial_id).first()

    body = request.get_json()

    editorial.email = body.get("email", editorial.email)
    editorial.password = body.get("password", editorial.password)
    editorial.nombre = body.get("nombre", editorial.nombre)
    editorial.pais= body.get("pais donde reside", editorial.pais)
    
    db.session.commit()
    
    response_body = {
        "message": "se actualizo la informacion del editorial",
        "editorial": editorial.serialize()
    }

    return jsonify(response_body), 200

@api.route('/libro', methods=['GET'])
def get_libros():

    all_libros = Libro.query.all()
    print(all_libros)
    results = list( map(lambda libro: libro.serialize(),all_libros) )
    return jsonify(results), 200

@api.route('/libro/<int:libro_id>', methods=['GET'])
def get_libro(libro_id):

    editorial = Libro.query.filter_by(id=libro_id).first()
    print(editorial.serialize)
    return jsonify(editorial.serialize()), 200

@api.route('/libro', methods=['POST'])
def create_libro():
    body = request.get_json()

    if not body.get("autor_id") or not body.get("editorial_id"):
        return jsonify({"msg": "Debes seleccionar un Autor y una Editorial válidos"}), 400

    new_libro = Libro(
        nombre=body.get("nombre"),
        genero=body.get("genero"),
        autor_id=body.get("autor_id"),
        editorial_id=body.get("editorial_id") 
    )
    
    db.session.add(new_libro)
    db.session.commit()
    return jsonify({"msg": "Libro creado", "libro": new_libro.serialize()}), 201

@api.route('/libro/<int:libro_id>', methods=['DELETE'])
def delete_libro(libro_id):

    libro = Libro.query.get(libro_id)

    if libro is None:
        return jsonify({"msg": f"El libro con ID {libro_id} no existe"}), 404

    db.session.delete(libro)
    db.session.commit()
    return jsonify({"msg": "Libro eliminado con éxito"}), 200

@api.route('/libro/<int:libro_id>', methods=['PUT'])
def update_libros(libro_id):
    
    libro = Libro.query.filter_by(id=libro_id).first()

    body = request.get_json()

    libro.email = body.get("email", libro.email)
    libro.genero = body.get("genero", libro.genero)
    libro.autor_id = body.get("autor_id", libro.autor_id)
    libro.editorial_id = body.get("editorial_id", libro.editorial_id)
    
    
    db.session.commit()
    
    response_body = {
        "message": "se actualizo la informacion del libro",
        "libro": libro.serialize()
    }

    return jsonify(response_body), 200

@api.route('/lector/<int:lector_id>/favoritos', methods=['GET'])
def get_favoritos_por_lector(lector_id):
    favoritos = LibrosFavoritos.query.filter_by(lector_id=lector_id).all()
    if not favoritos:
        return jsonify([]), 200
    
    results = [fav.serialize() for fav in favoritos]
    
    return jsonify(results), 200

@api.route('/favoritos/libros', methods=['POST'])
def add_libro_favorito():
    body = request.get_json()

    existe = LibrosFavoritos.query.filter_by(
        lector_id=body["lector_id"], 
        libro_id=body["libro_id"]
    ).first()

    if existe:
        return jsonify({"msg": "Este libro ya está en tus favoritos"}), 400

    libro = Libro.query.get(body["libro_id"])
    if libro is None:
        return jsonify({"msg": "El Libro que intentas agregar no existe"}), 404
    
    new_fav = LibrosFavoritos (
        lector_id = body["lector_id"],
        libro_id = body["libro_id"]
    )
    db.session.add(new_fav)
    db.session.commit()

    return jsonify(new_fav.serialize()), 200

@api.route('/favoritos/libros/<int:lector_id>/<int:libro_id>', methods=['DELETE'])
def delete_libro_favorito(lector_id, libro_id):

    fav_to_delete = LibrosFavoritos.query.filter_by(
        lector_id=lector_id, 
        libro_id=libro_id
    ).first()

    if fav_to_delete is None:
        return jsonify({"msg": "No se encontró el favorito para eliminar"}), 404
    
    db.session.delete(fav_to_delete)
    db.session.commit()
    return jsonify({"msg": "Libro eliminado de la lista"}), 200

@api.route('/favoritos/libros/<int:fav_id>', methods=['PUT'])
def update_libro_favorito(fav_id):
    
    favorito = LibrosFavoritos.query.filter_by(id=fav_id).first()       

    if favorito is None:
        return jsonify({"msg": "Ese registro de favorito no existe"}), 404 

    body = request.get_json()

    if "lector_id" in body:
        favorito.lector_id = body["lector_id"]
    if "libro_id" in body:
        favorito.libro_id = body["libro_id"]

    db.session.commit()
    return jsonify({
            "msg": "Favorito actualizado con éxito",
            "result": favorito.serialize()
        }), 200
    
@api.route('/lector_autores_favoritos', methods=['GET'])
def get_lector_autores_favoritos():

    all_lector_autores_favoritos = Lector_Autores_Favoritos.query.all()
    print(all_lector_autores_favoritos)
    results = list( map(lambda lector_autores_favoritos: lector_autores_favoritos.serialize(),all_lector_autores_favoritos) )
    return jsonify(results), 200

@api.route('/lector_autores_favoritos/<int:fav_id>', methods=['GET'])
def get_lector_autor_favorito(fav_id):

    item = Lector_Autores_Favoritos.query.filter_by(id=fav_id).first()
    return jsonify(item.serialize()), 200

@api.route('/lector_autores_favoritos', methods=['POST'])
def create_lector_autor_favorito():

    body = request.get_json()

    nuevo = Lector_Autores_Favoritos(
        lector_id=body["lector_id"],
        autor_id=body["autor_id"]
    )

    db.session.add(nuevo)
    db.session.commit()

    return jsonify(nuevo.serialize()), 201

@api.route('/lector_autores_favoritos/<int:fav_id>', methods=['PUT'])
def update_lector_autores_favoritos(fav_id):

    fav = Lector_Autores_Favoritos.query.get_or_404(fav_id)

    body = request.get_json()

    fav.lector_id = body["lector_id"]
    fav.autor_id = body["autor_id"]

    db.session.commit()

    return jsonify(fav.serialize()), 200

@api.route('/lector_autores_favoritos/<int:fav_id>', methods=['DELETE'])
def delete_lector_autor_favorito(fav_id):

    fav = Lector_Autores_Favoritos.query.get_or_404(fav_id)

    db.session.delete(fav)
    db.session.commit()

    return jsonify({"msg": "Eliminado con éxito"}), 200

@api.route('/reviews', methods=['GET'])
def get_reviews():

    all_reviews = Reviews.query.all()
    print(all_reviews)
    results = list( map(lambda reviews: reviews.serialize(),all_reviews) )
    return jsonify(results), 200
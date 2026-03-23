"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Lector, Editorial
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
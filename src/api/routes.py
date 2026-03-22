"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Lector
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
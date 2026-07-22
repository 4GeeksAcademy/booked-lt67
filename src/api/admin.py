import os
import inspect
from flask_admin import Admin
from . import models
from .models import db
from flask_admin.contrib.sqla import ModelView
# from flask_admin.theme import Bootstrap4Theme


def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    
    # Crea el admin sin el parámetro 'theme' que no existe en esta versión
    admin = Admin(app, name='Booked Admin', template_mode='bootstrap4')

    # El resto del código se queda igual porque ya usa la variable 'admin'
    for name, obj in inspect.getmembers(models):
        if inspect.isclass(obj) and issubclass(obj, db.Model):
            admin.add_view(ModelView(
                obj, 
                db.session, 
                name=name, 
                endpoint=f"admin_view_{name.lower()}" 
            ))
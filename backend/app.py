from server import app
from models import db, User, Pet
from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, JWTManager
from dotenv import load_dotenv
import os

load_dotenv()

jwt_secret_key = os.getenv('JWT_SECRET_KEY', 'default_secret_key')

# Print the secret key for debugging (be cautious in production)
print(f"JWT Secret Key: {jwt_secret_key}")

# Flask-JWT-Extended configuration
app.config['JWT_SECRET_KEY'] = jwt_secret_key  # Use the secret key
app.config['JWT_TOKEN_LOCATION'] = ['headers']  # Define where to look for the token

# Initialize the JWTManager
jwt = JWTManager(app)


@app.route('/users', methods=['POST'])
def create_user():
    try:
        # Parse JSON data from the request
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')   
        password = data.get('password')

        # Validate input
        if not username or not email or not password:
            return jsonify({'status': 'error', 'message': 'All fields are required!'}), 400

        # Check if the username or email already exists
        existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
        if existing_user:
            return jsonify({'status': 'error', 'message': 'Username or email already exists!'}), 400

        # Hash the password before storing it
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

        # Create a new user
        new_user = User(username=username, email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({'status': 'success', 'message': 'User created successfully!'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': 'Something went wrong!', 'error': str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')

    # Validate credentials and authenticate the user
    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password, password):
        # Create JWT token with the user ID as the identity
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"msg": "Invalid credentials"}), 401

@app.route('/users/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    try:
        user = User.query.get(user_id)
        if user:
            return jsonify({
                'status': 'success',
                'data': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
            }), 200
        else:
            return jsonify({'status': 'error', 'message': 'User not found'}), 404
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/pets', methods=['GET'])
@jwt_required()
def get_pets():
    # Get the identity (subject) from the JWT token
    user_id = get_jwt_identity()  # This should return the user_id stored in the token
    print(f"User ID from JWT: {user_id}")  # Debugging

    if not isinstance(user_id, str):
        return jsonify({"msg": "User ID must be a string"}), 422

    # Fetch pets associated with the user_id
    pets = Pet.query.filter_by(owner_id=user_id).all()
    if not pets:
        return jsonify({"msg": "No pets found for this user"}), 404

    pet_list = [{
        "id": pet.id,
        "name": pet.name,
        "species": pet.species,
        "age": int(pet.age),
        "description": pet.description,
        "date_added": pet.date_added,
    } for pet in pets]

    return jsonify(pet_list), 200



@app.route('/newpet', methods=['POST'])
@jwt_required()  # Ensures the user is authenticated
def create_pet():
    try:
        # Get the user ID from the JWT token
        owner_id = get_jwt_identity()  # This fetches the user ID from the token

        data = request.get_json()
        name = data.get('name')
        species = data.get('species')
        age = int(data.get('age'))  # Ensure age is treated as an integer
        description = data.get('description')

        # Validate input
        if not name or not species or not age:
            return jsonify({'status': 'error', 'message': 'All fields are required!'}), 400

        # Create a new pet with the owner_id (logged-in user's ID)
        new_pet = Pet(name=name, species=species, age=age, description=description, owner_id=owner_id)
        
        db.session.add(new_pet)
        db.session.commit()

        return jsonify({'status': 'success', 'message': 'Pet created successfully!'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': 'Something went wrong!', 'error': str(e)}), 500

@app.route('/pets/<int:pet_id>', methods=['DELETE'])
@jwt_required()
def delete_pet(pet_id):
    user_id = get_jwt_identity()
    
    # Find the pet with the given ID and check ownership
    pet = Pet.query.filter_by(id=pet_id, owner_id=user_id).first()
    
    if not pet:
        return jsonify({"msg": "Pet not found or unauthorized"}), 404

    # Delete the pet
    db.session.delete(pet)
    db.session.commit()
    return jsonify({"msg": f"Pet with ID {pet_id} has been deleted"}), 200

# UPDATE route: Update a pet by ID
@app.route('/pets/<int:pet_id>', methods=['PUT'])
@jwt_required()
def update_pet(pet_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    # Find the pet with the given ID and check ownership
    pet = Pet.query.filter_by(id=pet_id, owner_id=user_id).first()
    
    if not pet:
        return jsonify({"msg": "Pet not found or unauthorized"}), 404

    # Update pet fields with provided data
    if 'name' in data:
        pet.name = data['name']
    if 'species' in data:
        pet.species = data['species']
    if 'age' in data:
        pet.age = data['age']
    if 'description' in data:
        pet.description = data['description']

    # Commit changes to the database
    db.session.commit()
    return jsonify({"msg": f"Pet with ID {pet_id} has been updated"}), 200

if __name__ == '__main__':
    app.run(debug=True)

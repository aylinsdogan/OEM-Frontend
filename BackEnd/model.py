
from pymongo import MongoClient
import numpy as np
import pickle
import tensorflow as tf
import cv2 as cv

def predictImage(imageEnf):
    # Replace the connection URI with your MongoDB connection string
    client = MongoClient('mongodb+srv://aylinsenadogan2000:L32ZgjmELD6iiYqz@cluster0.dixp7iw.mongodb.net/')
    db = client['LRModel']
    collection = db['AI']

    if isinstance(imageEnf, list):
        imageEnf = np.array(imageEnf)
        
    imageEnf = imageEnf.astype(np.uint8)
    imageEnf = cv.cvtColor(imageEnf, cv.COLOR_BGR2RGB)  # Convert RGB to BGR if needed

    # Resize the image to the desired dimensions
    imageEnf = tf.image.resize(imageEnf, (450, 450))


    # Retrieve the model data from MongoDB
    model_data = collection.find_one()['model']

    # Deserialize the model
    logistic_regression = pickle.loads(model_data)

    # Load the pre-trained model (e.g., VGG16) without the classification layers
    pretrained_model = tf.keras.applications.VGG16(include_top=False, weights='imagenet')
    x_test_preprocessed = tf.keras.applications.vgg16.preprocess_input(np.expand_dims(imageEnf.numpy().copy(), axis=0))

    # Extract features from the image using the pre-trained model
    test_features = pretrained_model.predict(x_test_preprocessed)

    # Flatten the extracted features
    test_features_flat = test_features.reshape(test_features.shape[0], -1)

    # Predict on the test image
    predictions = logistic_regression.predict(test_features_flat)
    predicted_probabilities = logistic_regression.predict_proba(test_features_flat)

    max_probability_index = np.argmax(predicted_probabilities)
    max_probability_class = max_probability_index  # Assuming class 0 is non-infected and class 1 is infected

    # Assign the predicted probability for the higher class to a variable
    max_probability = predicted_probabilities[0, max_probability_index]  # Assuming a single test image
    class_label = "Infected" if max_probability_class == 1 else "Non-Infected"
    result = f"{max_probability * 100:.2f}%"

    return predictions, result

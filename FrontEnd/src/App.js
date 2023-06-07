import React, { useState } from 'react';
import './App.css';
import { Button, Container, Typography } from '@mui/material';
import { MuiFileInput } from 'mui-file-input';

function App() {
  const [backendData, setBackendData] = useState([]);
  const [result, setResult] = useState([]);
  const [predictions, setPredictions] = useState([]); // New state variable
  const [imageWidth, setImageWidth] = useState(0); // State variable for image width
  const [imageHeight, setImageHeight] = useState(0); // State variable for image height
  const [imageData, setImageData] = useState([]);
  const [sendButtonClicked, setSendButtonClicked] = useState(false); // New state variable

  
  function readImage(file) {
    setPredictions([]);
    const image = document.getElementById('image');
    image.src = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setImageWidth(img.width);
        setImageHeight(img.height);
  
        // Create a canvas element to extract pixel data
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
  
        // Get the pixel data
        const imageData = context.getImageData(0, 0, img.width, img.height).data;
  
        // Rearrange the 1D array into a 3D array
        const rgbData = [];
        for (let i = 0; i < img.height; i++) {
          const row = [];
          for (let j = 0; j < img.width; j++) {
            const index = (i * img.width + j) * 4; // Each pixel takes 4 array elements (R, G, B, A)
            const pixel = [imageData[index + 2], imageData[index + 1], imageData[index]]; // Swap the positions of the color channels
            row.push(pixel);
          }
          rgbData.push(row);
        }
  
        setImageData(rgbData);
      };
      img.src = URL.createObjectURL(file);
      setBackendData(reader.result);
    };
    reader.readAsArrayBuffer(file);
  }
  

  async function sendBackend() {
    setSendButtonClicked(true);
    const button = document.getElementById('submit-button');
    button.innerText = 'SENDING...';
    const typedArray = new Uint8Array(backendData);
    const array = [];

    for (let i = 0; i < typedArray.length; i++) {
      array.push(typedArray[i]);
    }
    const requestData = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        width: imageWidth,
        height: imageHeight,
        data: imageData,
      }),
    };

    try {
      const response = await fetch('http://localhost:5000/data', requestData);
      if (response.ok) {
        const data = await response.json();
        setResult([data.result]);
        setPredictions(data.predictions); // Update the predictions state
      } else {
        console.log('Error:', response.status);
        // Handle the error
      }
    } catch (error) {
      console.log('Error:', error);
      // Handle the error
    }
  
    button.innerText = 'SEND';
  }
  

  return (
    <Container>
      <Typography
        variant="h3"
        sx={{ color: 'white', display: 'flex', justifyContent: 'center' }}
      >
        Otisis Media
      </Typography>
      <Container
        sx={{ display: 'flex', justifyContent: 'center', marginBottom: '1cm' }}
      >
        <img alt="" src="" id="image"  ></img>
      </Container>
      <Container sx={{ display: 'flex', justifyContent: 'center' }}>
        <MuiFileInput
          className="file-input"
          placeholder="Select a file"
          value={null}
          onChange={readImage}
          size="small"
        ></MuiFileInput>
        <Button
          variant="contained"
          onClick={sendBackend}
          id="submit-button"
          sx={{ marginLeft: '1cm' }}
        >
          Send
        </Button>
        
      </Container>
      <Container sx={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        {predictions.length === 0 && sendButtonClicked ? (
          <Typography variant="body1" sx={{ color: 'white', fontSize: '1.9rem' }}>
            ...
          </Typography>
        ) : (
          predictions.map((prediction, index) => (
            <Typography
              key={index}
              variant="body1"
              sx={{
                color: 'white',
                fontSize: '1.9rem',
              }}
            >
              {prediction === 1 ? result + ' chance of middle ear infection' : result + ' chance of not having a middle ear infection'}
            </Typography>
          ))
        )}
      </Container>

    </Container>
  );
}

export default App;

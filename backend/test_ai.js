const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testIdentify() {
    try {
        const formData = new FormData();
        const imagePath = '../frontend/assets/icon.png';
        formData.append('image', fs.createReadStream(imagePath));

        console.log("Sending request to backend /identify...");
        const response = await axios.post('http://localhost:5000/api/ai/identify', formData, {
            headers: formData.getHeaders()
        });
        
        console.log("Success:", response.data);
    } catch (e) {
        console.error("Test failed:", e.response ? e.response.data : e.message);
    }
}

testIdentify();

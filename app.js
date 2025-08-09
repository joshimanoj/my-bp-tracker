const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  alert('Speech recognition is not supported in this browser. Please use Chrome or another compatible browser.');
  document.getElementById('voiceInput').disabled = true;
} else {
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  // Check microphone permission status
  navigator.permissions.query({ name: 'microphone' }).then((result) => {
    if (result.state === 'denied') {
      alert('Microphone access is denied. Please enable it in your browser or device settings.');
      document.getElementById('voiceInput').disabled = true;
    }
  }).catch((err) => {
    console.error('Error checking microphone permission:', err);
  });

  document.getElementById('voiceInput').addEventListener('click', () => {
    recognition.start();
    console.log('🎤 Listening for voice input...');
  });

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    console.log('Transcript:', transcript);
    try {
      const response = await fetch('/api/parse-readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      const data = await response.json();
      if (data.error) {
        console.error('Error from server:', data.error);
        alert('Failed to parse voice input: ' + data.error);
        return;
      }
      document.getElementById('systolic').value = data.systolic || '';
      document.getElementById('diastolic').value = data.diastolic || '';
      document.getElementById('heartRate').value = data.heartRate || '';
      console.log('Input fields updated:', data);
    } catch (error) {
      console.error('Error calling /api/parse-readings:', error);
      alert('An error occurred while processing voice input.');
    }
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if (event.error === 'not-allowed') {
      alert('Microphone access denied. Please enable it in your browser or device settings.');
    } else {
      alert('Speech recognition error: ' + event.error);
    }
  };

  recognition.onend = () => {
    console.log('🎤 Speech recognition stopped.');
  };

  // Handle Add Reading button (POST to /api/add-reading)
  document.getElementById('addReading').addEventListener('click', async () => {
    const systolic = parseInt(document.getElementById('systolic').value);
    const diastolic = parseInt(document.getElementById('diastolic').value);
    const heartRate = parseInt(document.getElementById('heartRate').value);

    if (!systolic || !diastolic || !heartRate) {
      alert('Please enter all values.');
      return;
    }

    try {
      const response = await fetch('/api/add-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systolic, diastolic, heartRate }),
      });
      const data = await response.json();
      if (data.error) {
        console.error('Error adding reading:', data.error);
        alert('Failed to add reading: ' + data.error);
        return;
      }
      alert('Reading added successfully!');
      // Optionally refresh readings or update UI
    } catch (error) {
      console.error('Error calling /api/add-reading:', error);
      alert('An error occurred while adding reading.');
    }
  });

  // Fetch and display readings
  async function fetchReadings() {
    try {
      const response = await fetch('/api/get-readings');
      const data = await response.json();
      if (data.error) {
        console.error('Error fetching readings:', data.error);
        return;
      }
      console.log('Readings:', data);
      // Update UI (e.g., table or chart) with data
    } catch (error) {
      console.error('Error calling /api/get-readings:', error);
    }
  }

  fetchReadings(); // Load readings on page load
}
const urlFetch = 'http://127.0.0.1:8000/apipolls/'



async function fetchData() {
  try {
    const response = await fetch(urlFetch);
    const data = await response.json();
    
    // Access your data here
    console.log(data.data); // Your array
    
    return data.data; // If you want to return it
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call the async function
fetchData();
setInterval(fetchData, 2000)
// Create a simple HTML test page to debug the API
const testHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>API Test</title>
</head>
<body>
    <h1>API Test Page</h1>
    <button onclick="testAPI()">Test Conversations API</button>
    <div id="result"></div>
    
    <script>
        async function testAPI() {
            const result = document.getElementById('result');
            try {
                result.innerHTML = 'Testing API...';
                const response = await fetch('/api/conversations');
                const data = await response.json();
                result.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
                result.innerHTML = 'Error: ' + error.message;
            }
        }
        
        // Auto-test on page load
        testAPI();
    </script>
</body>
</html>
`;

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(testHtml);
};

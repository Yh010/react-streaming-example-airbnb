const express = require('express');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const app = express();
const port = 3000;

const fetchData = () => new Promise(resolve => 
  setTimeout(() => resolve({ title: 'Traditional SSR App', content: 'This is the main content.' }), 2000)
);

const App = ({ data }) => React.createElement('div', null,
  React.createElement('h1', null, data.title),
  React.createElement('p', null, data.content)
);

app.get('/', async (req, res) => {
  console.time('request');
  const data = await fetchData();
  const content = ReactDOMServer.renderToString(React.createElement(App, { data }));
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${data.title}</title>
        <script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
        <script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
      </head>
      <body>
        <div id="root">${content}</div>
        <script>
          window.__INITIAL_DATA__ = ${JSON.stringify(data)};
          ReactDOM.hydrate(
            React.createElement(${App.toString()}, { data: window.__INITIAL_DATA__ }),
            document.getElementById('root')
          );
        </script>
      </body>
    </html>
  `);
  console.timeEnd('request');
});

app.listen(port, () => {
  console.log(`Traditional SSR app listening at http://localhost:${port}`);
});
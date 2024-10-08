
const express = require('express');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const app = express();
const port = 3001;


const fetchData = () => new Promise(resolve => 
  setTimeout(() => resolve({ title: 'Streaming SSR App', content: 'This is the main content.' }), 2000)
);


const EarlyHead = () => React.createElement('head', null,
  React.createElement('title', null, 'Loading...'),
  React.createElement('script', { src: "https://unpkg.com/react@17/umd/react.production.min.js" }),
  React.createElement('script', { src: "https://unpkg.com/react-dom@17/umd/react-dom.production.min.js" })
);

const Body = ({ data }) => React.createElement('body', null,
  React.createElement('div', { id: 'root' },
    React.createElement('h1', null, data.title),
    React.createElement('p', null, data.content)
  ),
  React.createElement('script', { id: '__INITIAL_DATA__', type: 'application/json' }, JSON.stringify(data)),
  React.createElement('script', { dangerouslySetInnerHTML: { __html: `
    const data = JSON.parse(document.getElementById('__INITIAL_DATA__').textContent);
    ReactDOM.hydrate(
      React.createElement(${Body.toString()}, { data }),
      document.getElementById('root')
    );
  `}})
);

app.get('/', (req, res) => {
  console.time('request');
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Transfer-Encoding': 'chunked' });
  res.write('<!DOCTYPE html><html>');
  
  const earlyHead = ReactDOMServer.renderToString(React.createElement(EarlyHead));
  res.write(earlyHead);

  fetchData().then(data => {
    const body = ReactDOMServer.renderToString(React.createElement(Body, { data }));
    res.write(body);
    res.write('</html>');
    res.end();
    console.timeEnd('request');
  });
});

app.listen(port, () => {
  console.log(`Streaming SSR app listening at http://localhost:${port}`);
});
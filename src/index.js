import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import 'react-app-polyfill/ie11';

import VirtualGrid from "./VirtualGrid";

const rootElement = document.getElementById("root");
let counter = 0;

ReactDOM.render(
  <VirtualGrid 
      debug={window.location.hash.indexOf('debug') !== -1} 
      className="virtual-grid" 
      rows={1000} 
      columns={1000} 
      cellWidth={x => 100 + 100 * (x % 5)} 
      cellHeight={y => 100 + 50 * (y % 5)}
    >
    {React.memo(({x, y}) => 
      <div style={{ 
          width: '100%', 
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          color: '#444',
          background: (x + y) % 2 ? '#eee' : '#ddd',
        }}>
        <h3>{x}:{y}</h3><small>#{counter++}</small>
      </div>
    )}
  </VirtualGrid>,
  rootElement
);

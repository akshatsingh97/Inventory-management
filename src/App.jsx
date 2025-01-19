import { useState, useEffect } from 'react'
import React from 'react';
import './App.css';
import Switch from '@mui/material/Switch';
import TableView from './components/TableView';

function App() {
  const [checked, setChecked] = useState(false);

  const handleChange = (event) => {
    setChecked(event.target.checked);
  }

  return(
    <div>
      <div className='switch-container'>
        <h4>{!checked ? 'Admin View' : 'User View'}</h4>
        <Switch
          checked={checked}
          onChange={handleChange}
          inputProps={{ 'aria-label': 'controlled'}}
        />
      </div>
      <TableView isAdmin={!checked} />
    </div>
  )
}

export default App;

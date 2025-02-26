import React from 'react'
import Dashboards from './assets/pages/Dashboards'
import { Route, Routes } from "react-router-dom";

const App = () => {
  return (
    <React.Fragment>
      <Routes>
      <Route path="/" element={<Dashboards />} />
      </Routes>
    </React.Fragment>
  )
}

export default App

import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter } from "react-router-dom";
import MyNavbar from "./components/MyNavbar.js";
import { observer } from "mobx-react-lite";


const App = observer(() => {
    return (
        <BrowserRouter>
            <MyNavbar />
        </BrowserRouter>
    );
});

export default App;
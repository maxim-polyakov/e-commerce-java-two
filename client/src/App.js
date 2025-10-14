import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./components/AppRouter.js";
import MyNavbar from "./components/MyNavbar.js";
import { observer } from "mobx-react-lite";
import { Context } from "./index.js";
import { check } from "./http/userApi.js";
import { Spinner, Container } from "react-bootstrap";

const App = observer(() => {
    return (
        <BrowserRouter>
            <MyNavbar />
        </BrowserRouter>
    );
});

export default App;
// src/controllers/pages.controller.js

export function renderRegister(req, res) {
    res.render('register', { title: 'Register' });
}

export function renderLogin(req, res) {
    res.render('login', { title: 'Login' });
}

export function renderDashboard(req, res) {
    res.render('dashboard', { title: 'Dashboard' });
}
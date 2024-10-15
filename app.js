const path = require('path'); // Necesario para manejar rutas de archivos 
require('dotenv').config(); // Necesario para leer las variables de entorno
module.exports = { path }; // Exportar la variable path para poder usarla en otros archivos

const express = require("express"); // Ncesario para poder crear la aplicación Express
const { login, registro, registro_licencia, password_recovery, soloAdmin, soloPublico, soloSuperAdmin, tablaAniloxAnalysis, tablaAniloxList, cotizaciones,
  usuarioNivelCliente, tablaClientes, tablaLicencias, tablaAniloxHistory, borrarAnilox, generarPdf, superAnalysis, superListado, superHistory } = require("./controllers/autenticacion");

const app = express();
const port = 3000;

// Middleware para analizar el cuerpo de las solicitudes, el limit: '50mb' es para permitir solicitudes con archivos adjuntos
app.use(express.json({limit: '50mb'}));

// Middleware para permitir solicitudes desde cualquier dominio y no haya problemas de CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// la función soloAdmin solo permite el acceso a los usuarios logueados. soloPublico permite el acceso a cualquier persona
app.get('/index', soloAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', soloAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Por defecto la raíz del servidor redirige a la página de login
app.get('/', soloPublico, (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/login', soloPublico, function(req, res) {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/login.html', soloPublico, function(req, res) {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/registro', soloPublico, (req, res) => {
  res.sendFile(path.join(__dirname, 'registro.html'));
});

app.get('/registro.html', soloPublico, (req, res) => {
  res.sendFile(path.join(__dirname, 'registro.html'));
});

app.get('/registro_licencia', soloPublico, (req, res) => {  // Registro_licencia debería tener una 3ra función que permita el acceso a todos los registrados
  res.sendFile(path.join(__dirname, 'registro_licencia.html'));
});

app.get('/registro_licencia.html', soloPublico, (req, res) => {
  res.sendFile(path.join(__dirname, 'registro_licencia.html'));
});

app.get('/rcvpass', soloPublico, (req, res) => {
  res.sendFile(path.join(__dirname, 'rcvpass.html'));
});

app.get('/rcvpass.html', soloPublico, (req, res) => {
  res.sendFile(path.join(__dirname, 'rcvpass.html'));
});

app.get('/anilox-detail', soloAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'anilox-detail.html'));
});

app.get('/anilox-detail.html', soloAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'anilox-detail.html'));
});

app.get('/ayuda', soloAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'ayuda.html'));
});

app.get('/ayuda.html', soloAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'ayuda.html'));
});

app.get('/export-data', soloAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'export-data.html'));
});

app.get('/export-data.html', soloAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'export-data.html'));
});

app.get('/listado', soloAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'listado.html'));
});

app.get('/listado.html', soloAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'listado.html'));
});

app.get('/print-report', soloAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'print-report.html'));
});

app.get('/print-report.html', soloAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'print-report.html'));
});

app.get('/upload-file', soloAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'upload-file.html'));
});

app.get('/upload-file.html', soloAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'upload-file.html'));
});

app.get('/req-quotes', soloAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'req-quotes.html'));
});

app.get('/req-quotes.html', soloAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'req-quotes.html'));
});

app.get('/super_index', soloSuperAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'super_index.html'));
});

app.get('/super_index.html', soloSuperAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'super_index.html'));
});

app.get('/super_anilox-detail', soloSuperAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'super_anilox-detail.html'));
});

app.get('/super_anilox-detail.html', soloSuperAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'super_anilox-detail.html'));
});

app.get('/super_export-data', soloSuperAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'super_export-data.html'));
});

app.get('/super_export-data.html', soloSuperAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'super_export-data.html'));
});

app.get('/super_listado', soloSuperAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'super_listado.html'));
});

app.get('/super_listado.html', soloSuperAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'super_listado.html'));
});

app.get('/super_print-report', soloSuperAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'super_print-report.html'));
});

app.get('/super_print-report.html', soloSuperAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'super_print-report.html'));
});

app.get('/super_req-quotes', soloSuperAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'super_req-quotes.html'));
});

app.get('/super_req-quotes.html', soloSuperAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'super_req-quotes.html'));
});

// Rutas
app.use('/', express.static(path.join(__dirname, '')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));

// API
app.post('/api/login', login);  // fetch('/api/login') redirige a la función login de autenticacion.js
app.post('/api/registro', registro);  // fetch('/api/registro') redirige a la función registro de autenticacion.js
app.post('/api/registro_licencia', registro_licencia);
app.post('/api/analysis', tablaAniloxAnalysis);
app.post('/api/listado', tablaAniloxList);
app.post('/api/anilox-history', tablaAniloxHistory);
app.post('/api/request-quotes', cotizaciones);
app.post('/api/borrar-anilox', borrarAnilox);
app.post('/api/usuarioNivelCliente', usuarioNivelCliente);
app.post('/api/clientes', tablaClientes); 
app.post('/api/licencias', tablaLicencias);
app.post('/api/pdf', generarPdf); // fetch('/api/pdf') redirige a la función generarPdf de autenticacion.js
app.post('/api/recover', password_recovery); // fetch('/api/recover') redirige a la función password_recovery de autenticacion.js
app.post('/api/super-analysis', superAnalysis);
app.post('/api/super-listado', superListado);
app.post('/api/super-history', superHistory);

app.listen(port, () => {  // Iniciar el servidor en el puerto 3000
  console.log(`Server listening at port: ${port}`); 
});
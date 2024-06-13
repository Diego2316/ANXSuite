const path = require('path');
require('dotenv').config();
module.exports = { path };

const express = require("express");
const nodemailer = require('nodemailer');
const { anilloxAnalysis } = require("./utils/anillox-analysis");
const { anilloxHistory } = require("./utils/anillox-history");
const { clientInfo } = require("./utils/client-info");
const { anilloxList } = require("./utils/anillox-list");
const { login, registro, registro_licencia, soloAdmin, soloPublico, mostrarEstado, 
        mostrarLista, tablaUsuarios, tablaClientes, tablaLicencias, tablaAniloxHistory } = require("./controllers/autenticacion");

const app = express();
const port = 3000;

// Middleware para analizar el cuerpo de las solicitudes
app.use(express.json());

// Middleware para permitir solicitudes desde cualquier dominio
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Configuración
app.get('/index', soloAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', soloAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

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

app.get('/registro_licencia', soloPublico, (req, res) => {
  res.sendFile(path.join(__dirname, 'registro_licencia.html'));
});

app.get('/registro_licencia.html', soloPublico, (req, res) => {
  res.sendFile(path.join(__dirname, 'registro_licencia.html'));
});

app.get('rcvpass', soloPublico, function(req, res) {
  res.sendFile(path.join(__dirname, 'rcvpass.html'));
});

app.get('/rcvpass.html', soloPublico, function(req, res) {
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

app.get('/export-data', soloAdmin, function(req, res) {
  res.sendFile(path.join(__dirname, 'export-data.html'));
});

app.get('/export-data.html', soloAdmin, function(req, res) {
  res.sendFile(path.join(__dirname, 'export-data.html'));
});

app.get('/listado', soloAdmin, function(req, res) {
  res.sendFile(path.join(__dirname, 'listado.html'));
});

app.get('/listado.html', soloAdmin, function(req, res) {
  res.sendFile(path.join(__dirname, 'listado.html'));
});

app.get('/upload-file', soloAdmin, function(req, res) {
  res.sendFile(path.join(__dirname, 'upload-file.html'));
});

app.get('/upload-file.html', soloAdmin, function(req, res) {
  res.sendFile(path.join(__dirname, 'upload-file.html'));
});

// Rutas
app.use('/', express.static(path.join(__dirname, '')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));

// app.get('/admin', soloAdmin, (req, res) => {
//   res.send('Bienvenido a la página de administrador');
// });
app.post('/api/login', login);
app.post('/api/registro', registro);
app.post('/api/registro_licencia', registro_licencia);
app.post('/api/estado', mostrarEstado);
app.post('/api/listado', mostrarLista);
app.post('/api/anilox-history', tablaAniloxHistory);
app.post('/api/usuarios', tablaUsuarios);
app.post('/api/clientes', tablaClientes);
app.post('/api/licencias', tablaLicencias);
app.post('/rcvpass', async (req, res) => {
  
  let { email } = req.body;
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: true,
    auth: {
      user: 'franco.delalcazar@qanders.com',
      pass: '104-55Fppl3'
    }
  });

  let mailOptions = {
    from: 'franco.delalcazar@qanders.com',
    to: email,
    subject: 'Recuperación de contraseña',
    text: 'Por favor, haz clic en el enlace para restablecer tu contraseña.'
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: 'No se pudo enviar el correo electrónico.' });
  }
});

app.get("/anillox-analysis", (req, res) => {
  res.send(anilloxAnalysis);
});

app.get("/anillox-analysis/:Anilox", (req, res) => {
  const Anilox = req.params.Anilox;
  const anilox = anilloxAnalysis[Anilox];

  if (anilox) {
    res.send(anilox);
  } else {
    res
      .status(404)
      .send({ error: "No se encontró anilox para el ID proporcionado." });
  }
});

app.get("/anillox-analysis/anilox/:numero", (req, res) => {
  const algo = req.params.numero;
  let contador = 0;

  for (let i = 0; i < anilloxAnalysis.anilox.length; i++) {
    if (anilloxAnalysis["anilox"][i].id == algo) {
      contador++;
      res.send(anilloxAnalysis["anilox"][i]);      
    }    
  }
  if(contador == 0){
    res.status(404).send({ error: "No se encontró anilox para el ID proporcionado." });
  }
});

app.get("/anillox-list", (req, res) => {
  res.send(anilloxList);
});

app.get("/anillox-list/:Anilox", (req, res) => {
  const Anilox = req.params.Anilox;
  const anilox = anilloxList[Anilox];

  if (anilox) {
    res.send(anilox);
  } else {
    res
      .status(404)
      .send({ error: "No se encontró anilox para el ID proporcionado." });
  }
});

app.get("/anillox-list/anilox/:numero", (req, res) => {
  const list = req.params.numero;
  let contador = 0;

  for (let i = 0; i < anilloxList.anilox.length; i++) {
    if (anilloxAnalysis["anilox"][i].id == list) {
      contador++;
      res.send(anilloxList["anilox"][i]);      
    }    
  }
  if(contador == 0){
    res.status(404).send({ error: "No se encontró anilox para el ID proporcionado." });
  }
});

app.get("/anillox-history", (req, res) => {
  res.send(anilloxHistory);
});

app.get("/anillox-history/:numeroAnilox", (req, res) => {
  const numeroAnilox = req.params.numeroAnilox;
  const history = anilloxHistory[numeroAnilox];

  if (history) {
    res.send(history);
  } else {
    res
      .status(404)
      .send({ error: "No se encontró historial para el ID proporcionado." });
  }
});

app.get("/anillox-history/:numeroAnilox/:id", (req, res) => {
  const numeroAnilox = req.params.numeroAnilox;
  const Anilox = anilloxHistory[numeroAnilox];
  const hist = req.params.id;
  const history = anilloxHistory[numeroAnilox][hist-1];

  if (Anilox) {
    if (history) {
        res.send(history);
    } else {
      res
        .status(404)
        .send({ error: "No se encontró muestra para el Anilox proporcionado." });
    }
  } else {
    res
      .status(404)
      .send({ error: "No se encontró historial para el ID proporcionado." });
  }
});

app.get("/client-info", (req, res) => {
  res.send(clientInfo);
});

app.get("/client-info/user", (req, res) => {
  if (clientInfo.user) {
    res.send(clientInfo.user);
  } else {
    res.status(404).send({ error: "No se encontró la propiedad 'user' en la información del cliente." });
  }
});

app.get("/client-info/license", (req, res) => {
  if (clientInfo.license) {
    res.send(clientInfo.license);
  } else {
    res.status(404).send({ error: "No se encontró la propiedad 'license' en la información del cliente." });
  }
});

app.get("/client-info/client", (req, res) => {
  if (clientInfo.client) {
    res.send(clientInfo.client);
  } else {
    res.status(404).send({ error: "No se encontró la propiedad 'client' en la información del cliente." });
  }
});

app.listen(port, () => {
  console.log(`Server listening at port: ${port}`);
});


let sesion_usuario, sesion_empresa, sesion_level; // Variables para almacenar el usuario y la empresa de la sesión actual
const mysql = require('mysql'); // Necesario para trabajar con MySQL
require('dotenv').config(); // Necesario para leer las variables de entorno
const jwt = require('jsonwebtoken');  // Necesario para crear tokens de acceso
const path = require('path');
const { Chart, DecimationAlgorithm } = require('chart.js/auto');
const ChartDataLabels = require('chartjs-plugin-datalabels');
Chart.register(ChartDataLabels);
const { createCanvas, loadImage } = require('canvas');
const { PDFNet } = require("@pdftron/pdfnet-node"); // Necesario para trabajar con archivos PDF.
const nodemailer = require('nodemailer'); // Necesario para enviar correos electrónicos.
const redis = require('redis'); // Necesario para trabajar con caché.
const fs = require('fs'); // (file system) Necesario para usar los archivos PDF de modelo.
const os = require('os'); // (operating system) Necesario para obtener la ruta temporal del sistema.

const db = mysql.createPool({  // Creación de variable db para la conexión a la BD MySQL
  host: 'anxsuite-1.crkw6qaew4si.sa-east-1.rds.amazonaws.com',
  user: 'admin',
  password: '0fJWVuYZ4epZoIXFRHbL',
  database: 'ANDERS'
});

const util = require('util'); // Se usa para convertir funciones de callback (db.query) a funciones de promesa
const queryDB = util.promisify(db.query).bind(db); // Convierte db.query en una función de promesa queryDB

db.getConnection((err) => { // Conexión a la BD MySQL
  if (err) throw err;
  console.log('Conexión exitosa a MySQL');
});

let usuarios = []; 
const query = 'SELECT user_l FROM login';
db.query(query, (err, results) => { // Query básico para extraer los usuarios de la BD y mostrarlos en consola
  if (err) throw err;

  // Extrae los usuarios de los resultados
  usuarios = results.map((row) => row.user_l);

  // Imprime los usuarios
  console.log('Usuarios:');
  usuarios.forEach((usuario) => {
    process.stdout.write(usuario + ", "); 
  });
  console.log("\n");
});

async function login(req, res) {  // función redirigida desde api/login
    const { username, password } = req.body;
    const sql = 'SELECT * FROM login WHERE user_l = ? AND pass_l = ?';
    db.query(sql, [username, password], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            sesion_usuario =  result[0].user_l;
            sesion_empresa = result[0].empresa;
            sesion_level = result[0].level;
            console.log(result[0].user_l);
            // SI SE ENCUENTRA EL USUARIO Y LA CONTRASEÑA EN LA BD, SE CREA UN TOKEN DE ACCESO
            const token = jwt.sign({ user: result[0].user_l, sesion_usuario: sesion_usuario,
                sesion_empresa: sesion_empresa }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRATION // expira en una hora
            });

            const cookieOption = {
              expires: new Date(Date.now() + 1000*1800), // process.env.ACCESS_COOKIE_EXPIRATION * 3600 * 24 * 1000 -- expira en 1 dia
              path: '/',
            }
            res.cookie("jwt", token, cookieOption);
            res.set('Authorization', token);
            if(sesion_usuario == "superadmin") {
              return res.status(200).send({status: "Success", message: `Usuario ${username} logueado correctamente`,  redirect: '/super_index'});
            }
            else{
              return res.status(200).send({status: "Success", message: `Usuario ${username} logueado correctamente`,  redirect: '/index'});
            }
            
        } else {
            console.log('Error: Usuario o contraseña incorrectos');
            return res.status(400).send({status: "Error", message: "Usuario o contraseña incorrectos"});     
        }
    });
}

async function registro(req, res) {   // función redirigida desde api/registro
  const { username, password, email, license } = req.body;
  console.log(username, password, email, license); 
    const licenciaSql = 'SELECT * FROM licencias WHERE licenseNumber = ?';
    db.query(licenciaSql, [license], (err, result) => {
      if (err) throw(err);
      if(result.length == 0){
        console.log('Consola: Licencia no válida');
        return res.status(400).send({status: "Error", message: "Licencia no válida"});
      } else {
        const licenseHolder = result[0].licenseHolder;
        const checkSql = 'SELECT * FROM login WHERE user_l = ? OR mail = ?';
        db.query(checkSql, [username, email], (err2, resultado) => {
            if (err2) throw err2;
            if (resultado.length > 0) {
              console.log('Consola: El usuario ingresado ya existe');
              return res.status(400).send({status: "Error", message: "El usuario ingresado ya existe"});              
            } else {
                const sql = 'INSERT INTO login (user_l, pass_l, mail, empresa) VALUES (?, ?, ?, ?)';
                db.query(sql, [username, password, email, licenseHolder], (err3, resultado2) => {
                    if (err3) throw err3;
                    if (resultado2.affectedRows === 0) {                      
                      return res.status(400).send({status: "Error", message: "Error al registrar usuario"});
                    } else {
                        console.log('Usuario registrado nuevo:', resultado2.insertId);
                        return res.status(201).send({status: "Success", message: 'Usuario ${username} registrado correctamente', redirect: '/registro_licencia'});
                    }
                });
            }
        });
      }
    });
}

async function registro_licencia(req, res) {   // función redirigida desde api/registro_licencia
  const { username_su, email_su, password_su, username_op, email_op, password_op } = req.body;
  console.log(username_su, email_su, password_su, username_op, email_op, password_op); 
    const licenciaSql = 'SELECT * FROM licencias WHERE licenseNumber = ?';
    db.query(licenciaSql, [license], (err, result) => {
      if (err) throw(err);
      if(result.length == 0){
        console.log('Consola: Licencia no válida');
        return res.status(400).send({status: "Error", message: "Licencia no válida"});
      } else {
        const checkSql = 'SELECT * FROM login WHERE user_l = ? OR mail = ?';
        db.query(checkSql, [username, email], (err2, resultado) => {
            if (err2) throw err2;
            if (resultado.length > 0) {
              console.log('Consola: El usuario ingresado ya existe');
              return res.status(400).send({status: "Error", message: "El usuario ingresado ya existe"});              
            } else {
                const sql = 'INSERT INTO login (user_l, pass_l, mail) VALUES (?, ?, ?)';
                db.query(sql, [username, password, email], (err3, resultado2) => {
                    if (err3) throw err3;
                    if (resultado2.affectedRows === 0) {                      
                      return res.status(400).send({status: "Error", message: "Error al registrar usuario"});
                    } else {
                        console.log('Usuario registrado nuevo:', resultado2.insertId);
                        return res.status(201).send({status: "Success", message: 'Usuario ${username} registrado correctamente', redirect: '/'});
                    }
                });
            }
        });
      }
    });
}

async function password_recovery(req, res) {   // función redirigida desde api/recover
  let { email } = req.body;
  let pass_to_recover = "";
  console.log(email);

  try {
    const result = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM login WHERE mail = ?', [email], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    if (result.length == 0) {
      return res.status(400).send({ success: false, message: 'No se encontró el correo electrónico.' });
    }

    pass_to_recover = result[0].pass_l;

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 465,
      secure: true,
      auth: {
        user: 'anxsuite@gmail.com',
        pass: 'flfb qblb tsef clqq'
      }
    });

    let mailOptions = {
      from: 'anxsuite@gmail.com',
      to: email,
      subject: 'Recuperación de contraseña',
      text: 'Su contraseña es:\n' + pass_to_recover
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true });

  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: 'Error al enviar el correo electrónico.' });
  }
}

function revisarCookie(req){
  try {
    if (!req.headers.cookie) {
      return false;
    }
    // console.log("Headers: ", req.headers.cookie);
    const cookieJWT = req.headers.cookie.split('; ').find(cookie => cookie.startsWith('jwt=')).slice(4);
    // console.log("Cookie JWT: ", cookieJWT);
    // console.log("Secret: ", process.env.ACCESS_TOKEN_SECRET);
    const decodificada = jwt.verify(cookieJWT, process.env.ACCESS_TOKEN_SECRET);
    const usuarioARevisar = usuarios.find(usuario => usuario == decodificada.user);
    if(!usuarioARevisar) {
      console.log("No se encontró el usuario en la base de datos");
      return false;
    }
    if(decodificada.sesion_usuario != sesion_usuario || decodificada.sesion_empresa != sesion_empresa) {
      console.log("Sesión no válida");
      return false;
    }
    return true;
  }
  catch (error){
    console.log(error);
    return false;
  }
}

function soloAdmin(req, res, next) {
  const logueado = revisarCookie(req);
  if(logueado){
    return next();
  }
  else {
    return res.redirect("/");
  }
}

function soloPublico(req, res, next) {  
  const logueado = revisarCookie(req);
  if(logueado){
    return res.redirect("/index");
  }
  if(!logueado){
    return next();
  }
}

function soloSuperAdmin(req, res, next) {
  const logueado = revisarCookie(req);
  if(logueado){
    if(sesion_usuario == "superadmin") {
      return next();
    }
    else {
      return res.redirect("/index");
    }
  }
  else {
    return res.redirect("/");
  }
}

async function limpieza(IpPath, IrPath) {
  console.log(`Iniciando limpieza`);
  const Ip = await loadImage(IpPath);
  const Ir = await loadImage(IrPath);
  // Nuevos umbrales para el canal rojo
  const rThr = 0;
  const gThr = 140;
  const bThr = 140;

  // Función para extraer el canal rojo y contar píxeles
  const countRedPixels = (image, rThreshold, gThreshold, bThreshold) => {
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let redPixelCount = 0;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Cambio en la condición para contar píxeles rojos
        if (r > rThreshold && g <= gThreshold && b <= bThreshold) {
            redPixelCount++;
        }
    }

    return redPixelCount;
  };

  // Contar píxeles rojos en las imágenes
  const IpRedPix = countRedPixels(Ip, rThr, gThr, bThr);
  const IrRedPix = countRedPixels(Ir, rThr, gThr, bThr);
  console.log(`Total de píxeles rojos en Ip: ${IpRedPix}, en Ir: ${IrRedPix}`);

  // Crear imágenes solo con el canal rojo
  const createRedImage = (image, redMask) => {
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        // Cambio para mantener solo el canal rojo
        data[i] = redMask[i / 4] ? data[i] : 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toBuffer();
  };
  // Crear imágenes solo con el canal rojo
  const IpRed = createRedImage(Ip, IpRedPix);
  const IrRed = createRedImage(Ir, IrRedPix);
  // Calcular porcentaje de celdas tapadas
  let porcentajeTapadas = Math.round((1 - (IrRedPix / IpRedPix)) * 100);
  porcentajeTapadas = porcentajeTapadas <= 0 ? 5 : porcentajeTapadas;
  console.log(`Porcentaje de celdas tapadas: ${porcentajeTapadas}`);
  return { IpRed, IrRed, porcentajeTapadas };
}

async function desgaste(IpPath, IrPath) {
  const Ip = await loadImage(IpPath);
  const Ir = await loadImage(IrPath);
  // Umbral para el canal azul
  const rThr = 150;
  const gThr = 150;
  const bThr = 180;

  // Función para extraer el canal azul y contar píxeles
  const countBluePixels = (image, rThreshold, gThreshold, bThreshold) => {
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let bluePixelCount = 0;

      for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          if (r <= rThreshold && g <= gThreshold && b >= bThreshold) {
              bluePixelCount++;
          }
      }  
      
      return bluePixelCount;
  };

  // Contar píxeles azules en las imágenes
  const IpBluePix = countBluePixels(Ip, rThr, gThr, bThr);
  const IrBluePix = countBluePixels(Ir, rThr, gThr, bThr);
  console.log(`Total de píxeles azules en Ip: ${IpBluePix}, en Ir: ${IrBluePix}`);

  // Crear imágenes solo con el canal azul
  const createBlueImage = (image, blueMask) => {
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = blueMask[i / 4] ? data[i + 2] : 0;
      }

      ctx.putImageData(imageData, 0, 0);
      return canvas.toBuffer();
  };

  // Crear imágenes solo con el canal azul
  const IpBlue = createBlueImage(Ip, IpBluePix);
  const IrBlue = createBlueImage(Ir, IrBluePix);
  // Calcular porcentaje de celdas desgastadas
  let porcentajeDesgaste = Math.round((1 - (IrBluePix / IpBluePix)) * 100);
  porcentajeDesgaste = porcentajeDesgaste <= 0 ? 5 : porcentajeDesgaste;
  console.log(`Porcentaje de celdas desgastadas: ${porcentajeDesgaste}`);
  return { IpBlue, IrBlue, porcentajeDesgaste };
}

async function dano(IpPath, IrPath) {
    const Ip = await loadImage(IpPath);
    const Ir = await loadImage(IrPath);

    // Función para contar píxeles rojos
    const contarPixelesRojos = (imagen) => {
        const rThr = 0;
        const gThr = 140;
        const bThr = 140;
        return contarPixeles(imagen, rThr, gThr, bThr);
    };

    // Función para contar píxeles verdes
    const contarPixelesVerdes = (imagen) => {
        const rThr = 100;
        const gThr = 140;
        const bThr = 110;
        return contarPixeles(imagen, rThr, gThr, bThr, true);
    };

    // Función genérica para contar píxeles según umbrales
    const contarPixeles = (imagen, rThr, gThr, bThr, esVerde = false) => {
        const canvas = createCanvas(imagen.width, imagen.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imagen, 0, 0);
        const {data} = ctx.getImageData(0, 0, imagen.width, imagen.height);
        let contador = 0;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            if (esVerde) {
                if (r >= rThr && g >= gThr && b <= bThr) contador++;
            } else {
                if (r >= rThr && g <= gThr && b <= bThr) contador++;
            }
        }

        return contador;
    };

    // Conteo de píxeles rojos y verdes
    const IpRedPix = contarPixelesRojos(Ip);
    const IrRedPix = contarPixelesRojos(Ir);
    const IpGreenPix = contarPixelesVerdes(Ip);
    const IrGreenPix = contarPixelesVerdes(Ir);

    const createRedGreenImage = (image, RedGreenMask) => {
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
  
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = blueMask[i / 4] ? data[i + 2] : 0;
        }
  
        ctx.putImageData(imageData, 0, 0);
        return canvas.toBuffer();
    };

    // Cálculo de porcentaje de daño
    let porcentajeDano = Math.round(((IrGreenPix / IpGreenPix) - 1) * 100); // Falta arreglar
    porcentajeDano = porcentajeDano <= 0 ? 5 : porcentajeDano;
    porcentajeDano = porcentajeDano > 100 ? 100 : porcentajeDano;
    console.log({IpGreenPix, IrGreenPix, porcentajeDano});
    return {porcentajeDano};
}

async function resultados(porcentajeTapadas, porcentajeDano, porcentajeDesgaste) {
  const pesoTapadas = 1;
  const pesoDano = 7;
  const pesoDesgaste = 12;
  const pesoTotal = pesoTapadas + pesoDano + pesoDesgaste;

  const tapadas = pesoTapadas * porcentajeTapadas;
  const dano = pesoDano * porcentajeDano;
  const desgaste = pesoDesgaste * porcentajeDesgaste;

  let estado = Math.round(100 - (tapadas + dano + desgaste) / pesoTotal, 1);
  estado = estado >100 ? 95 : estado;
  estado = estado < 0 ? 10 : estado;

  let diagnostico, recomendacion;

  if (porcentajeTapadas > 30) {
    diagnostico = 'Celdas muy sucias';
    recomendacion = 'Realizar lavado profundo';
  } else if (porcentajeTapadas > 5 && porcentajeTapadas <= 30) {
      diagnostico = 'Celdas sucias';
      recomendacion = 'Realizar lavado';
  } else if (porcentajeTapadas >= 0 && porcentajeTapadas <= 5) {
      diagnostico = 'Celdas limpias';
      recomendacion = 'Mantener calidad de limpieza';
  }

  if (porcentajeDesgaste > 80 && porcentajeDano < 70) {
      diagnostico = 'Paredes muy desgastadas';
      recomendacion = 'Considerar cambio de anilox';
  } else if (porcentajeDano > 70 && porcentajeDesgaste < 80) {
      diagnostico = 'Celdas muy dañadas';
      recomendacion = 'Considerar cambio de anilox';
  } else if (porcentajeDesgaste > 80 && porcentajeDano > 70) {
      diagnostico = 'Paredes muy desgastadas y celdas muy dañadas';
      recomendacion = 'Considerar cambio de anilox';
  } else if (porcentajeDesgaste > 40 && porcentajeDesgaste <= 80 && porcentajeDano <= 70) {
      diagnostico = 'Paredes desgastadas';
      recomendacion = 'Revisar desgaste causado por rasquetas';
  } else if (porcentajeDano > 30 && porcentajeDano <= 70 && porcentajeDesgaste <= 80) {
      diagnostico = 'Celdas dañadas';
      recomendacion = 'Manipular y lavar con mayor cuidado';
  } else if (porcentajeDesgaste > 40 && porcentajeDesgaste <= 80 && porcentajeDano > 30 && porcentajeDano <= 70) {
      diagnostico = 'Paredes desgastadas y celdas dañadas';
      recomendacion = 'Manipular y lavar con mayor cuidado, y revisar desgaste causado por rasquetas';
  } else if (porcentajeDesgaste > 0 && porcentajeDesgaste <= 40 && porcentajeDano <= 30) {
      diagnostico = 'Rodillo en buen estado';
      recomendacion = 'Mantener calidad de manejo y lavado';
  } else if (porcentajeDano > 0 && porcentajeDano <= 30 && porcentajeDesgaste <= 40) {
      diagnostico = 'Rodillo en buen estado';
      recomendacion = 'Mantener calidad de manejo y lavado';
  } else if (porcentajeDano > 0 && porcentajeDano <= 30 && porcentajeDesgaste > 0 && porcentajeDesgaste <= 40) {
      diagnostico = 'Rodillo en buen estado';
      recomendacion = 'Mantener calidad de manejo y lavado';
  }
  console.log({estado, diagnostico, recomendacion});
  return { estado, diagnostico, recomendacion };
}

async function analysis(IpPath, IrPath) {
  const { IpRed, IrRed, porcentajeTapadas } = await limpieza(IpPath, IrPath);
  const { IpBlue, IrBlue, porcentajeDesgaste } = await desgaste(IpPath, IrPath);
  const { porcentajeDano } = await dano(IpPath, IrPath);
  const { estado, diagnostico, recomendacion } = await resultados(porcentajeTapadas, porcentajeDano, porcentajeDesgaste);

  console.log("Analisis exitoso", { porcentajeTapadas, porcentajeDesgaste, porcentajeDano, estado, diagnostico, recomendacion });
  return { IpRed, IrRed, porcentajeTapadas, IpBlue, IrBlue, porcentajeDesgaste, porcentajeDano, estado, diagnostico, recomendacion };
}

async function tablaAniloxList(req, res) {
  try {
    let { id, brand, purchase, volume, depth, opening, wall, screen, angle, last, master, patron, revision, insertarNuevo, insertarUsado, modificar, recorrido, nomvol, mensaje, eol } = req.body;
    let tipo = angle ? (angle > 30 && angle < 80 ? "Hexagonal" : "GTT") : "";  
    if (id) {
      if (id.startsWith("AA")) {
        id = id.slice(0, 9);
      } else if (id.startsWith("AS")) {
        id = id.slice(0, 8);
      }
    }
    if (mensaje == "getAniloxList") {
      const SQL_quote = 'SELECT id, brand, type, purchase, recorrido, nomvol, volume, screen, angle, last FROM anilox_list WHERE empresa = ?';
      const result = await queryDB(SQL_quote, [sesion_empresa]);
      result.forEach(row => {
        if(row.purchase) {
          let date = new Date(row.purchase);
          row.purchase = date.toISOString().split('T')[0]; // Esto devolverá la fecha en formato 'YYYY-MM-DD'
        }
        if(row.last) {
          let date2 = new Date(row.last);
          row.last = date2.toISOString().split('T')[0]; // Esto devolverá la fecha en formato 'YYYY-MM-DD'
        }
      });
      return res.status(200).send({ status: "Success", message: "Estado", result });
    } 
    else if (mensaje == "getAniloxData") {
      const SQL_quote = 'SELECT * FROM anilox_list WHERE id = ? AND empresa = ?';
      const result = await queryDB(SQL_quote, [id, sesion_empresa]);
      return res.status(200).send({ status: "Success", message: "Estado", result });
    }
    else if(mensaje == "quote") {
      const SQL_quote = 'SELECT * FROM anilox_list WHERE id = ?';
      const result = await queryDB(SQL_quote, [id]);
      return res.status(200).send({ status: "Success", message: "Estado", result });
    }
    else if(id && mensaje === "master"){
      const SQL_quote = 'SELECT id, master FROM anilox_list WHERE id = ?';
      const result = await queryDB(SQL_quote, [id]);
      return res.status(200).send({ status: "Success", message: "Estado", result });
    }

    if(id && !brand && !eol) {
      const sql = 'SELECT * FROM anilox_list WHERE id=? and empresa=?';
      const result = await queryDB(sql, [id, sesion_empresa]);
      result.forEach(row => {
        if(row.purchase) {
          let date = new Date(row.purchase);
          row.purchase = date.toISOString().split('T')[0]; // Esto devolverá la fecha en formato 'YYYY-MM-DD'
        }
      });
      result.forEach(row => {
        if(row.last) {
          let date2 = new Date(row.last);
          row.last = date2.toISOString().split('T')[0]; // Esto devolverá la fecha en formato 'YYYY-MM-DD'
        }
      });
      return res.status(200).send({ status: "Success", message: "Estado", result });
    }
    else if (modificar) {  // Esto es cuando se ingresa el recorrido de un anilox existente
      const sqlObtenerPatron = 'SELECT patron FROM anilox_list WHERE id=?';
      db.query(sqlObtenerPatron, [id], (err, result) => {
        if (err) throw err;
        patron = result[0].patron;        
        const sqlModificarLista = 'UPDATE anilox_list SET recorrido=?, volume=?, last=?, revision=? WHERE id=?';
        db.query(sqlModificarLista, [recorrido, volume, last, revision, id], async (errA, resultA) => {
          if (errA) throw errA;
          console.log("id: ", id, "volume: ", volume, "last: ", last, "recorrido: ", recorrido);
          const res_analysis = await analysis(patron, revision); // Luego ejecuta el analysis de la imagen
          const { IpRed, IrRed, porcentajeTapadas, IpBlue, IrBlue, porcentajeDesgaste, porcentajeDano, estado, diagnostico, recomendacion } = res_analysis;          

          let nextDate2 = new Date(last);
          nextDate2.setMonth(nextDate2.getMonth() + 6);
          // Después, se actualiza anilox_analysis con los valores de next, estado, celdas, diagnostico y recomendación
          const sqlUpdate = 'UPDATE anilox_analysis SET next = ?, estado = ?, tapadas = ?, danadas = ?, desgastadas = ?, diagnostico = ?, recomendacion = ? WHERE id = ?';
          db.query(sqlUpdate, [nextDate2, estado, porcentajeTapadas, porcentajeDano, porcentajeDesgaste, diagnostico, recomendacion, id], (errB, resultB) => {
            if (errB) throw errB;
            const sqlVerifyHistory = 'SELECT * FROM anilox_history WHERE anilox = ?';
            db.query(sqlVerifyHistory, [id], (errC, resultC) => {
              if (errC) throw errC;
              let aux = resultC.length > 0 ? resultC.length + 1 : 1; // Si ya existe se suma 1 al id máximo, caso contrario id se inicia en 1
              const sqlInsertHistory = 'INSERT INTO anilox_history (anilox, id, date, volume, diagnostico, report, empresa) VALUES (?,?,?,?,?,?,?)'
              db.query(sqlInsertHistory, [id, aux, last, volume, diagnostico, "https://pdfobject.com/pdf/sample.pdf", sesion_empresa], (errD, resultD) => {
                if (errD) throw errD;                
                return res.status(200).send({ status: "Success", message: "Anilox actualizado correctamente" });
              });
            });
          });
        });
      });
    }
    else if (insertarNuevo) { // Inserción de anilox nuevo Nuevo
      // Primero se inserta una fila en anilox_list con los datos del nuevo Anilox
      const sql = 'INSERT INTO anilox_list (id, brand, type, purchase, recorrido, nomvol, volume, depth, opening, wall, screen, angle, last, master, patron, revision, empresa) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
      db.query(sql, [id, brand, tipo, purchase, 0, nomvol, volume, depth, opening, wall, screen, angle, last, master, patron, patron, sesion_empresa], (err, result) => {
        if (err) throw err;
        // Luego se inserta una fila en anilox_history con los valores de id, date, volume, report y empresa
        const sqlModificarHistory = 'INSERT INTO anilox_history (anilox, id, date, volume, diagnostico, report, empresa) VALUES (?,?,?,?,?,?,?)';
        db.query(sqlModificarHistory, [id, 1, last, volume, "Rodillo en buen estado", master,sesion_empresa], (err2, result2) => {
          if (err2) throw err2;
          let nextDate = new Date(last);
          nextDate.setMonth(nextDate.getMonth() + 6); // Se suma 6 meses a la fecha de última revisión
          // Se inserta una fila en anilox_analysis con los valores de id, next, estado, tapadas, danadas, desgastadas y empresa
          const sqlInsert = 'INSERT INTO anilox_analysis (id, next, estado, tapadas, danadas, desgastadas, diagnostico, recomendacion, empresa) VALUES (?,?,?,?,?,?,?,?,?)';
          db.query(sqlInsert, [id, nextDate, 100, 0, 0, 0, "Rodillo en buen estado", "Mantener calidad de manejo y lavado", sesion_empresa], (err3, result3) => {
            if (err3) throw err3;
            return res.status(200).send({ status: "Success", message: "Anilox insertado correctamente" });
          });
        });                    
      });  
    }
    else if (insertarUsado) { // Inserción de anilox nuevo Usado
      // Primero se inserta una fila en anilox_list con los datos del nuevo Anilox
      const sql = 'INSERT INTO anilox_list (id, brand, type, purchase, recorrido, nomvol, volume, depth, opening, wall, screen, angle, last, master, patron, revision, empresa) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
      db.query(sql, [id, brand, tipo, purchase, 0, nomvol, volume, depth, opening, wall, screen, angle, last, master, patron, revision, sesion_empresa], async (err, result) => {
        if (err) throw err;
        const res_analysis = await analysis(patron, revision);
        const {porcentajeTapadas, porcentajeDesgaste, porcentajeDano, estado, diagnostico, recomendacion} = res_analysis;
        // Luego se inserta una fila en anilox_history con los valores de id, date, volume, report y empresa
        const sqlModificarHistory = 'INSERT INTO anilox_history (anilox, id, date, volume, diagnostico, report, empresa) VALUES (?,?,?,?,?,?,?)';
        db.query(sqlModificarHistory, [id, 1, last, volume, diagnostico, master,sesion_empresa], (err2, result2) => {
          if (err2) throw err2;
          let nextDate = new Date(last);
          nextDate.setMonth(nextDate.getMonth() + 6); // Se suma 6 meses a la fecha de última revisión
          // Se inserta una fila en anilox_analysis con los valores de id, next, estado, tapadas, danadas, desgastadas y empresa
          const sqlInsert = 'INSERT INTO anilox_analysis (id, next, estado, tapadas, danadas, desgastadas, diagnostico, recomendacion, empresa) VALUES (?,?,?,?,?,?,?,?,?)';
          db.query(sqlInsert, [id, nextDate, estado, porcentajeTapadas, porcentajeDano, porcentajeDesgaste, diagnostico, recomendacion, sesion_empresa], (err3, result3) => {
            if (err3) throw err3;
            return res.status(200).send({ status: "Success", message: "Anilox insertado correctamente" });
          });
        });                    
      });  
    }
    else if(id && eol){
      const sql = 'SELECT id, nomvol FROM anilox_list WHERE id=?';
      const result = await queryDB(sql, [id]);
      return res.status(200).send({ status: "Success", message: "Estado", result });
    }
    else {
      const sql = 'SELECT id, brand, type, purchase, recorrido, nomvol, volume, last FROM anilox_list WHERE empresa=?';
      const result = await queryDB(sql, [sesion_empresa]);
      result.forEach(row => {
        if(row.purchase) {
          let date = new Date(row.purchase);
          row.purchase = date.toISOString().split('T')[0]; // Esto devolverá la fecha en formato 'YYYY-MM-DD'
        }
        if(row.last) {
          let date2 = new Date(row.last);
          row.last = date2.toISOString().split('T')[0]; // Esto devolverá la fecha en formato 'YYYY-MM-DD'
        }
      });
      return res.status(200).send({ status: "Success", message: "Estado", result });
    }
  }
  catch (error) {
    console.log(error);
    return res.status(500).send({status: "Error", message: "Error al obtener el listado de los anilox"});
  }
}

async function tablaAniloxAnalysis(req, res) {
  try {
    const { id } = req.body;
    if(id){
      const sql = 'SELECT * FROM anilox_analysis WHERE id=? and empresa=?';
      db.query(sql, [id, sesion_empresa], (err, result) => {
        if (err) throw err;
        result.forEach(el => {
          if(el.next) {
            let date = new Date(el.next);
            el.next = date.toISOString().split('T')[0]; // Esto devolverá la fecha en formato 'YYYY-MM-DD'
          }
        });
        return res.status(200).send({ status: "Success", message: "Analisis", result });
      });
    } 
    else {
      const sql = 'SELECT * FROM anilox_analysis WHERE empresa=?';
      db.query(sql, [sesion_empresa], (err, result) => {
        if (err) throw err;
        let numBuenos = 0,
            numMedios = 0,
            numMalos = 0;

        result.forEach(el => {
          estado = parseFloat(el.estado);
          if(estado >= 80 && estado <= 100){numBuenos++}
          if(estado >= 25 && estado < 80){numMedios++}
          if(estado >= 0 && estado < 25){numMalos++}
          if(el.next) {
            let date = new Date(el.next);
            el.next = date.toISOString().split('T')[0]; // Esto devolverá la fecha en formato 'YYYY-MM-DD'
          }
        });
        return res.status(200).send({ status: "Success", message: "Estado", numBuenos, numMedios, numMalos, result });
      });
    }
  }
  catch (error) {
    console.log(error);
    return res.status(500).send({status: "Error", message: "Error al obtener el estado de los anilox"});
  }
}

async function tablaAniloxHistory(req, res) {
  try {
    const { id, aniloxReportId } = req.body;
    if(id){
      const sql = 'SELECT * FROM anilox_history WHERE anilox=? and empresa=?';
      db.query(sql, [id, sesion_empresa], (err, result) => {
        if (err) throw err;
        result.forEach(row => {
          if(row.date) {
            let date = new Date(row.date);
            row.date = date.toISOString().split('T')[0]; // Esto devolverá la fecha en formato 'YYYY-MM-DD'
          }
        });
        return res.status(200).send({ status: "Success", message: "Estado", result });
      });
    } else if(aniloxReportId){
        const sql = 'SELECT * FROM anilox_history WHERE anilox=? and empresa=?';
        db.query(sql, [aniloxReportId, sesion_empresa], (err, result) => {
          if (err) throw err;
          result.forEach(row => {
            if(row.date) {
              let date = new Date(row.date);
              row.date = date.toISOString().split('T')[0]; // Esto devolverá la fecha en formato 'YYYY-MM-DD'
            }
          });
          return res.status(200).send({ status: "Success", message: "Estado", result });
      });
    } else {
        const sql = 'SELECT * FROM anilox_history WHERE empresa=?';
        db.query(sql, [sesion_empresa], (err, result) => {
          if (err) throw err;
          result.forEach(row => {
            if(row.date) {
              let date = new Date(row.date);
              row.date = date.toISOString().split('T')[0]; // Esto devolverá la fecha en formato 'YYYY-MM-DD'
            }
          });
          return res.status(200).send({ status: "Success", message: "Estado", result });
        });
    }
  } catch {
    console.log(error);
    return res.status(500).send({status: "Error", message: "Error al obtener el historial del anilox"});
  }
}

async function cotizaciones(req, res) {
  try {
    let { reqDate, req2, mensaje, type, nomvol, screen, angle, volUnit, screenUnit } = req.body;

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 465,
      secure: true,
      auth: {
        user: 'anxsuite@gmail.com',
        pass: 'flfb qblb tsef clqq' // Es una contraseña de aplicación (se crea en Gmail cuando se autentica la verificación de 2 factores)
      }
    });

    if (mensaje == "send quote"){ // Si solo es una solicitud de cotización de un solo anilox
      const sql_q0 = 'SELECT * FROM solicitudes where tipo_solicitud = ?';
      db.query(sql_q0, ["single"], (err, result) => {
        if (err) throw err;
        let aux3 = result.length > 0 ? result.length + 1 : 1; // Si ya existe se suma 1 al id máximo, caso contrario id se inicia en 1
        const sql_q1 = 'INSERT INTO solicitudes (tipo_solicitud, id, posicion, type, nomvol, screen, angle, amount, empresa, reqDate) VALUES (?,?,?,?,?,?,?,?,?,?)';
        db.query(sql_q1, ["single", aux3, 0, type, nomvol, screen, angle, 1, sesion_empresa, reqDate], (err, result) => {
          if (err) throw err;
        });
        let mailOptions = {
          from: 'anxsuite@gmail.com',
          // to: 'mario.molina@qanders.com; enzo.carpio@qanders.com; rodrigo.ma@qanders.com',
          to: 'diego.sanchez@qanders.com',
          subject: 'ANX Suite - Solicitud de cotización de rodillos ' + sesion_empresa,
          html: 'El cliente ' + sesion_empresa + ' ha solicitado una cotización de ' + '1' + ' rodillos anilox.<br>' + 
                'Las características del rodillo son:<br><br>' +
                '<ul>' +
                '<li><strong>Tipo:</strong> ' + type + '</li>' +
                '<li><strong>Volumen (' + volUnit + '):</strong> ' + nomvol + '</li>' +
                '<li><strong>Lineatura (' + screenUnit + '):</strong> ' + screen + '</li>' +
                '<li><strong>Ángulo (°):</strong> ' + angle + '</li>' +
                '</ul>',
        };  
        transporter.sendMail(mailOptions);
        return res.status(200).send({ status: "Success", message: "Solicitud enviada correctamente" });
      });
    }
    else if(req2) {  // Se envía 'req2' desde re-quote.js para que no se confunda con 'req' de la función cotizaciones
      const sql_q0 = 'SELECT * FROM solicitudes where tipo_solicitud = ?';
      db.query(sql_q0, ["grouped"], (err, result) => {
        if (err) throw err;
        let string1=[], string2='';
        let aux2 = result.length > 0 ? result.length + 1 : 1; // Si ya existe se suma 1 al id máximo, caso contrario id se inicia en 1
        for(let i = 0; i < req2.length; i++){
          const sql_q1 = 'INSERT INTO solicitudes (tipo_solicitud, id, posicion, type, nomvol, screen, angle, amount, empresa, reqDate) VALUES (?,?,?,?,?,?,?,?,?,?)';
          db.query(sql_q1, ["grouped", aux2, req2[i].id, req2[i].type, req2[i].nomvol, req2[i].screen, req2[i].angle, req2[i].amount, sesion_empresa, reqDate], (err, result) => {
            if (err) throw err;
          });
          string1[i] = 'El cliente ' + sesion_empresa + ' ha solicitado una cotización de ' + req2[i].amount + ' rodillos anilox.<br>' + 
          'Las características del rodillo son:<br><br>' +
          '<ul>' +
          '<li><strong>Tipo:</strong> ' + req2[i].type + '</li>' +
          '<li><strong>Volumen (' + volUnit + '):</strong> ' + req2[i].nomvol + '</li>' +
          '<li><strong>Lineatura (' + screenUnit + '):</strong> ' + req2[i].screen + '</li>' +
          '<li><strong>Ángulo (°):</strong> ' + req2[i].angle + '</li>' +
          '</ul>'
          
          string2 += string1[i]+'<br>';
        }

        let mailOptions = {
          from: 'anxsuite@gmail.com',
          // to: 'mario.molina@qanders.com; enzo.carpio@qanders.com; rodrigo.ma@qanders.com',
          to: 'diego.sanchez@qanders.com',
          subject: 'ANX Suite - Solicitud de cotización de rodillos - ' + sesion_empresa,
          html: string2
        }
        transporter.sendMail(mailOptions);
        return res.status(200).send({ status: "Success", message: "Solicitud enviada correctamente" });        
      });      
    }
    else {
      const sql_q2 = 'SELECT * FROM solicitudes';
      db.query(sql_q2, (err, result) => {
        if (err) throw err;
        return res.status(200).send({ status: "Success", message: "Estado", result });
      });
    }
  } catch {
    console.log(error);
    return res.status(500).send({status: "Error", message: "Error al solicitar la cotización"});
  }
}

async function borrarAnilox(req, res) {
  try {
    const { deleteID } = req.body;
    const sql = 'DELETE FROM anilox_list WHERE id=? and empresa=?';
    if(deleteID){
      db.query(sql, [deleteID, sesion_empresa], (err, result) => {
        if (err) throw err;
        const sql2 = 'DELETE FROM anilox_analysis WHERE id=? and empresa=?';
        db.query(sql2, [deleteID, sesion_empresa], (err2, result2) => {
          if (err2) throw err2;
          const sql3 = 'DELETE FROM anilox_history WHERE anilox=? and empresa = ?';
          db.query(sql3, [deleteID, sesion_empresa], (err3, result3) => {
            if (err3) throw err3;
            return res.status(200).send({ status: "Success", message: "Anilox eliminado correctamente" });
          });        
        });
      });
    }    
  } catch {
    console.log(error);
    return res.status(500).send({status: "Error", message: "Error al eliminar el anilox"});
  }
}

async function usuarioNivelCliente(req, res) {
    return res.status(200).send({status: "Success", message: "Estado", user: `${sesion_usuario}`, level: `${sesion_level}`, client: `${sesion_empresa}`});
}

async function tablaClientes(req, res) {
  try {
    const sql = 'SELECT * FROM clientes';
    db.query(sql, (err, result) => {
      if (err) throw err;
      return res.status(200).send({ status: "Success", message: "Estado", result });
    });
  } catch {
    console.log(error);
    return res.status(500).send({status: "Error", message: "Error al obtener los datos del cliente"});
  }
}

async function tablaLicencias(req, res) {
  try {
    const sql = 'SELECT * FROM licencias WHERE licenseHolder = ?';
    db.query(sql, [sesion_empresa], (err, result) => {
      if (err) throw err;
      return res.status(200).send({ status: "Success", message: "Estado", result });
    });
  } catch {
    console.log(error);
    return res.status(500).send({status: "Error", message: "Error al obtener los datos del cliente"});
  }
}

async function superAnalysis(req, res) {
  try {
    const { client, id, mensaje } = req.body;
    if(client && mensaje === "list"){
      const sql = 'SELECT * FROM anilox_analysis WHERE empresa = ?';
      db.query(sql, [client], (err, result) => {
        if(err) throw err;
        result.forEach(row => {
          if(row.next) {
            let date = new Date(row.next);
            row.next = date.toISOString().split('T')[0];
          }
        });
        return res.status(200).send({status: "Success", message: "Estado", result});
      });
    }
    else if(client && id && mensaje === "detail"){
      const sql = 'SELECT * FROM anilox_analysis WHERE empresa = ? AND id = ?';
      db.query(sql, [client, id], (err, result) => {
        if(err) throw err;
        result.forEach(row => {
          if(row.next) {
            let date = new Date(row.next);
            row.next = date.toISOString().split('T')[0];
          }
        });
        return res.status(200).send({status: "Success", message: "Estado", result});
      });
    }
    else{
      const sql = 'SELECT * FROM anilox_analysis';
      db.query(sql, (err, result) => {
        if(err) throw err;
        result.forEach(row => {
          if(row.next) {
            let date = new Date(row.next);
            row.next = date.toISOString().split('T')[0];
          }
        });
        return res.status(200).send({status: "Success", message: "Estado", result});
      });
    }
  } catch {
    console.log(error);
    return res.status(500).send({status: "Error", message: "Error al obtener los datos"});
  }
}

async function superListado(req, res) {
  try {
    const { client, mensaje, id } = req.body;
    if(mensaje === "client" && client){
      const sql = 'SELECT id, brand, empresa FROM anilox_list WHERE empresa=?';
      db.query(sql, [client], (err, result) =>{
        if(err) throw err;
        return res.status(200).send({status: "Success", message: "Estado", result});
      });
    }
    else if(mensaje === "quote" && id && client){
      const sql = 'SELECT id, type, nomvol, screen, angle FROM anilox_list WHERE empresa=? AND id = ?';
      db.query(sql, [client, id], (err, result) =>{
        if(err) throw err;
        return res.status(200).send({status: "Success", message: "Estado", result});
      });
    }
    else if(mensaje === "master" && id){
      const sql = 'SELECT id, master FROM anilox_list WHERE id = ?';
      db.query(sql, [id], (err, result) => {
        if(err) throw err;
        return res.status(200).send({status: "Success", message: "Estado", result});
      });
    }
    else if(mensaje === "ids"){
      const sql = 'SELECT id, brand, empresa FROM anilox_list'
      db.query(sql, (err, result) => {
        if(err) throw err;
        return res.status(200).send({status: "Success", message: "Estado", result});
      });
    }
    else if(id && client, mensaje === 'detail'){
      const sql = 'SELECT id, brand, type, purchase, recorrido, nomvol, volume, depth, opening, wall, screen, angle, last, patron, revision FROM anilox_list WHERE empresa = ? AND id = ?';
      db.query(sql, [client, id], (err, result) => {
        if(err) throw err;
        result.forEach(row => {
          if(row.purchase) {
            let date = new Date(row.purchase);
            row.purchase = date.toISOString().split('T')[0];
          }
          if(row.last) {
            let date = new Date(row.last);
            row.last = date.toISOString().split('T')[0];
          }
        });
        return res.status(200).send({status: 'Success', message: "Estado", result});
      });
    }
    else if(client && id && mensaje === "eol"){
      const sql = 'SELECT id, nomvol FROM anilox_list WHERE empresa = ? AND id = ?';
      db.query(sql, [client, id], (err, result) => {
        if(err) throw err;
        return res.status(200).send({status: 'Success', message: "Estado", result});
      });
    }
    else{
      const sql = 'SELECT id, brand, type, purchase, recorrido, nomvol, volume, last, empresa FROM anilox_list WHERE empresa=?';
      db.query(sql, [client], (err, result) =>{
        if(err) throw err;
        result.forEach(row => {
          if(row.purchase) {
            let date = new Date(row.purchase);
            row.purchase = date.toISOString().split('T')[0];
          }
          if(row.last) {
            let date = new Date(row.last);
            row.last = date.toISOString().split('T')[0];
          }
        });
        return res.status(200).send({status: "Success", message: "Estado", result});
      });
    }
  } catch {
    console.log(error);
    return res.status(500).send({status: "Error", message: "Error al obtener los datos"});
  }
}

async function superHistory(req, res) {
  try {
    const { client, id , mensaje, date} = req.body;
    if(client && id && mensaje === "report-list"){
      const sql = 'SELECT anilox, date, report FROM anilox_history WHERE empresa = ? AND anilox = ?';
      db.query(sql, [client, id], (err, result) => {
        if(err) throw err;
        result.forEach(row => {
          if(row.date) {
            let date = new Date(row.date);
            row.date = date.toISOString().split('T')[0];
          }
        });
        return res.status(200).send({status: "Success", message: "Estado", result});
      });
    }
    else if(client && id && date && mensaje === "report"){
      const sql = 'SELECT anilox, report FROM anilox_history WHERE empresa = ? AND anilox = ? AND date = ?';
      db.query(sql, [client, id, date], (err, result) => {
        if(err) throw err;
        return res.status(200).send({status: "Success", message: "Estado", result});
      });
    }
    else if(client && id && mensaje === "detail"){
      const sql = 'SELECT anilox, date, volume, diagnostico FROM anilox_history WHERE empresa = ? AND anilox = ?';
      db.query(sql, [client, id], (err, result) => {
        if(err) throw err;
        result.forEach(row => {
          if(row.date) {
            let date = new Date(row.date);
            row.date = date.toISOString().split('T')[0];
          }
        });
        return res.status(200).send({status: "Success", message: "Estado", result});
      });
    }
    else{
      const sql = 'SELECT * FROM anilox_history';
      db.query(sql, (err, result) => {
        if(err) throw err;
        result.forEach(row => {
          if(row.date) {
            let date = new Date(row.date);
            row.date = date.toISOString().split('T')[0];
          }
        });
        return res.status(200).send({status: "Success", message: "Estado", result});
      });
    }
  } catch {
    console.log(error);
    return res.status(500).send({status: "Error", message: "Error al obtener los datos"});
  }
}

// -----------------Funciones para generar el reporte PDF ------------------------//

// async function addBase64ImageToPDF(doc, pSet, base64Image, options) {    
//   const imageBuffer = Buffer.from(base64Image, 'base64'); // Convertir la cadena base64 a buffer 
//   const tempImagePath = path.join(os.tmpdir(), 'tempImage.jpg'); 
//   fs.writeFileSync(tempImagePath, imageBuffer); // Escribir la cadena en un archivo temporal 

//   const pdfImage = await PDFNet.Image.createFromFile(doc, tempImagePath); // Cargar la imagen desde el archivo temporal

//   // Usar PDFNet.Stamper para colocar la imagen en el documento PDF
//   const stamper = await PDFNet.Stamper.create(PDFNet.Stamper.SizeType.e_absolute_size, options.width, options.height);
//   stamper.setAlignment(PDFNet.Stamper.HorizontalAlignment.e_horizontal_left, PDFNet.Stamper.VerticalAlignment.e_vertical_top);
//   stamper.setPosition(options.x, options.y);
//   try {
//       await stamper.stampImage(doc, pdfImage, pSet);
//   } catch (error) {
//       console.error('Error al estampar la imagen:', error);
//   }
//   fs.unlinkSync(tempImagePath); // Opcional: Eliminar el archivo temporal de la imagen 
// }

// function encontrarValoresCercanosMenores(arr, objetivos) {
//   return objetivos.map(objetivo => {
//     return arr.reduce((prev, curr) => {
//       if (curr <= objetivo && (prev >= objetivo || Math.abs(curr - objetivo) < Math.abs(prev - objetivo))) {
//         return curr;
//       }
//       return prev;
//     }, Number.MAX_VALUE);
//   });
// }

// function generarRectaTendencia(eolDates, volData, limite) {
//   // Convertir fechas a valores numéricos (timestamp)
//   const x = eolDates.map(date => new Date(date).getTime());
//   const y = volData;

//   const n = x.length;
//   const sumX = x.reduce((a, b) => a + b, 0);
//   const sumY = y.reduce((a, b) => a + b, 0);
//   const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
//   const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

//   const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
//   const b = (sumY - m * sumX) / n;

//   // Calcular los puntos de la recta de tendencia en las fechas originales
//   const tendencia = x.map(xi => ({
//     x: new Date(xi).toISOString().split('T')[0], // Convertir de nuevo a formato de fecha
//     y: m * xi + b
//   }));

//   // Generar puntos en fechas futuras hasta que el valor sea menor o igual al límite
//   let ultimaFecha = new Date(eolDates[eolDates.length - 1]);
//   let ultimoValor = tendencia[tendencia.length - 1].y;
//   let b2 = b > 200 ? 2 : b > 100 ? 3 : 6; // Si b es mayor a 200 elabora una pendiente de 2 meses, si es mayor a 100 de 3 meses, de lo contrario de 6 meses

//   if(m < -0.000000000005 ){
//     while (ultimoValor > limite) {
//       ultimaFecha.setMonth(ultimaFecha.getMonth() + b2); // Incrementar la fecha en 6 meses o 3 meses dependiendo de la intersección
//       const nuevaFecha = ultimaFecha.getTime();
//       ultimoValor = m * nuevaFecha + b;
//       tendencia.push({
//         x: ultimaFecha.toISOString().split('T')[0],
//         y: ultimoValor
//       });
//     }
//   }

//   return { tendencia, m, b };
// }

// function encontrarPosiciones(arr, valoresCercanos) {
//   return valoresCercanos.map(valorCercano => {
//     const index = arr.indexOf(valorCercano);
//     return index !== -1 ? index + 1 : -1; // Sumar 1 para que la posición sea 1-indexada
//   });
// }

async function generarPdf(req, res) {  
  let pdfPath = path.join(__dirname, '/modelo_reporte_final6.pdf');
  // const canvas_bcm = createCanvas(800, 185);
  // const bcm_ctx = canvas_bcm.getContext('2d'); // Se crea un canva para el gráfico de BCM
  // const canvas_EOL = createCanvas(800, 350);
  // const EOL_ctx = canvas_EOL.getContext('2d'); // Se crea un canva para el gráfico de EOL
  // const coord_revision = {
  //   x: 215,     y: 688,     
  //   width: 205, height: 120 
  // };
  
  // const coord_tapadas = {
  //   x: 45,     y: 320,
  //   width: 160, height: 193
  // };
  
  // const coord_danadas = {
  //   x: 225,     y: 320,
  //   width: 160, height: 193
  // };
  
  // const coord_desgastadas = {
  //   x: 405,     y: 320,
  //   width: 165, height: 193
  // };
  
  // const coord_historial = {
  //   x: 23,     y: 532,
  //   width: 555, height: 185
  // };

  // const coord_graficaEOL = {
  //   x: 23,     y: 45,
  //   width: 545, height: 335
  // }
  const inputPath = path.resolve(__dirname, './modelo_reporte_final6.pdf');
  const outputPath = path.resolve(__dirname, './out.pdf');
  try {
    let { id, revision, last, brand, volume, screen } = req.body;
    const sql_PDF = 'SELECT * FROM anilox_analysis WHERE id = ?';
    const result = await queryDB(sql_PDF, [id]);

    try{
      const textReplacer = async () => {
        try {
          const doc = await PDFNet.PDFDoc.createFromFilePath(inputPath);
          await doc.initSecurityHandler();
          const replacer = await PDFNet.ContentReplacer.create();
          const page1 = await doc.getPage(1);
      
          await replacer.addString("ANILOX", id);
          await replacer.process(page1);
      
          doc.save(outputPath, PDFNet.SDFDoc.SaveOptions.e_linearized);
        } catch (error) {
          console.error('Error al reemplazar el texto en el PDF:', error);
          res.status(500).send('Error al reemplazar el texto en el PDF');
        }
      }
      PDFNet.runWithCleanup(textReplacer, "demo:1738013984595:7e94569d0300000000b459c6dd4b66b301ba65c1bbe1d2f4e8c4d1b39d").then(() => {
        fs.readFile(outputPath, (err, data) => {
          if(err){
            res.statusCode = 500;
            res.end(err);
          } else {
            res.setHeader('Content-Type', 'application/pdf');
            res.end(data);
          }
        })
      }).catch(err => {
        res.statusCode = 500;
        res.end(err);
      })
    }
    catch (error) {
      console.log("Error en PDFNet.runWithCleanup: ",error);
      return res.status(500).send({status: "Error", message: "Error al generar el PDF"});
    } 
  } catch {
    console.log("Error al generar el PDF: ",error);
    return res.status(500).send({status: "Error", message: "Error al generar el PDF"});
  }

  // try {
  //   let { id, revision, last, brand, volume, screen } = req.body;
  //   let tapadas, limpias, danadas, sinDano, desgastadas, sinDesgaste, tapadas_img, danadas_img, desgastadas_img, bcmChart, eolGraph, tipo, purchase, msg;
  //   let volLabels = [], volData = [], diag = [], eolDates = [], nomData =[], actualDates=[], percentVol=[], percentDates=[], ultimaFecha, diferenciasEnAnios;
  //   let sql_PDF = 'SELECT * FROM anilox_analysis WHERE id = ?'
  //   db.query(sql_PDF, [id], (err, rows) => {
  //       if (err) throw err;
  //       tapadas = parseFloat(rows[0].tapadas),
  //       danadas = parseFloat(rows[0].danadas),
  //       desgastadas = parseFloat(rows[0].desgastadas),      
  //       limpias = 100 - tapadas,
  //       sinDano = 100 - danadas,
  //       sinDesgaste = 100 - desgastadas;
  //       let next = new Date(rows[0].next);
  //       next = next.toISOString().split('T')[0];
  //       let estado = parseFloat(rows[0].estado) + '%';
  //       let diagnostico = rows[0].diagnostico;
  //       let recomendacion = rows[0].recomendacion;
  //       let eolData = JSON.parse(rows[0].eol);

  //       dataCleanStat = {
  //           labels: [
  //               'Limpias',
  //               'Tapadas',
  //           ],
  //           datasets: [{
  //               data: [limpias, tapadas],
  //               backgroundColor: [
  //               'rgba(231,255,23,0.35)',
  //               'rgba(255,76,163,0.35)',
  //               ],
  //               hoverOffset: 4,
  //           }],
  //       };
        
  //       dataDamagedStat = {
  //           labels: [
  //               'Sin Daño',
  //               'Dañadas',
  //           ],
  //           datasets: [{
  //               data: [sinDano, danadas],
  //               backgroundColor: [
  //               'rgba(231,255,23,0.35)',
  //               'rgba(255,76,163,0.35)',
  //               ],
  //               hoverOffset: 4,
  //           }]
  //       };
        
  //       dataWearStat = {
  //           labels: [
  //               'Sin Desgaste',
  //               'Desgastadas',
  //           ],
  //           datasets: [{
  //               data: [sinDesgaste, desgastadas],
  //               backgroundColor: [
  //               'rgba(231,255,23,0.35)',
  //               'rgba(255,76,163,0.35)',
  //               ],
  //               hoverOffset: 4,
  //           }]
  //       };
        
  //       cleanGraphConfig = {
  //           type: "doughnut",
  //           data: dataCleanStat,
  //           options: {
  //               layout: {
  //                   padding: {
  //                       left: 20,
  //                       right: 20,
  //                   },
  //               },
  //               plugins: {
  //                   title: {
  //                       display: true,
  //                       align: "center",
  //                       color: "#363949",
  //                       font: {
  //                           weight: 550,
  //                           size: 20,
  //                       },
  //                       padding: {
  //                           top: 10,
  //                           bottom: 10,
  //                       },
  //                       text: '% Celdas Tapadas'
  //                   },
  //                   legend: {
  //                       display: true,
  //                       position: "bottom",
  //                       labels: {
  //                           font: {
  //                               weight: 550,
  //                               size: 14,
  //                           },
  //                           padding: 15,
  //                           boxWidth: 35,
  //                       },
  //                       reverse: true,
  //                   },
  //                   datalabels:{
  //                       color: '#363949',
  //                       anchor: 'center',
  //                       font: {
  //                           size: 16,
  //                           weight: 550,
  //                       },
  //                       formatter: function(value){
  //                           return value + '%';
  //                       }
  //                   },
  //                   tooltip: {
  //                       enabled: true,
  //                       titleFont: {
  //                           size: 16,
  //                           weight: 550,
  //                       },
  //                       bodyFont: {
  //                           size: 14,
  //                           weight: 550,
  //                       },
  //                       callbacks: {  
  //                           label: function(context){
  //                               let data = context.parsed;    
  //                               return ' ' + data + '%';
  //                           },
  //                       },
  //                   },
  //               },
  //               responsive: true,
  //               maintainAspectRatio: false,
  //           }
  //       };
        
  //       damagedGraphConfig = {
  //           type: "doughnut",
  //           data: dataDamagedStat,
  //           options: {
  //               layout: {
  //                   padding: {
  //                       left: 20,
  //                       right: 20,
  //                   },
  //               },
  //               plugins: {
  //                   title: {
  //                       display: true,
  //                       align: "center",
  //                       color: "#363949",
  //                       font: {
  //                           weight: 550,
  //                           size: 20,
  //                       },
  //                       padding: {
  //                           top: 10,
  //                           bottom: 10,
  //                       },
  //                       text: '% Celdas Dañadas'
  //                   },
  //                   legend: {
  //                       display: true,
  //                       position: "bottom",
  //                       labels: {
  //                           font: {
  //                               weight: 550,
  //                               size: 14,
  //                           },
  //                           padding: 15,
  //                           boxWidth: 35,
  //                       },
  //                       reverse: true,
  //                   },
  //                   datalabels:{
  //                       color: '#363949',
  //                       anchor: 'center',
  //                       font: {
  //                           size: 16,
  //                           weight: 550,
  //                       },
  //                       formatter: function(value){
  //                           return value + '%';
  //                       }
  //                   },
  //                   tooltip: {
  //                       enabled: true,
  //                       titleFont: {
  //                           size: 16,
  //                           weight: 550,
  //                       },
  //                       bodyFont: {
  //                           size: 14,
  //                           weight: 550,
  //                       },
  //                       callbacks: {  
  //                           label: function(context){
  //                               let data = context.parsed;            
  //                               return ' ' + data + '%';
  //                           },
  //                       },
  //                   },
  //               },
  //               responsive: true,
  //               maintainAspectRatio: false,
  //           }
  //       };
        
  //       wearGraphConfig = {
  //           type: "doughnut",
  //           data: dataWearStat,
  //           options: {
  //               layout: {
  //               padding: {
  //                   left: 20,
  //                   right: 20,
  //               },
  //               },
  //               plugins: {
  //                   title: {
  //                       display: true,
  //                       align: "center",
  //                       color: "#363949",
  //                       font: {
  //                           weight: 700,
  //                           size: 20,
  //                       },
  //                       padding: {
  //                           top: 10,
  //                           bottom: 10,
  //                       },
  //                       text: '% Celdas Desgastadas'
  //                   },
  //                   legend: {
  //                       display: true,
  //                       position: "bottom",
  //                       labels: {
  //                           font: {            
  //                               weight: 550,
  //                               size: 14,
  //                           },
  //                           padding: 15,
  //                           boxWidth: 35,
  //                       },
  //                       reverse: true,
  //                   },
  //                   datalabels:{
  //                       color: '#363949',
  //                       anchor: 'center',
  //                       font: {
  //                           size: 16,
  //                           weight: 550,
  //                       },
  //                       formatter: function(value){
  //                           return value + '%';
  //                       }
  //                   },
  //                   tooltip: {
  //                       enabled: true,
  //                       titleFont: {
  //                           size: 16,
  //                           weight: 550,
  //                       },
  //                       bodyFont: {
  //                           size: 14,
  //                           weight: 550,
  //                       },
  //                       callbacks: {  
  //                           label: function(context){
  //                               let data = context.parsed;
  //                               return ' ' + data + '%';
  //                           },
  //                       },
  //                   },
  //               },
  //               responsive: true,
  //               maintainAspectRatio: false,
  //           }
  //       };
        
  //       function generarGrafico(grafico) {
  //           let buffer, buffer64;
  //           if (grafico == bcmChart) {
  //               buffer = canvas_bcm.toBuffer('image/png');
  //           }
  //           else if (grafico == eolGraph) {
  //               buffer = canvas_EOL.toBuffer('image/png');
  //           }
  //           else {
  //               let width = 220, height = 300;  
  //               const canvas_PDF = createCanvas(width, height);
  //               const ctx = canvas_PDF.getContext('2d');                    
  //               new Chart(ctx, grafico); 
  //               buffer = canvas_PDF.toBuffer('image/png'); 
  //           }
  //           buffer64 = buffer.toString('base64');
  //           return buffer64;
  //       }

  //       tapadas_img = generarGrafico(cleanGraphConfig).replace('data:image/jpeg;base64,', '');
  //       danadas_img = generarGrafico(damagedGraphConfig).replace('data:image/jpeg;base64,', '');
  //       desgastadas_img = generarGrafico(wearGraphConfig).replace('data:image/jpeg;base64,', '');  

  //       const sql2_PDF = 'SELECT * FROM anilox_list WHERE id=?';
  //       db.query(sql2_PDF,[id], (err2, rows2) => {
  //           if (err2) throw err2;
  //           revision = rows2[0].revision;
  //           revision = revision.replace('data:image/jpeg;base64,', '');
  //           purchase = rows2[0].purchase.toISOString().substring(0, 10);
  //           tipo = rows2[0].type;
  //           let nomVol = rows2[0].nomvol;
  //           const sql3_PDF = 'SELECT * FROM anilox_history WHERE anilox=?';
  //           db.query(sql3_PDF,[id], (err3, rows3) => {
  //               if (err3) throw err3;
  //               for(let i = 0; i < rows3.length; i++){
  //                   let date = new Date(rows3[i].date);
  //                   volLabels[i] = date.toISOString().split('T')[0];
  //                   volData[i] = Math.round(((rows3[i].volume)/1.55) * 10) / 10; 
  //                   diag[i] = rows3[i].diagnostico;
  //                   nomData[i] = Math.round((nomVol/1.55) * 10) / 10;
  //                   rows3.forEach(row => {
  //                     if(row.date) {
  //                       let date = new Date(row.date);
  //                       row.date = date.toISOString().split('T')[0]; // Esto devolverá la fecha en formato 'YYYY-MM-DD'
  //                     }
  //                   });
  //                   eolDates[i] = rows3[i].date;
  //               }

  //               const dataBcmStat = {
  //                   labels: volLabels,
  //                   datasets: [{
  //                     label: 'Volumen medido (BCM)',
  //                     data: volData,
  //                     info: diag,
  //                     fill: false,
  //                     borderColor: 'rgba(0, 0, 255, 0.35)',
  //                     tension: 0.1,
  //                   },
  //                   {
  //                     label: 'Volumen Nominal (BCM)',
  //                     data: nomData,
  //                     fill: false,
  //                     borderColor: 'rgba(255, 0, 0, 0.35)',
  //                     tension: 0.1,
  //                     pointRadius: 0,
  //                     datalabels: {
  //                       display: false, // Desactiva etiquetas
  //                     },
  //                   }]
  //               };
  //               bcmChart = new Chart(bcm_ctx, {
  //                   type: "line",
  //                   data: dataBcmStat,
  //                   options: {
  //                       plugins: {
  //                           title: {
  //                               display: true,
  //                               align: "center",
  //                               color: "#363949",
  //                               font: {
  //                               weight: 500,
  //                               size: 14,
  //                               },
  //                               padding: {
  //                               top: 10,
  //                               bottom: 10,
  //                               },
  //                               text: 'Historial de Volumen de Celda'
  //                           },
  //                           legend: {
  //                               display: true,
  //                               position: "bottom",
  //                               labels: {
  //                                   font: {
  //                                       weight: 500,
  //                                       size: 11,
  //                                   },
  //                                   padding: 15,
  //                                   boxWidth: 30,
  //                               },
  //                               reverse: true,
  //                           },
  //                           datalabels:{
  //                               color: '#363949',
  //                               align: -45,
  //                               font: {
  //                                   size: 11,
  //                                   weight: 500,
  //                               },
  //                               clip: false,
  //                           },
  //                           tooltip: {
  //                               enabled: true,
  //                               titleFont: {
  //                                   size: 11,
  //                                   weight: 600,
  //                               },
  //                               bodyFont: {
  //                                   size: 11,
  //                                   weight: 500,
  //                               },
  //                               footerFont: {
  //                                   size: 13,
  //                                   weight: 300,
  //                               },
  //                               callbacks: {  
  //                                   label: function(tooltipItem){
  //                                       if(tooltipItem.datasetIndex == 0){
  //                                           let data = tooltipItem.parsed.y;
  //                                           return 'Volumen: ' + data + ' BCM'; 
  //                                       }
  //                                       else{return ""}
  //                                   },
  //                                   footer: function(tooltipItem){
  //                                       if(tooltipItem[0].datasetIndex == 0){
  //                                           let diag = tooltipItem[0].dataset.info[tooltipItem[0].dataIndex];
  //                                           return 'Diagnostico:' + '\n' + diag;
  //                                       }
  //                                   }
  //                               },
  //                           },
  //                       },
  //                       responsive: true,
  //                       maintainAspectRatio: false,
  //                       scales: {
  //                           x: {
  //                               ticks: {
  //                                   display: true,
  //                                   font: {
  //                                       weight: 500,
  //                                       size: 11,
  //                                   }
  //                               },
  //                           },
  //                           y: {
  //                               grace: 0.15,
  //                               ticks: {
  //                                   stepSize: 0.05,
  //                                   font: {
  //                                       weight: 500,
  //                                       size: 11,
  //                                   }
  //                               },
  //                           },
  //                       },
  //                   }
  //               });
  //               let historial_img = generarGrafico(bcmChart).replace('data:image/jpeg;base64,', '');

  //               console.log("Datos de volumen: " + volData);
  //               console.log("Fechas de EOL: " + eolDates);

  //               if(rows3.length < 2) {
  //                 eolData = 2000;
  //                 msg = `No se cuenta con suficientes datos para realizar una estimación.`;
  //                 pdfPath = path.join(__dirname, '/modelo_reporte_final_alt.pdf');                  
  //               }
  //               else if (parseFloat(rows[0].estado) < 60) {
  //                 eolData = 1000;
  //                 msg = `El volumen de celda ya se encuentra por debajo del 60% del volumen nominal (${(nomVol/1.55 * 0.6).toFixed(3)}).`;
  //                 pdfPath = path.join(__dirname, '/modelo_reporte_final_alt.pdf');
  //               }
  //               else{
  //                 // eolData = calcularRectaTendencia(eolDates, volData, 0.6*nomVol/1.55).tendencia.map(point => parseFloat(point.y.toFixed(3)));
  //                 const { m, b } = generarRectaTendencia(eolDates, volData, 0.6*nomVol/1.55);
  //                 console.log("m: " + m);
  //                 console.log("b: " + b);
  //                 if(m >= -0.000000000005) {
  //                   eolData = 2000;
  //                   msg = `No se cuenta con suficientes datos para realizar una estimación.`;
  //                   pdfPath = path.join(__dirname, '/modelo_reporte_final_alt.pdf');
  //                   percentVol = "";
  //                   percentDates = "";
  //                 }
  //                 else{
  //                   eolData = generarRectaTendencia(eolDates, volData, 0.6*nomVol/1.55).tendencia.map(point => parseFloat(point.y.toFixed(3)));                    
  //                   newDates = generarRectaTendencia(eolDates, volData, 0.6*nomVol/1.55).tendencia.map(point => point.x);
  //                   percentVol = encontrarValoresCercanosMenores(eolData, [0.9*nomVol/1.55, 0.8*nomVol/1.55, 0.7*nomVol/1.55, 0.6*nomVol/1.55]);
  //                   percentDates = encontrarPosiciones(eolData, percentVol);
  //                   actualDates = percentDates.map(pos => newDates[pos-1]);
  //                   ultimaFecha = new Date(eolDates[eolDates.length - 1]);
  //                   diferenciasEnAnios = actualDates.map(dateStr => {
  //                     const actualDate = new Date(dateStr);
  //                     const diferenciaEnMilisegundos = actualDate - ultimaFecha;
  //                     const diferenciaEnAnios = diferenciaEnMilisegundos / (1000 * 60 * 60 * 24 * 365.25); // 365.25 para considerar los años bisiestos
  //                     return diferenciaEnAnios;
  //                   });
  //                 }
  //               }
                
  //               console.log("eolData: " + eolData);
  //               console.log("percentVol: " + percentVol);
  //               console.log("percentDates: " + percentDates);
                
  //               const percentData = {
  //                 dates: percentDates,
  //                 values: percentVol
  //               };
  //               const percentDataJSON = JSON.stringify(percentData);
                
  //               const sql4_PDF = 'UPDATE anilox_analysis SET eol = ?, percent=? WHERE id = ?';
  //               db.query(sql4_PDF, [JSON.stringify(eolData), percentDataJSON, id], (err4, rows4) => {
  //                 if (err4) {
  //                   console.error("Error en la consulta SQL:", err4);
  //                   return res.status(500).send({ status: "Error", message: "Error en la consulta SQL" });
  //                 }
                  
  //                 const dataEOLGraph = {
  //                   labels: newDates,
  //                   datasets: [{
  //                     type: 'line',
  //                     label: 'Volumen estimado (BCM)',
  //                     data: eolData.map(dato => Math.round(dato * 10) / 10),
  //                     fill: false,
  //                     borderColor: 'rgba(255, 0, 0, 0.35)',
  //                     tension: 0.1,
  //                     datalabels: {
  //                       display: true,
  //                       align: 'top',
  //                     },
  //                   }, {
  //                     type: 'scatter',
  //                     label: 'Volumen medido (BCM)',
  //                     data: volData.map(dato => Math.round(dato * 10) / 10),
  //                     fill: false,
  //                     borderColor: 'rgba(0, 0, 255, 0.6)',
  //                     datalabels: {
  //                       display: true,
  //                     },
  //                   }]
  //                 };

  //                 eolGraph = new Chart(EOL_ctx, {
  //                   data: dataEOLGraph,
  //                   options: {
  //                     plugins: {
  //                       legend: {
  //                         display: true,
  //                         position: "bottom",
  //                         labels: {
  //                           font: {
  //                             weight: 500,
  //                             size: 11,
  //                           },
  //                           padding: 15,
  //                           boxWidth: 30,
  //                         },
  //                         reverse: true,
  //                       },
  //                       datalabels:{
  //                         color: '#363949',
  //                         align: 'right', // 'right'
  //                         padding: {
  //                           right: 7,
  //                         },
  //                         font: {
  //                           size: 11,
  //                           weight: 500,
  //                         },
  //                         clip: false,
  //                         formatter: function(value, context){
  //                           if(context.dataset.type === 'line'){
  //                             const volDataRounded = volData.map(dato => Math.round(dato * 10) / 10);
  //                             if(value == parseFloat(percentVol[0].toFixed(1)) || value == parseFloat(percentVol[1].toFixed(1)) || value == parseFloat(percentVol[2].toFixed(1)) || value == parseFloat(percentVol[3].toFixed(1))) {
  //                               if(!volDataRounded.includes(value)){
  //                                 return value;
  //                               }
  //                             }
  //                             else {
  //                               return ''
  //                             }
  //                           }
  //                         },
  //                       }
  //                     },
  //                     responsive: true,
  //                     maintainAspectRatio: false,
  //                     scales: {
  //                       x: {
  //                         ticks: {
  //                           display: true,
  //                           font: {
  //                             weight: 500,
  //                             size: 14,
  //                           }
  //                         },
  //                       },
  //                       y: {
  //                         ticks: {
  //                           stepSize: 0.1,
  //                           font: {
  //                             weight: 500,
  //                             size: 14,
  //                           }
  //                         },
  //                       },
  //                     },
  //                   }
  //                 });
  //                 let eol_img = generarGrafico(eolGraph).replace('data:image/jpeg;base64,', '');
  
  //                 const outputPath = path.join(__dirname, '/output.pdf');              
  //                 const replaceText = async () => {
  //                   try{
  //                     const pdfdoc = await PDFNet.PDFDoc.createFromFilePath(pdfPath);
  //                     await pdfdoc.initSecurityHandler();
  //                     const replacer = await PDFNet.ContentReplacer.create();
  //                     const page = await pdfdoc.getPage(1); 
  //                     const pageSet = await PDFNet.PageSet.createRange(1, 1);
  //                     const page2 = await pdfdoc.getPage(2);
  //                     const pageSet2 = await PDFNet.PageSet.createRange(2, 2);
  //                     await replacer.addString('ANILOX', id);
  //                     await replacer.addString('date', last);
  //                     await replacer.addString('brand', brand);
  //                     await replacer.addString('type', tipo);
  //                     await replacer.addString('purchase', purchase);
  //                     await replacer.addString('volume', volume);
  //                     await replacer.addString('screen', screen);
  //                     await replacer.addString('last', last);
  //                     await replacer.addString('next', next);
  //                     await replacer.addString('revision', '');
  //                     await replacer.addString('tapadas', '');
  //                     await replacer.addString('danadas', '');
  //                     await replacer.addString('desgastadas', '');
  //                     await replacer.addString('historial_volumen', '');
  //                     await replacer.addString('grafico_eol', '');
  //                     await replacer.addString('estado', estado);
  //                     await replacer.addString('diagnostico', diagnostico);
  //                     await replacer.addString('recomendacion', recomendacion);
  //                     await replacer.addString('usuario', sesion_usuario);
  //                     await replacer.addString('hoy', new Date().toLocaleDateString('es-ES'));

  //                     await addBase64ImageToPDF(pdfdoc, pageSet, revision, coord_revision);
  //                     await addBase64ImageToPDF(pdfdoc, pageSet, tapadas_img, coord_tapadas);
  //                     await addBase64ImageToPDF(pdfdoc, pageSet, danadas_img, coord_danadas);
  //                     await addBase64ImageToPDF(pdfdoc, pageSet, desgastadas_img, coord_desgastadas);
  //                     await addBase64ImageToPDF(pdfdoc, pageSet, historial_img, coord_historial)

  //                     if( pdfPath == path.join(__dirname, '/modelo_reporte_final_alt.pdf') ) { 
  //                       await replacer.addString('grafico_eol', msg);
  //                       await replacer.process(page);
  //                       await replacer.process(page2);
  //                       await pdfdoc.save(outputPath, PDFNet.SDFDoc.SaveOptions.e_linearized).then(() => {
  //                         console.log('PDF alterno generado con éxito');
  //                         fs.readFile(outputPath, (err_f, data) => {
  //                           if (err_f) {
  //                             console.error('Error al leer el archivo PDF:', err_f);
  //                             return res.status(500).send('Error al procesar el archivo PDF');
  //                           }
  //                           const base64PDF = `data:application/pdf;base64,${data.toString('base64')}`;
  //                           const SQL5_PDF = 'SELECT * FROM anilox_history WHERE anilox = ?';
  //                           db.query(SQL5_PDF, [id], (err_g, rows_g) => {
  //                             if (rows_g.length > 0) {
  //                               const SQL6_PDF = 'UPDATE anilox_history SET report = ? WHERE anilox = ? AND id = ?';
  //                               db.query(SQL6_PDF, [base64PDF, id, rows_g.length], (err_h, rows_h) => {
  //                                 console.log('PDF convertido a Base64 y almacenado con éxito');
  //                               });
  //                             }
  //                           });
  //                         });
  //                       }).catch((error) => {
  //                         console.error('Error al procesar el archivo PDF:', error);
  //                         return res.status(500).send('Error al procesar el archivo PDF');
  //                       });
  //                     }
  //                     else{
  //                       await replacer.addString('eol_80', percentData.values[1].toString());
  //                       await replacer.addString('anio_80', diferenciasEnAnios[1].toFixed(1));
  //                       await replacer.addString('eol_70', percentData.values[2].toString());
  //                       await replacer.addString('anio_70', diferenciasEnAnios[2].toFixed(1));
  //                       await replacer.addString('eol_60', percentData.values[3].toString());
  //                       await replacer.addString('anio_60', diferenciasEnAnios[3].toFixed(1));
  //                       await addBase64ImageToPDF(pdfdoc, pageSet2, eol_img, coord_graficaEOL)
  //                           .then(() => {  
  //                               replacer.process(page);
  //                               replacer.process(page2);
  //                               pdfdoc.save(outputPath, PDFNet.SDFDoc.SaveOptions.e_linearized);
  //                               fs.readFile(outputPath, (err_f, data) => {
  //                                   if (err_f) {
  //                                       console.error('Error al leer el archivo PDF:', err_f);
  //                                       return res.status(500).send('Error al procesar el archivo PDF');                                      
  //                                   }
  //                                   const base64PDF = `data:application/pdf;base64,${data.toString('base64')}`;
  //                                   const SQL5_PDF = 'SELECT * FROM anilox_history WHERE anilox = ?';
  //                                   db.query(SQL5_PDF, [id], (err_g, rows_g) => {
  //                                       if (rows_g.length > 0) {
  //                                           const SQL6_PDF = 'UPDATE anilox_history SET report = ? WHERE anilox = ? AND id = ?';
  //                                           db.query(SQL6_PDF, [base64PDF, id, rows_g.length], (err_h, rows_h) => {
  //                                               console.log('PDF convertido a Base64 y almacenado con éxito');
  //                                           });
  //                                       }
  //                                   });
  //                               });
  //                           })
  //                           .catch((error) => {
  //                               console.error('Error al añadir imagen al PDF:', error);
  //                               res.status(500).send('Error al añadir imagen al PDF');
  //                           });
  //                     }                      
  //                   }
  //                   catch (error) {
  //                     console.error('Error al reemplazar el texto en el PDF:', error);
  //                     res.status(500).send('Error al reemplazar el texto en el PDF');
  //                   }      
  //                 }
  //                 try{
  //                   PDFNet.runWithCleanup(replaceText, "demo:1720195871717:7f8468a2030000000072c68a051f8b60b73e2b966862266ca0be4eacb7").then(() => {
  //                     console.log("PDF generado con éxito");
  //                     fs.readFile(outputPath, (err, data) => {
  //                         if (err) {
  //                             res.statusCode = 500;
  //                             res.send(err);
  //                         } else {                              
  //                             return res.status(200).send({ status: "Success", message: "PDF generado con éxito", result: rows3[0] });
  //                         }                   
  //                     })
  //                   }).catch(err => {
  //                       res.statusCode = 500;
  //                       res.send(err);
  //                   }); 
  //                 }
  //                 catch (error) {
  //                   console.log("Error en PDFNet.runWithCleanup: ",error);
  //                   return res.status(500).send({status: "Error", message: "Error al generar el PDF"});
  //                 }                  
  //               });                
  //           });
  //       });
  //   })      
  // } 
  // catch {
  //   console.log("Error al generar el PDF: ",error);
  //   return res.status(500).send({status: "Error", message: "Error al generar el PDF"});
  // }
}

module.exports = { login, registro, registro_licencia, password_recovery, soloAdmin, soloPublico, soloSuperAdmin, tablaAniloxAnalysis, tablaAniloxList,
                   cotizaciones, usuarioNivelCliente, tablaClientes, tablaLicencias, tablaAniloxHistory, borrarAnilox, generarPdf, superAnalysis, superListado, superHistory };

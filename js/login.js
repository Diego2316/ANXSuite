const mensajeError = document.getElementsByClassName("error")[0];

document.getElementById("login-form").addEventListener("submit", async(event) => {
    event.preventDefault();
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
  
    const passwordPattern = /^[a-zA-Z0-9@#\-_]*$/;
    if (!passwordPattern.test(password)) {
      alert('Contraseña incorrecta');
      return;
    }

    const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    if(!res.ok) return mensajeError.classList.toggle("escondido", false);
    const resJson = await res.json();
    if(resJson.redirect) {
        window.location.href = resJson.redirect;
    }
});

document.addEventListener('DOMContentLoaded', function() {
    var imagenesDeFondo = [
    //   '../assets/anilox1_2.jpeg',
    //   '../assets/anilox2.jpg',
    //   '../assets/anilox3_2.jpg',
    //   '../assets/anilox4.jpg',
      '../assets/anilox5.webp'
    ];
    
    var indiceAleatorio = Math.floor(Math.random() * imagenesDeFondo.length);
    var imagenSeleccionada = imagenesDeFondo[indiceAleatorio];

    document.body.style.backgroundImage = 'url(' + imagenSeleccionada + ')';
    document.body.style.backgroundSize = 'cover' // Asegura que el fondo cubra toda el área sin redimensionarse con el zoom
    document.body.style.backgroundPosition = 'center center'; // Centra el fondo
    // document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundRepeat = 'no-repeat'; // Evita que el fondo se repita

    var logoBlanco = '../assets/LogoANXSuite_blanco.png'; 
    var contenedorMarcaDeAgua = document.getElementById('logoMarcaDeAgua');

    if (imagenSeleccionada.includes('anilox3_2.jpg')) {
        contenedorMarcaDeAgua.innerHTML = '<img src="' + logoBlanco + '" alt="ANX Suite Blanco" class="logo" style="width: 300px;">';  
    }
});
const $image = d.getElementById("uploaded-image"),
      $imageUpload = d.getElementById("image-upload"),
      $csvUpload = d.getElementById("csv-upload"),
      $form = d.querySelector(".files-upload"),
      $code = d.getElementById("import-code"),
      $date = d.getElementById("import-date"),
      $volume = d.getElementById("import-volume"),
      $depth = d.getElementById("import-depth"),
      $opening = d.getElementById("import-opening"),
      $wall = d.getElementById("import-wall"),
      $screen = d.getElementById("import-screen"),
      $angle = d.getElementById("import-angle");

const $pdfUpload = d.getElementById("new-master");

let image, data, master;

let alreadyExists, saveId, saveBrand, saveType, savePurchase, saveMaster, saveLast, savePatron, saveNomVol;

const $modalNewAnilox = d.getElementById("modal-new-anilox"),
      $closeModalNewAnilox = d.getElementById("close-new-anilox"),
      $formNew = d.querySelector(".form-new");

const $modalExtraAnilox = d.getElementById("modal-extra-anilox"),
      $closeModalExtraAnilox = d.getElementById("close-extra-anilox"),
      $formExtra = d.querySelector(".form-extra"),
      $extraSkip = d.getElementById("extra-skip"),
      $extraSubmit = d.getElementById("extra-submit"),
      $extraRecorrido = d.getElementById("extra-recorrido");

const uploadImage = e=>{
  if(e.target === $imageUpload){
    if(e.target.files[0].type !== "image/jpeg"){
      alert("Solo se permite imagenes tipo JPG/JPEG");
      return;
    }
    image = e.target.files[0];
    $image.src = URL.createObjectURL(image);
  }
}

const uploadPdf = e=>{
  if(e.target === $pdfUpload){
    if(e.target.files[0].type !== "application/pdf"){
      alert("Solo se permite reportes de tipo PDF");
      return;
    }
    master = e.target.files[0];
  }
}

const uploadCSV = e=>{
  if(e.target === $csvUpload){
    if(e.target.files[0].type !== "text/csv" && e.target.files[0].type !== "application/vnd.ms-excel"){
      alert("Solo se permite archivos de datos tipo CSV");
      return;
    }
    data = e.target.files[0];
    Papa.parse(data, {
      delimiter: ",",
      worker: true,
      skipEmptyLines: true,
      complete: function(results){        
        if(results.data[0][2].slice(0, 2) == "AA"){
          results.data[0][2] = results.data[0][2].slice(0, 9);
        } else if(results.data[0][2].slice(0, 2) == "AS"){
          results.data[0][2] = results.data[0][2].slice(0, 8);
        }        
        const date = results.data[0][4].split(' ');
        const formatedDate = date[0].split('/');
        $code.value = results.data[0][2];
        $date.value = `${formatedDate[2]}-${formatedDate[1]}-${formatedDate[0]}`;
        $volume.value = results.data[0][16];
        $depth.value = results.data[0][17];
        $opening.value = results.data[0][18];
        $wall.value = results.data[0][19];
        $screen.value = results.data[0][20];
        $angle.value = results.data[0][21];
      }
    })
  }
}

const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
});

const closeModal = e=>{
  if(e.target === $closeModalNewAnilox){
    $modalNewAnilox.style.display = "none";
  }
  if(e.target === $closeModalExtraAnilox){
    $modalExtraAnilox.style.display = "none";
  }
}

const submit = async(e)=>{
  e.preventDefault();
  if(e.target === $form){ // Formulario inicial (carga de csv e imagen)
    if($image.src.includes("anilox-placeholder.jpg")){
      alert("Debe seleccionar una imagen de ánilox para poder importar los datos");
      return;
    }
    if($code.value === "" || $date.value === "" || $volume.value === "" || $depth.value === "" || $opening.value === "" || $wall.value === "" || $screen.value === "" || $angle.value === ""){
      alert("Debe seleccionar un archivo CSV válido para poder importar los datos");
      return;
    }
    if(!image.name.includes($code.value)){
      alert("Archivo CSV e imagen de ánilox no coinciden");
      return;
    }
    // if(Date.parse(image.lastModifiedDate) !== Date.parse(data.lastModifiedDate)){
    //   alert("Fecha de archivo CSV e imagen de ánilox no coinciden");
    //   return;
    // }
    
    try {
      let res = await fetch("/api/listado", { // Ejecuta la línea 577 de autenticacion.js (Condición else{})
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      }
    }),
        json = await res.json();
        json = json.result;

      if(!res.ok) throw{status: res.status, statusText: res.statusText};

      json.forEach(el=>{
        if(el.id === $code.value){
          alreadyExists = 1;
          saveId = el.id;
          saveBrand = el.brand;
          saveType = el.type;
          savePurchase = el.purchase;
          saveNomVol = el.nomvol;
          saveLast = el.last;
          saveMaster = el.master;
          savePatron = el.patron;
        }
        else {
          alreadyExists = 0;
        }
      });

      if(alreadyExists === 1){
        if(Date.parse(e.target.date.value) > Date.parse(saveLast)){
          $modalExtraAnilox.style.display = "block"; // Si el anilox ya existe se muestra el <div> "Ingrese el recorrido del anilox". Dentro está $formExtra
        }
        else{
          alert("No se permite importar revisiones con fecha anterior a la última registrada");
        }
      }
      if(alreadyExists === 0){
        $modalNewAnilox.style.display = "block"; // Si el anilox no existe, se muestra el <div> "Nuevo rodillo anilox". Dentro de este div está $formNew
      }
    } 
    catch (err) {
      console.log(err);
      let errorCode = err.status || "2316",
          errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
          message1 = "Error " + errorCode + ": ",
          message2 = errorStatus;
      $form.insertAdjacentHTML("afterend", `<p><b>${message1}</b>${message2}</p>`);
      setTimeout(()=>{
        $form.nextElementSibling.remove()
      }, 2000);
    }
  }

  if(e.target === $formNew){  // $formNew carga al ingresar un nuevo anilox: "Ingresar fabricante, fecha de compra, volumen nominal y reporte de fábrica"
    try {      
      const imagen = await toBase64(image); // Recoge la imagen y pdf cargadas en el formulario inicial ($form)
      const pdf = await toBase64(master);

      let options = {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },        
        body: JSON.stringify({
          id: $code.value,
          brand: e.target.brand.value,
          purchase: e.target.purchase.value,
          volume: $volume.value,
          nomvol: e.target.nomvol.value,
          depth: $depth.value,
          opening: $opening.value,
          wall: $wall.value,
          screen: $screen.value,
          angle: $angle.value,
          last: $date.value,
          master: pdf,  
          patron: imagen,
          insertar: 1,
        }),
      },
        res = await fetch("api/listado", options); // Se ejecuta else if(insertar) ni bien se da submit al formulario de nuevo anilox

      let json = await res.json();

      if(!res.ok) throw{status: res.status, statusText: res.statusText};
      console.log("Se acaba de insertar un nuevo registro: ", json);
    }
    catch (err) {
      console.log(err);
      let errorCode = err.status || "2316",
          errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
          message1 = "Error " + errorCode + ": ",
          message2 = errorStatus;
      $formNew.insertAdjacentHTML("afterend", `<p><b>${message1}</b>${message2}</p>`);
      setTimeout(()=>{
        $formNew.nextElementSibling.remove()
      }, 2000);
    }
  }
}

const recorrido = async(e)=>{ // Página de "Ingrese el recorrido del anilox"
  if(e.target === $extraSkip || e.target === $extraSubmit){ // Se dispara al hacer click en el botón de "Omitir" o "Importar" del modal-extra-anilox
    try {
      const imagen = await toBase64(image); // Solo guarda la imagen del formulario inicial ($form)
      let valRecorrido;
      if(e.target === $extraSkip){
        valRecorrido = 0;
      }
      else if(e.target === $extraSubmit){
        if($extraRecorrido.validity.patternMismatch){
          alert("Debe ingresar un número"); 
          return;
        }
        if($extraRecorrido.value === ""){ // Si no se ingresa un recorrido, se toma el valor 0
          valRecorrido = 0;
        } else {
          valRecorrido = $extraRecorrido.value;
        }
      }

      let res = await fetch('api/listado', {  // Se ejecuta una vez que se de submit al recorrido, se envían los datos y el mensaje modificar=1
          method: "POST",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify({
            id: saveId,
            brand: saveBrand,
            recorrido: valRecorrido,
            volume: $volume.value,
            last: $date.value,
            patron: savePatron,
            revision: imagen,
            modificar: 1,
          }),
      });
      let json = await res.json();

      console.log("El valor de json en modificar es: ", json);
      if(!res.ok) throw{status: res.status, statusText: res.statusText};

// --------CÓDIGO PARA GENERAR PDF-----
      let res2 = await fetch('api/pdf', { // Se ejecuta después del procesamiento de imágenes
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          id: saveId,
          brand: saveBrand,
          recorrido: valRecorrido,
          volume: $volume.value,
          screen: $screen.value,
          last: $date.value,
          patron: savePatron,
          revision: imagen,
          insertar: 1,
        }),
      });
      console.log("res2 es igual a: ", res2);
      let json2 = await res2.json();
      json2 = json2.result;
      console.log("json2 es igual a: ", json2);

      if(!res2.ok) throw{status: res2.status, statusText: res2.statusText};  
      $formExtra.submit();  // Envia el formulario de recorrido
    } 
    catch (err) {
      console.log(err);
      let errorCode = err.status || "2316",
          errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
          message1 = "Error " + errorCode + ": ",
          message2 = errorStatus;
      $formExtra.insertAdjacentHTML("afterend", `<p><b>${message1}</b>${message2}</p>`);
      setTimeout(()=>{
          $formExtra.nextElementSibling.remove()
      }, 2000);
    }
  }
}

const levelCheck = ()=>{
  let level = ss.getItem("level");
  if(level !== "3"){
    alert("No se encuentra autorizado para realizar esta operación");
    window.location.href = "index.html";
  }
}

d.addEventListener("DOMContentLoaded",levelCheck);
d.addEventListener("change", uploadImage);
d.addEventListener("change", uploadCSV);
d.addEventListener("change", uploadPdf);
d.addEventListener("submit", submit);
d.addEventListener("click", closeModal);
d.addEventListener("click", recorrido);


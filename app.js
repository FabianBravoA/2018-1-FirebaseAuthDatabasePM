window.onload = ()=>{
    firebase.auth().onAuthStateChanged((user)=>{
        if(user){ //Si está logeado, mostraremos la opción loggedIn
            loggedIn.style.display = "block";
            loggedOut.style.display = "none";
            username.innerText = user.displayName;
        }else{ //Si NO está logeado, mostraremos la opción loggedOut
            loggedIn.style.display = "none";
            loggedOut.style.display = "block";
        }
        console.log("User > "+JSON.stringify(user));
    });

    firebase.database().ref('gifs/-LH4x2MxlMhbY9Bf0O-M/creator') //ref es la ruta para llegar a los datos
        .once('value')
        .then((gif)=>{
            console.log("EL Gif > "+JSON.stringify(gif));
        })
        .catch((error)=>{
            console.log("Database error > "+JSON.stringify(error));
        });

//Base de datos para consultar SÓLO UNA VEZ
    firebase.database().ref('gifs')
        .limitToLast(2) //Filtro de datos, donde limito sólo 2 gifs
        .once('value') //Para escuchar datos sólo una vez
        .then((gifs)=>{
            console.log("Gifs > "+JSON.stringify(gifs));
        })
        .catch((error)=>{
            console.log("Database error > "+error);
        });
//Base de datos para consultar MÁS DE UNA VEZ
    firebase.database().ref('gifs')
        .limitToLast(5) //Filtro de mensajes cuando se cargan los datos
        .on('child_added', (newGif)=>{ //Para escuchar datos más veces o doblegados
            gifContainer.innerHTML += `
                <p>${newGif.val().creatorName}</p>
                <img style="width: 200px" src="${newGif.val().gifURL}">
                </img>
            `;
        });
};

//Registro
function registerWithFirebase(){
    const emailValue = email.value;
    const passwordValue = password.value;

    firebase.auth().createUserWithEmailAndPassword(emailValue, passwordValue)
        .then(()=>{
            console.log("Usuario creado con éxito");
        })
        .catch((error)=>{
            console.log("Error de firebase > Código > "+error.code); //error.code nos mostrará el código de error para informarnos qué pasó
            console.log("Error de firebase > Mensaje > "+error.message); //error.message nos mostrará el mensaje de firebase del mismo error
        });
}
//Login
function loginWithFirebase(){
    const emailValue = email.value;
    const passwordValue = password.value;

    firebase.auth().signInWithEmailAndPassword(emailValue, passwordValue)
        .then(()=>{
            console.log("Usuario inició sesión con éxito");
        })
        .catch((error)=>{
            console.log("Error de firebase > Código > "+error.code); //error.code nos mostrará el código de error para informarnos qué pasó
            console.log("Error de firebase > Mensaje > "+error.message); //error.message nos mostrará el mensaje de firebase del mismo error
        });
}

function logoutWithFirebase(){
    firebase.auth().signOut()
        .then(()=>{
            console.log("Usuario finalizó su sesión");
        })
        .catch((error)=>{
            console.log("Error de firebase > Código > "+error.code); //error.code nos mostrará el código de error para informarnos qué pasó
            console.log("Error de firebase > Mensaje > "+error.message); //error.message nos mostrará el mensaje de firebase del mismo error
        });
}
//Login con Facebook
function facebookLoginWithFirebase(){
    const provider = new firebase.auth.FacebookAuthProvider(); // creamos un nuevo objeto 

    provider.setCustomParameters({ // le decimos que haga un login con facebook y enlace un popup
        'display' : 'popup'
    });

    firebase.auth().signInWithPopup(provider)
        .then(()=>{
            console.log("Login con facebook exitoso");
        })
        .catch((error)=>{
            console.log("Error de firebase > Código > "+error.code); //error.code nos mostrará el código de error para informarnos qué pasó
            console.log("Error de firebase > Mensaje > "+error.message); //error.message nos mostrará el mensaje de firebase del mismo error
        });
}
//Opción para enviar gif
function sendGif(){
    const gifValue = gifArea.value;

    const newGifKey = firebase.database().ref().child("gifs").push().key; //key permite que se generen llaves nuevas para guardar los gifs 
    const currentUser = firebase.auth().currentUser; //Si estamos logueados, siempre podremos acceder a los datos, en este caso, a los gifs
    firebase.database().ref(`gifs/${newGifKey}`).set({
        gifURL : gifValue, 
        creatorName : currentUser.displayName || //Si esto está null o undefined, sigue con la opción que le sigue "||"
                        currentUser.providerData[0].email,
        creator : currentUser.uid
    });
}
//Opción para enviar foto
function sendPhotoToStorage(){
    const photoFile = photoFileSelector.files[0];
    const fileName = photoFile.name; // nombre del archivo, sirve para armar la ruta
    const metadata = { // datos sobre el archivo que estamos subiendo
        contentType : photoFile.type// tipo de archivo que estamos subiendo
    };
    // va a retornar una tarea= task (objeto)
    const task = firebase.storage().ref('images') //Corresponden a las carpetas que tenemos dentro del storage
        .child(fileName)
        .put(photoFile, metadata);
 
    task.then(snapshot => snapshot.ref.getDownloadURL())  //obtenemos la url de descarga (de la imagen)
        .then(url => {
            console.log("URL del archivo > "+url);
        });
}


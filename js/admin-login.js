// ========================================
// SGE INFORMÁTICA PRÁTICA
// LOGIN DA ADMINISTRAÇÃO
// ========================================


const firebaseConfig = {

    apiKey: "AIzaSyDoekE76yr3qT0r3MJxJ12Rk5moryQFGbk",

    authDomain: "sge-informatica-pratica-4ad2d.firebaseapp.com",

    projectId: "sge-informatica-pratica-4ad2d",

    storageBucket: "sge-informatica-pratica-4ad2d.firebasestorage.app",

    messagingSenderId: "957035603926",

    appId: "1:957035603926:web:603b9d295a4abdab7ee677"

};


// Inicializar Firebase

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}


const auth = firebase.auth();

const db = firebase.firestore();


// ========================================
// LOGIN
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    const formulario = document.getElementById("formLogin");

    const mensagem = document.getElementById("mensagem");

    const botao = document.getElementById("btnLogin");


    formulario.addEventListener("submit", async function (event) {

        event.preventDefault();


        const email =
            document.getElementById("email").value.trim();

        const senha =
            document.getElementById("senha").value;


        botao.disabled = true;

        botao.innerHTML = "⏳ A entrar...";

        mensagem.style.display = "none";


        try {

            // Fazer login no Firebase Authentication

            const resultado =
                await auth.signInWithEmailAndPassword(
                    email,
                    senha
                );


            const usuario = resultado.user;


            // Verificar se o utilizador é administrador

            const documento =
                await db
                    .collection("admins")
                    .doc(usuario.uid)
                    .get();


            if (!documento.exists ||
                documento.data().admin !== true) {

                await auth.signOut();

                throw new Error(
                    "Este utilizador não possui permissão de administrador."
                );
            }


            // Guardar dados básicos da sessão

            sessionStorage.setItem(
                "adminUid",
                usuario.uid
            );


            sessionStorage.setItem(
                "adminEmail",
                usuario.email
            );


            // Entrar no painel

            window.location.href =
                "painel.html";


        } catch (erro) {

            console.error(
                "Erro no login:",
                erro
            );


            let texto =
                "Não foi possível entrar.";


            if (
                erro.code ===
                "auth/invalid-credential"
            ) {

                texto =
                    "E-mail ou palavra-passe incorretos.";

            }


            if (
                erro.code ===
                "auth/user-not-found"
            ) {

                texto =
                    "Este e-mail não está registado.";

            }


            if (
                erro.code ===
                "auth/wrong-password"
            ) {

                texto =
                    "A palavra-passe está incorreta.";

            }


            if (
                erro.message &&
                erro.message.includes(
                    "não possui permissão"
                )
            ) {

                texto =
                    "Este utilizador não possui permissão de administrador.";

            }


            mensagem.innerText = "❌ " + texto;

            mensagem.style.display = "block";

            mensagem.style.background =
                "#ffecec";

            mensagem.style.color =
                "#b00020";


            botao.disabled = false;

            botao.innerHTML = "🔑 Entrar";

        }

    });

});

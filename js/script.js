// ========================================
// SGE INFORMÁTICA PRÁTICA
// JAVASCRIPT PRINCIPAL
// ========================================


// ========================================
// MENU MOBILE
// ========================================

function abrirMenu() {

    const menu = document.getElementById("menu");

    if (menu) {
        menu.classList.toggle("ativo");
    }

}


// Fechar menu ao clicar num link

document.addEventListener("DOMContentLoaded", function () {

    const links = document.querySelectorAll("#menu a");

    links.forEach(function (link) {

        link.addEventListener("click", function () {

            const menu = document.getElementById("menu");

            if (menu) {
                menu.classList.remove("ativo");
            }

        });

    });

});


// ========================================
// FIREBASE
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

const db = firebase.firestore();


// ========================================
// FORMULÁRIO DE INSCRIÇÃO
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    const formulario = document.getElementById("formInscricao");

    if (!formulario) {
        return;
    }


    formulario.addEventListener("submit", async function (event) {

        event.preventDefault();


        // Capturar dados

        const nome = document.getElementById("nome").value.trim();

        const telefone = document.getElementById("telefone").value.trim();

        const email = document.getElementById("email").value.trim();

        const curso = document.getElementById("curso").value;

        const nivel = document.getElementById("nivel").value;

        const modalidade = document.getElementById("modalidade").value;

        const municipio = document.getElementById("municipio").value.trim();

        const observacao = document.getElementById("observacao").value.trim();


        // Verificação

        if (!nome || !telefone || !curso) {

            alert("Por favor, preencha todos os campos obrigatórios.");

            return;

        }


        // Desativar botão enquanto envia

        const botao = formulario.querySelector("button[type='submit']");

        const textoOriginal = botao.innerHTML;

        botao.disabled = true;

        botao.innerHTML = "⏳ Enviando...";


        try {


            // Guardar inscrição no Firestore

            await db.collection("inscricoes").add({

                nome: nome,

                telefone: telefone,

                email: email,

                curso: curso,

                nivel: nivel,

                modalidade: modalidade,

                municipio: municipio,

                observacao: observacao,

                estado: "Pendente",

                dataInscricao: firebase.firestore.FieldValue.serverTimestamp()

            });


            // Sucesso

            alert(
                "✅ Inscrição enviada com sucesso!\n\n" +
                "A sua inscrição foi recebida pelo SGE Informática Prática."
            );


            // Limpar formulário

            formulario.reset();


        } catch (erro) {

            console.error("Erro ao enviar inscrição:", erro);

            alert(
                "❌ Não foi possível enviar a inscrição.\n\n" +
                "Verifique a sua ligação à Internet e tente novamente."
            );

        }


        // Restaurar botão

        botao.disabled = false;

        botao.innerHTML = textoOriginal;

    });

});

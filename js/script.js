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

const auth = firebase.auth();


// ========================================
// FORMULÁRIO DE INSCRIÇÃO
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    const formulario =
        document.getElementById("formInscricao");


    if (!formulario) {
        return;
    }


    formulario.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ========================================
            // CAPTURAR DADOS
            // ========================================

            const nome =
                document
                    .getElementById("nome")
                    .value
                    .trim();


            const telefone =
                document
                    .getElementById("telefone")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const senha =
                document
                    .getElementById("senha")
                    .value;


            const confirmarSenha =
                document
                    .getElementById("confirmarSenha")
                    .value;


            const curso =
                document
                    .getElementById("curso")
                    .value;


            const nivel =
                document
                    .getElementById("nivel")
                    .value;


            const modalidade =
                document
                    .getElementById("modalidade")
                    .value;


            const municipio =
                document
                    .getElementById("municipio")
                    .value
                    .trim();


            const observacao =
                document
                    .getElementById("observacao")
                    .value
                    .trim();


            // ========================================
            // VERIFICAR DADOS
            // ========================================

            if (
                !nome ||
                !telefone ||
                !email ||
                !senha ||
                !confirmarSenha ||
                !curso
            ) {

                alert(
                    "⚠️ Preencha todos os campos obrigatórios."
                );

                return;

            }


            // ========================================
            // VERIFICAR SENHA
            // ========================================

            if (senha.length < 6) {

                alert(
                    "❌ A senha deve ter pelo menos 6 caracteres."
                );

                return;

            }


            if (senha !== confirmarSenha) {

                alert(
                    "❌ As senhas não coincidem."
                );

                return;

            }


            // ========================================
            // DESATIVAR BOTÃO
            // ========================================

            const botao =
                formulario.querySelector(
                    "button[type='submit']"
                );


            const textoOriginal =
                botao.innerHTML;


            botao.disabled = true;


            botao.innerHTML =
                "⏳ Criando conta...";


            try {

                // ========================================
                // CRIAR CONTA
                // ========================================

                const resultado =
                    await auth
                        .createUserWithEmailAndPassword(
                            email,
                            senha
                        );


                const usuario =
                    resultado.user;


                // ========================================
                // CRIAR INSCRIÇÃO
                // ========================================

                await db
                    .collection("inscricoes")
                    .add({

                        alunoUid:
                            usuario.uid,

                        nome:
                            nome,

                        telefone:
                            telefone,

                        email:
                            email,

                        cursoId:
                            curso,

                        nivel:
                            nivel,

                        modalidade:
                            modalidade,

                        municipio:
                            municipio,

                        observacao:
                            observacao,

                        estado:
                            "Pendente",

                        dataInscricao:
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()

                    });


                // ========================================
                // SAIR DA CONTA
                // ========================================

                await auth.signOut();


                // ========================================
                // MENSAGEM DE SUCESSO
                // ========================================

                alert(
                    "✅ CONTA CRIADA COM SUCESSO!\n\n" +

                    "A sua inscrição foi enviada " +
                    "para análise.\n\n" +

                    "📌 Estado: Pendente\n\n" +

                    "Depois da confirmação, poderá " +
                    "entrar na Área do Aluno usando " +
                    "o e-mail e a senha que criou."
                );


                // Limpar formulário

                formulario.reset();


            } catch (erro) {

                console.error(
                    "Erro ao criar conta:",
                    erro
                );


                // ========================================
                // E-MAIL JÁ EXISTENTE
                // ========================================

                if (
                    erro.code ===
                    "auth/email-already-in-use"
                ) {

                    alert(
                        "❌ Este e-mail já possui uma conta.\n\n" +

                        "Utilize outro e-mail ou entre " +
                        "na sua conta."
                    );

                }


                // ========================================
                // E-MAIL INVÁLIDO
                // ========================================

                else if (
                    erro.code ===
                    "auth/invalid-email"
                ) {

                    alert(
                        "❌ O e-mail informado não é válido."
                    );

                }


                // ========================================
                // SENHA FRACA
                // ========================================

                else if (
                    erro.code ===
                    "auth/weak-password"
                ) {

                    alert(
                        "❌ A senha é muito fraca.\n\n" +

                        "Utilize pelo menos 6 caracteres."
                    );

                }


                // ========================================
                // OUTRO ERRO
                // ========================================

                else {

                    alert(
                        "❌ Não foi possível criar a conta.\n\n" +

                        "Erro: " +
                        (
                            erro.message ||
                            "Erro desconhecido."
                        )
                    );

                }


            } finally {

                // ========================================
                // RESTAURAR BOTÃO
                // ========================================

                botao.disabled = false;

                botao.innerHTML =
                    textoOriginal;

            }

        });

});

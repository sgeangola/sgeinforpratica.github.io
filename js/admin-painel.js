// ========================================
// SGE INFORMÁTICA PRÁTICA
// PAINEL ADMINISTRATIVO
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

let todasInscricoes = [];

// ========================================
// VERIFICAR ADMINISTRADOR
// ========================================

auth.onAuthStateChanged(async function (usuario) {

    if (!usuario) {

        window.location.href =
            "login.html";

        return;

    }


    try {

        const documento =
            await db
                .collection("admins")
                .doc(usuario.uid)
                .get();


        if (
            !documento.exists ||
            documento.data().admin !== true
        ) {

            await auth.signOut();

            alert(
                "Você não possui permissão de administrador."
            );

            window.location.href =
                "login.html";

            return;

        }


        carregarInscricoes();


    } catch (erro) {

        console.error(
            "Erro ao verificar administrador:",
            erro
        );

        alert(
            "Não foi possível verificar o acesso administrativo."
        );

        await auth.signOut();

        window.location.href =
            "login.html";

    }

});


// ========================================
// CARREGAR INSCRIÇÕES
// ========================================

async function carregarInscricoes() {

    const carregando =
        document.getElementById("carregando");

    const tabela =
        document.getElementById("tabela");

    const semDados =
        document.getElementById("semDados");

    const lista =
        document.getElementById("listaInscricoes");


    carregando.style.display = "block";

    tabela.style.display = "none";

    semDados.style.display = "none";


    lista.innerHTML = "";


    try {

        const resultado =
            await db
                .collection("inscricoes")
                .orderBy(
                    "dataInscricao",
                    "desc"
                )
                .get();


        let total = 0;
        let pendentes = 0;
        let confirmadas = 0;
        let formacao = 0;
        let concluidas = 0;

todasInscricoes = [];
        
        resultado.forEach(function (doc) {

            const dados = doc.data();

            todasInscricoes.push({
    id: doc.id,
    dados: dados
});
            
            total++;


            const estado =
                dados.estado || "Pendente";


            if (estado === "Pendente") {
                pendentes++;
            }

            if (estado === "Confirmada") {
                confirmadas++;
            }

            if (estado === "Em formação") {
                formacao++;
            }

            if (estado === "Concluída") {
                concluidas++;
            }


            const linha =
                document.createElement("tr");


            linha.innerHTML = `

                <td>
                    ${dados.nome || ""}
                </td>

                <td>
                    ${dados.telefone || ""}
                </td>

                <td>
                    ${dados.curso || ""}
                </td>

                <td>
                    ${dados.nivel || ""}
                </td>

                <td>
                    ${dados.modalidade || ""}
                </td>

                <td>
                    ${dados.municipio || ""}
                </td>

                <td>
                    <span class="estado ${classeEstado(estado)}">
                        ${estado}
                    </span>
                </td>

                <td>

                    <div class="acoes">

                        <button
                            class="btn-pequeno btn-confirmar"
                            onclick="alterarEstado('${doc.id}', 'Confirmada')"
                        >
                            Confirmar
                        </button>

                        <button
                            class="btn-pequeno btn-formacao"
                            onclick="alterarEstado('${doc.id}', 'Em formação')"
                        >
                            Formação
                        </button>

                        <button
                            class="btn-pequeno btn-concluir"
                            onclick="alterarEstado('${doc.id}', 'Concluída')"
                        >
                            Concluir
                        </button>

                        <button
                            class="btn-pequeno btn-eliminar"
                            onclick="eliminarInscricao('${doc.id}')"
                        >
                            Eliminar
                        </button>

                    </div>

                </td>

            `;


            lista.appendChild(linha);

        });


        document.getElementById("total").innerText =
            total;

        document.getElementById("pendentes").innerText =
            pendentes;

        document.getElementById("confirmadas").innerText =
            confirmadas;

        document.getElementById("formacao").innerText =
            formacao;

        document.getElementById("concluidas").innerText =
            concluidas;


        carregando.style.display = "none";


        if (total === 0) {

            semDados.style.display = "block";

        } else {

            tabela.style.display = "table";

        }


    } catch (erro) {

        console.error(
            "Erro ao carregar inscrições:",
            erro
        );

        carregando.innerHTML =
            "❌ Não foi possível carregar as candidaturas.";

    }

}


// ========================================
// CLASSE DO ESTADO
// ========================================

function classeEstado(estado) {

    if (estado === "Confirmada") {
        return "confirmada";
    }

    if (estado === "Em formação") {
        return "formacao";
    }

    if (estado === "Concluída") {
        return "concluida";
    }

    return "pendente";

}


// ========================================
// ALTERAR ESTADO
// ========================================

async function alterarEstado(id, novoEstado) {

    try {

        await db
            .collection("inscricoes")
            .doc(id)
            .update({

                estado: novoEstado

            });


        alert(
            "✅ Estado alterado para: " +
            novoEstado
        );


        carregarInscricoes();


    } catch (erro) {

        console.error(
            "Erro ao alterar estado:",
            erro
        );

        alert(
            "❌ Não foi possível alterar o estado."
        );

    }

}


// ========================================
// ELIMINAR INSCRIÇÃO
// ========================================

async function eliminarInscricao(id) {

    const confirmar =
        confirm(
            "Tem certeza que deseja eliminar esta candidatura?"
        );


    if (!confirmar) {
        return;
    }


    try {

        await db
            .collection("inscricoes")
            .doc(id)
            .delete();


        alert(
            "🗑️ Candidatura eliminada."
        );


        carregarInscricoes();


    } catch (erro) {

        console.error(
            "Erro ao eliminar:",
            erro
        );

        alert(
            "❌ Não foi possível eliminar a candidatura."
        );

    }

}


// ========================================
// TERMINAR SESSÃO
// ========================================

async function sair() {

    await auth.signOut();

    sessionStorage.removeItem(
        "adminUid"
    );

    sessionStorage.removeItem(
        "adminEmail"
    );


    window.location.href =
        "login.html";

}

// ========================================
// PESQUISA E FILTROS
// ========================================

function filtrarInscricoes() {

    const pesquisa =
        document.getElementById("pesquisa")
        .value
        .toLowerCase()
        .trim();

    const estado =
        document.getElementById("filtroEstado")
        .value;

    const curso =
        document.getElementById("filtroCurso")
        .value;


    const lista =
        document.getElementById("listaInscricoes");


    lista.innerHTML = "";


    let encontradas = 0;


    todasInscricoes.forEach(function (item) {

        const dados = item.dados;


        const nome =
            (dados.nome || "").toLowerCase();

        const telefone =
            (dados.telefone || "").toLowerCase();

        const email =
            (dados.email || "").toLowerCase();


        const correspondePesquisa =
            !pesquisa ||
            nome.includes(pesquisa) ||
            telefone.includes(pesquisa) ||
            email.includes(pesquisa);


        const correspondeEstado =
            !estado ||
            dados.estado === estado;


        const correspondeCurso =
            !curso ||
            dados.curso === curso;


        if (
            correspondePesquisa &&
            correspondeEstado &&
            correspondeCurso
        ) {

            encontradas++;


            const linha =
                document.createElement("tr");


            const estadoAtual =
                dados.estado || "Pendente";


            linha.innerHTML = `

                <td>${dados.nome || ""}</td>

                <td>${dados.telefone || ""}</td>

                <td>${dados.curso || ""}</td>

                <td>${dados.nivel || ""}</td>

                <td>${dados.modalidade || ""}</td>

                <td>${dados.municipio || ""}</td>

                <td>
                    <span class="estado ${classeEstado(estadoAtual)}">
                        ${estadoAtual}
                    </span>
                </td>

                <td>

                    <div class="acoes">

                        <button
                            class="btn-pequeno btn-confirmar"
                            onclick="alterarEstado('${item.id}', 'Confirmada')"
                        >
                            Confirmar
                        </button>

                        <button
                            class="btn-pequeno btn-formacao"
                            onclick="alterarEstado('${item.id}', 'Em formação')"
                        >
                            Formação
                        </button>

                        <button
                            class="btn-pequeno btn-concluir"
                            onclick="alterarEstado('${item.id}', 'Concluída')"
                        >
                            Concluir
                        </button>

                        <button
                            class="btn-pequeno btn-eliminar"
                            onclick="eliminarInscricao('${item.id}')"
                        >
                            Eliminar
                        </button>

                    </div>

                </td>

            `;


            lista.appendChild(linha);

        }

    });


    if (encontradas === 0) {

        document.getElementById("tabela")
            .style.display = "none";

        document.getElementById("semDados")
            .style.display = "block";

    } else {

        document.getElementById("tabela")
            .style.display = "table";

        document.getElementById("semDados")
            .style.display = "none";

    }


    atualizarCursos();
}


// ========================================
// PREENCHER FILTRO DE CURSOS
// ========================================

function atualizarCursos() {

    const select =
        document.getElementById("filtroCurso");


    if (!select) {
        return;
    }


    const cursoAtual =
        select.value;


    const cursos = [];


    todasInscricoes.forEach(function (item) {

        const curso =
            item.dados.curso;


        if (
            curso &&
            !cursos.includes(curso)
        ) {

            cursos.push(curso);

        }

    });


    select.innerHTML =
        '<option value="">Todos os cursos</option>';


    cursos.sort().forEach(function (curso) {

        const option =
            document.createElement("option");

        option.value = curso;

        option.textContent = curso;

        select.appendChild(option);

    });


    if (cursos.includes(cursoAtual)) {
        select.value = cursoAtual;
    }

                }

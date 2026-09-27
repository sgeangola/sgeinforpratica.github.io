// ========================================
// SGE INFORMÁTICA PRÁTICA
// GESTÃO DE CURSOS
// ========================================


const firebaseConfig = {

    apiKey: "AIzaSyDoekE76yr3qT0r3MJxJ12Rk5moryQFGbk",

    authDomain: "sge-informatica-pratica-4ad2d.firebaseapp.com",

    projectId: "sge-informatica-pratica-4ad2d",

    storageBucket: "sge-informatica-pratica-4ad2d.firebasestorage.app",

    messagingSenderId: "957035603926",

    appId: "1:957035603926:web:603b9d295a4abdab7ee677"

};


// ========================================
// FIREBASE
// ========================================

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

const db = firebase.firestore();


// ID do curso que está sendo editado

let cursoEditando = null;


// ========================================
// VERIFICAR ADMIN
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


        carregarCursos();


    } catch (erro) {

        console.error(
            "Erro ao verificar administrador:",
            erro
        );

        alert(
            "Não foi possível verificar o acesso."
        );

        await auth.signOut();

        window.location.href =
            "login.html";

    }

});


// ========================================
// CARREGAR CURSOS
// ========================================

async function carregarCursos() {

    const carregando =
        document.getElementById("carregando");

    const tabela =
        document.getElementById("tabelaCursos");

    const semDados =
        document.getElementById("semDados");

    const lista =
        document.getElementById("listaCursos");


    carregando.style.display = "block";

    tabela.style.display = "none";

    semDados.style.display = "none";


    lista.innerHTML = "";


    try {

        const resultado =
            await db
                .collection("cursos")
                .orderBy("nome")
                .get();


        carregando.style.display = "none";


        if (resultado.empty) {

            semDados.style.display = "block";

            return;

        }


        tabela.style.display = "table";


        resultado.forEach(function (doc) {

            const curso =
                doc.data();


            const estado =
                curso.ativo === false
                    ? "Inativo"
                    : "Ativo";


            const classe =
                curso.ativo === false
                    ? "inativo"
                    : "ativo";


            const linha =
                document.createElement("tr");


            linha.innerHTML = `

                <td>
                    <strong>
                        ${curso.nome || ""}
                    </strong>
                </td>

                <td>
                    ${curso.descricao || "-"}
                </td>

                <td>
                    ${curso.duracao || "-"}
                </td>

                <td>
                    ${curso.modalidade || "-"}
                </td>

                <td>
                    <span class="estado ${classe}">
                        ${estado}
                    </span>
                </td>

                <td>

                    <div class="acoes">

                        <button
                            class="btn-pequeno btn-editar"
                            onclick="editarCurso('${doc.id}')"
                        >
                            ✏️ Editar
                        </button>

                        <button
                            class="btn-pequeno btn-estado"
                            onclick="alterarEstadoCurso(
                                '${doc.id}',
                                ${curso.ativo !== false}
                            )"
                        >
                            ${curso.ativo === false
                                ? "Ativar"
                                : "Desativar"}
                        </button>

                        <button
                            class="btn-pequeno btn-eliminar"
                            onclick="eliminarCurso('${doc.id}')"
                        >
                            🗑️ Eliminar
                        </button>

                    </div>

                </td>

            `;


            lista.appendChild(linha);

        });


    } catch (erro) {

        console.error(
            "Erro ao carregar cursos:",
            erro
        );


        carregando.innerHTML =
            "❌ Não foi possível carregar os cursos.";

    }

}


// ========================================
// NOVO CURSO
// ========================================

function novoCurso() {

    cursoEditando = null;


    document.getElementById(
        "tituloFormulario"
    ).innerText =
        "➕ Novo curso";


    document.getElementById(
        "formCurso"
    ).reset();


    document.getElementById(
        "formularioCurso"
    ).style.display =
        "block";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ========================================
// GUARDAR CURSO
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const formulario =
            document.getElementById("formCurso");


        formulario.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const nome =
                    document
                        .getElementById("nomeCurso")
                        .value
                        .trim();


                const descricao =
                    document
                        .getElementById("descricaoCurso")
                        .value
                        .trim();


                const duracao =
                    document
                        .getElementById("duracaoCurso")
                        .value
                        .trim();


                const modalidade =
                    document
                        .getElementById("modalidadeCurso")
                        .value;


                if (!nome) {

                    alert(
                        "Digite o nome do curso."
                    );

                    return;

                }


                try {

                    if (cursoEditando) {

                        await db
                            .collection("cursos")
                            .doc(cursoEditando)
                            .update({

                                nome: nome,

                                descricao: descricao,

                                duracao: duracao,

                                modalidade: modalidade

                            });


                        alert(
                            "✅ Curso atualizado com sucesso."
                        );


                    } else {

                        await db
                            .collection("cursos")
                            .add({

                                nome: nome,

                                descricao: descricao,

                                duracao: duracao,

                                modalidade: modalidade,

                                ativo: true,

                                dataCriacao:
                                    firebase.firestore
                                        .FieldValue
                                        .serverTimestamp()

                            });


                        alert(
                            "✅ Curso criado com sucesso."
                        );

                    }


                    cancelarCurso();

                    carregarCursos();


                } catch (erro) {

                    console.error(
                        "Erro ao guardar curso:",
                        erro
                    );


                    alert(
                        "❌ Não foi possível guardar o curso."
                    );

                }

            }
        );

    }
);


// ========================================
// EDITAR CURSO
// ========================================

async function editarCurso(id) {

    try {

        const documento =
            await db
                .collection("cursos")
                .doc(id)
                .get();


        if (!documento.exists) {

            alert(
                "Curso não encontrado."
            );

            return;

        }


        const curso =
            documento.data();


        cursoEditando = id;


        document.getElementById(
            "tituloFormulario"
        ).innerText =
            "✏️ Editar curso";


        document.getElementById(
            "nomeCurso"
        ).value =
            curso.nome || "";


        document.getElementById(
            "descricaoCurso"
        ).value =
            curso.descricao || "";


        document.getElementById(
            "duracaoCurso"
        ).value =
            curso.duracao || "";


        document.getElementById(
            "modalidadeCurso"
        ).value =
            curso.modalidade ||
            "Online";


        document.getElementById(
            "formularioCurso"
        ).style.display =
            "block";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (erro) {

        console.error(
            "Erro ao editar curso:",
            erro
        );


        alert(
            "❌ Não foi possível abrir o curso."
        );

    }

}


// ========================================
// CANCELAR
// ========================================

function cancelarCurso() {

    cursoEditando = null;


    document.getElementById(
        "formCurso"
    ).reset();


    document.getElementById(
        "formularioCurso"
    ).style.display =
        "none";

}


// ========================================
// ATIVAR / DESATIVAR
// ========================================

async function alterarEstadoCurso(
    id,
    atualmenteAtivo
) {

    const novoEstado =
        !atualmenteAtivo;


    try {

        await db
            .collection("cursos")
            .doc(id)
            .update({

                ativo: novoEstado

            });


        carregarCursos();


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
// ELIMINAR CURSO
// ========================================

async function eliminarCurso(id) {

    const confirmar =
        confirm(
            "Tem certeza que deseja eliminar este curso?"
        );


    if (!confirmar) {
        return;
    }


    try {

        await db
            .collection("cursos")
            .doc(id)
            .delete();


        alert(
            "🗑️ Curso eliminado com sucesso."
        );


        carregarCursos();


    } catch (erro) {

        console.error(
            "Erro ao eliminar curso:",
            erro
        );


        alert(
            "❌ Não foi possível eliminar o curso."
        );

    }

}

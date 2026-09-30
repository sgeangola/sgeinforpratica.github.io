// ========================================
// SGE INFORMÁTICA PRÁTICA
// ADMIN - TUTORIAIS
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyDoekE76yr3qT0r3MJxJ12Rk5moryQFGbk",
    authDomain: "sge-informatica-pratica-4ad2d.firebaseapp.com",
    projectId: "sge-informatica-pratica-4ad2d",
    storageBucket: "sge-informatica-pratica-4ad2d.firebasestorage.app",
    messagingSenderId: "957035603926",
    appId: "1:957035603926:web:603b9d295a4abdab7ee677"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

let tutorialEditando = null;


// ========================================
// VERIFICAR ADMIN
// ========================================

auth.onAuthStateChanged(async function(user) {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    try {

        const adminDoc = await db
            .collection("admins")
            .doc(user.uid)
            .get();

        if (
            !adminDoc.exists ||
            adminDoc.data().admin !== true
        ) {

            alert("Acesso não autorizado.");

            await auth.signOut();

            window.location.href = "login.html";

            return;
        }

        await carregarCursosTutoriais();
        carregarTutoriais();

    } catch (erro) {

        alert(
            "Erro ao verificar administrador: " +
            erro.message
        );

    }

});


// ========================================
// CARREGAR CURSOS
// ========================================

async function carregarCursosTutoriais() {

    const select =
        document.getElementById("cursoTutorial");

    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">
            ⏳ A carregar cursos...
        </option>
    `;

    try {

        const snapshot = await db
            .collection("cursos")
            .where("ativo", "==", true)
            .get();

        select.innerHTML = `
            <option value="">
                Selecione o curso
            </option>
        `;

        if (snapshot.empty) {

            select.innerHTML = `
                <option value="">
                    Nenhum curso disponível
                </option>
            `;

            return;
        }

        snapshot.forEach(function(doc) {

            const curso = doc.data();

            const option =
                document.createElement("option");

            option.value = doc.id;

            option.textContent =
                curso.nome || "Curso sem nome";

            select.appendChild(option);

        });

    } catch (erro) {

        select.innerHTML = `
            <option value="">
                ❌ Erro ao carregar cursos
            </option>
        `;

        alert(
            "Erro ao carregar cursos: " +
            erro.message
        );

    }

}


// ========================================
// OBTER NOME DO CURSO
// ========================================

async function obterNomeCursoTutorial(cursoId) {

    if (!cursoId) {
        return "Sem curso";
    }

    try {

        const doc = await db
            .collection("cursos")
            .doc(cursoId)
            .get();

        if (!doc.exists) {
            return "Curso não encontrado";
        }

        return doc.data().nome || "Curso sem nome";

    } catch (erro) {

        return "Erro no curso";

    }

}


// ========================================
// CARREGAR TUTORIAIS
// ========================================

async function carregarTutoriais() {

    const lista =
        document.getElementById("listaTutoriais");

    lista.innerHTML = `
        <tr>
            <td colspan="6">
                ⏳ A carregar tutoriais...
            </td>
        </tr>
    `;

    try {

        const snapshot = await db
            .collection("tutoriais")
            .get();

        lista.innerHTML = "";

        if (snapshot.empty) {

            lista.innerHTML = `
                <tr>
                    <td colspan="6">
                        Nenhum tutorial cadastrado.
                    </td>
                </tr>
            `;

            return;
        }

        for (const doc of snapshot.docs) {

            const tutorial = doc.data();

            const ativo =
                tutorial.ativo === true;

            const nomeCurso =
                await obterNomeCursoTutorial(
                    tutorial.cursoId
                );

            const tr =
                document.createElement("tr");

            tr.innerHTML = `

                <td>
                    ${tutorial.titulo || ""}
                </td>

                <td>
                    ${tutorial.categoria || ""}
                </td>

                <td>
                    ${nomeCurso}
                </td>

                <td>
                    ${tutorial.resumo || ""}
                </td>

                <td>

                    ${
                        ativo

                        ? `
                            <span class="estado-ativo">
                                Ativo
                            </span>
                          `

                        : `
                            <span class="estado-inativo">
                                Inativo
                            </span>
                          `
                    }

                </td>

                <td>

                    <div class="acoes">

                        <button
                            class="btn-editar"
                            onclick="editarTutorial('${doc.id}')"
                        >
                            ✏️ Editar
                        </button>

                        <button
                            class="btn-ativar"
                            onclick="alterarEstadoTutorial(
                                '${doc.id}',
                                ${ativo}
                            )"
                        >
                            ${
                                ativo
                                ? "Desativar"
                                : "Ativar"
                            }
                        </button>

                        <button
                            class="btn-perigo"
                            onclick="eliminarTutorial('${doc.id}')"
                        >
                            🗑️ Eliminar
                        </button>

                    </div>

                </td>

            `;

            lista.appendChild(tr);

        }

    } catch (erro) {

        lista.innerHTML = `
            <tr>
                <td colspan="6">
                    ❌ Erro ao carregar tutoriais.
                </td>
            </tr>
        `;

        alert(
            "Erro ao carregar tutoriais: " +
            erro.message
        );

    }

}


// ========================================
// NOVO TUTORIAL
// ========================================

function novoTutorial() {

    tutorialEditando = null;

    document.getElementById(
        "tituloFormulario"
    ).textContent = "Novo tutorial";

    document.getElementById(
        "tutorialForm"
    ).reset();

    document.getElementById(
        "cursoTutorial"
    ).value = "";

    document.getElementById(
        "formTutorial"
    ).style.display = "block";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ========================================
// CANCELAR
// ========================================

function cancelarTutorial() {

    tutorialEditando = null;

    document.getElementById(
        "tutorialForm"
    ).reset();

    document.getElementById(
        "cursoTutorial"
    ).value = "";

    document.getElementById(
        "formTutorial"
    ).style.display = "none";

}


// ========================================
// GUARDAR
// ========================================

document.getElementById(
    "tutorialForm"
).addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const titulo =
            document.getElementById(
                "tituloTutorial"
            ).value.trim();

        const categoria =
            document.getElementById(
                "categoriaTutorial"
            ).value;

        const cursoId =
            document.getElementById(
                "cursoTutorial"
            ).value;

        const resumo =
            document.getElementById(
                "resumoTutorial"
            ).value.trim();

        const link =
            document.getElementById(
                "linkTutorial"
            ).value.trim();


        if (
            !titulo ||
            !categoria ||
            !cursoId ||
            !resumo ||
            !link
        ) {

            alert(
                "Preencha todos os campos, incluindo o curso."
            );

            return;
        }


        try {

            if (tutorialEditando) {

                await db
                    .collection("tutoriais")
                    .doc(tutorialEditando)
                    .update({

                        titulo: titulo,

                        categoria: categoria,

                        cursoId: cursoId,

                        resumo: resumo,

                        link: link,

                        dataAtualizacao:
                            firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                    });


                alert(
                    "Tutorial atualizado com sucesso!"
                );

            } else {

                await db
                    .collection("tutoriais")
                    .add({

                        titulo: titulo,

                        categoria: categoria,

                        cursoId: cursoId,

                        resumo: resumo,

                        link: link,

                        ativo: true,

                        dataCriacao:
                            firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                    });


                alert(
                    "Tutorial cadastrado com sucesso!"
                );

            }

            cancelarTutorial();

            carregarTutoriais();

        } catch (erro) {

            alert(
                "Erro ao guardar tutorial: " +
                erro.message
            );

        }

    }
);


// ========================================
// EDITAR
// ========================================

async function editarTutorial(id) {

    try {

        const doc = await db
            .collection("tutoriais")
            .doc(id)
            .get();

        if (!doc.exists) {

            alert(
                "Tutorial não encontrado."
            );

            return;
        }

        const tutorial =
            doc.data();

        tutorialEditando = id;

        document.getElementById(
            "tituloFormulario"
        ).textContent =
            "Editar tutorial";

        document.getElementById(
            "tituloTutorial"
        ).value =
            tutorial.titulo || "";

        document.getElementById(
            "categoriaTutorial"
        ).value =
            tutorial.categoria || "";

        document.getElementById(
            "cursoTutorial"
        ).value =
            tutorial.cursoId || "";

        document.getElementById(
            "resumoTutorial"
        ).value =
            tutorial.resumo || "";

        document.getElementById(
            "linkTutorial"
        ).value =
            tutorial.link || "";

        document.getElementById(
            "formTutorial"
        ).style.display =
            "block";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (erro) {

        alert(
            "Erro ao editar tutorial: " +
            erro.message
        );

    }

}


// ========================================
// ATIVAR / DESATIVAR
// ========================================

async function alterarEstadoTutorial(
    id,
    atualmenteAtivo
) {

    const novoEstado =
        !atualmenteAtivo;

    try {

        await db
            .collection("tutoriais")
            .doc(id)
            .update({

                ativo: novoEstado

            });

        alert(
            novoEstado
            ? "Tutorial ativado."
            : "Tutorial desativado."
        );

        carregarTutoriais();

    } catch (erro) {

        alert(
            "Erro ao alterar estado: " +
            erro.message
        );

    }

}


// ========================================
// ELIMINAR
// ========================================

async function eliminarTutorial(id) {

    const confirmar =
        confirm(
            "Tem certeza que deseja eliminar este tutorial?"
        );

    if (!confirmar) {
        return;
    }

    try {

        await db
            .collection("tutoriais")
            .doc(id)
            .delete();

        alert(
            "Tutorial eliminado com sucesso!"
        );

        carregarTutoriais();

    } catch (erro) {

        alert(
            "Erro ao eliminar tutorial: " +
            erro.message
        );

    }

}

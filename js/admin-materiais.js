// ========================================
// SGE INFORMÁTICA PRÁTICA
// ADMIN - MATERIAIS
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

let materialEditando = null;


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

        if (!adminDoc.exists || adminDoc.data().admin !== true) {
            alert("Acesso não autorizado.");
            await auth.signOut();
            window.location.href = "login.html";
            return;
        }

        await carregarCursosMateriais();
        carregarMateriais();

    } catch (erro) {

        alert("Erro ao verificar administrador: " + erro.message);

    }

});


// ========================================
// CARREGAR CURSOS
// ========================================

async function carregarCursosMateriais() {

    const select =
        document.getElementById("cursoMaterial");

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
                Selecionar curso
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

async function obterNomeCursoMaterial(cursoId) {

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

        return "Curso não encontrado";

    }

}


// ========================================
// CARREGAR MATERIAIS
// ========================================

async function carregarMateriais() {

    const lista =
        document.getElementById("listaMateriais");

    lista.innerHTML = `
        <tr>
            <td colspan="6">
                ⏳ A carregar materiais...
            </td>
        </tr>
    `;

    try {

        const snapshot = await db
            .collection("materiais")
            .get();

        lista.innerHTML = "";

        if (snapshot.empty) {

            lista.innerHTML = `
                <tr>
                    <td colspan="6">
                        Nenhum material cadastrado.
                    </td>
                </tr>
            `;

            return;
        }

        for (const doc of snapshot.docs) {

            const material = doc.data();

            const estado =
                material.ativo === true;

            const nomeCurso =
                await obterNomeCursoMaterial(
                    material.cursoId
                );

            const tr =
                document.createElement("tr");

            tr.innerHTML = `

                <td>
                    ${material.titulo || ""}
                </td>

                <td>
                    ${material.categoria || ""}
                </td>

                <td>
                    ${nomeCurso}
                </td>

                <td>
                    ${material.descricao || ""}
                </td>

                <td>
                    ${
                        estado
                        ? '<span class="estado-ativo">Ativo</span>'
                        : '<span class="estado-inativo">Inativo</span>'
                    }
                </td>

                <td>

                    <div class="acoes">

                        <button
                            class="btn-editar"
                            onclick="editarMaterial('${doc.id}')"
                        >
                            ✏️ Editar
                        </button>

                        <button
                            class="btn-secundario"
                            onclick="alterarEstadoMaterial('${doc.id}', ${estado})"
                        >
                            ${estado ? "Desativar" : "Ativar"}
                        </button>

                        <button
                            class="btn-perigo"
                            onclick="eliminarMaterial('${doc.id}')"
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
                    ❌ Erro ao carregar materiais.
                </td>
            </tr>
        `;

        alert(
            "Erro ao carregar materiais: " +
            erro.message
        );

    }

}


// ========================================
// NOVO MATERIAL
// ========================================

function novoMaterial() {

    materialEditando = null;

    document.getElementById(
        "tituloFormulario"
    ).textContent = "Novo material";

    document.getElementById(
        "materialForm"
    ).reset();

    document.getElementById(
        "formMaterial"
    ).style.display = "block";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ========================================
// CANCELAR
// ========================================

function cancelarMaterial() {

    materialEditando = null;

    document.getElementById(
        "materialForm"
    ).reset();

    document.getElementById(
        "formMaterial"
    ).style.display = "none";

}


// ========================================
// GUARDAR
// ========================================

document.getElementById(
    "materialForm"
).addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const titulo =
            document.getElementById(
                "tituloMaterial"
            ).value.trim();

        const categoria =
            document.getElementById(
                "categoriaMaterial"
            ).value;

        const cursoId =
            document.getElementById(
                "cursoMaterial"
            ).value;

        const descricao =
            document.getElementById(
                "descricaoMaterial"
            ).value.trim();

        const link =
            document.getElementById(
                "linkMaterial"
            ).value.trim();


        if (
            !titulo ||
            !categoria ||
            !cursoId ||
            !descricao ||
            !link
        ) {

            alert(
                "Preencha todos os campos."
            );

            return;
        }


        try {

            if (materialEditando) {

                await db
                    .collection("materiais")
                    .doc(materialEditando)
                    .update({

                        titulo: titulo,

                        categoria: categoria,

                        cursoId: cursoId,

                        descricao: descricao,

                        link: link,

                        dataAtualizacao:
                            firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                    });

                alert(
                    "Material atualizado com sucesso!"
                );

            } else {

                await db
                    .collection("materiais")
                    .add({

                        titulo: titulo,

                        categoria: categoria,

                        cursoId: cursoId,

                        descricao: descricao,

                        link: link,

                        ativo: true,

                        dataCriacao:
                            firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                    });

                alert(
                    "Material cadastrado com sucesso!"
                );

            }


            cancelarMaterial();

            carregarMateriais();

        } catch (erro) {

            alert(
                "Erro ao guardar material: " +
                erro.message
            );

        }

    }
);


// ========================================
// EDITAR
// ========================================

async function editarMaterial(id) {

    try {

        const doc =
            await db
                .collection("materiais")
                .doc(id)
                .get();

        if (!doc.exists) {

            alert(
                "Material não encontrado."
            );

            return;
        }

        const material =
            doc.data();

        materialEditando = id;

        document.getElementById(
            "tituloFormulario"
        ).textContent =
            "Editar material";

        document.getElementById(
            "tituloMaterial"
        ).value =
            material.titulo || "";

        document.getElementById(
            "categoriaMaterial"
        ).value =
            material.categoria || "";

        document.getElementById(
            "cursoMaterial"
        ).value =
            material.cursoId || "";

        document.getElementById(
            "descricaoMaterial"
        ).value =
            material.descricao || "";

        document.getElementById(
            "linkMaterial"
        ).value =
            material.link || "";

        document.getElementById(
            "formMaterial"
        ).style.display =
            "block";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (erro) {

        alert(
            "Erro ao editar material: " +
            erro.message
        );

    }

}


// ========================================
// ATIVAR / DESATIVAR
// ========================================

async function alterarEstadoMaterial(
    id,
    atualmenteAtivo
) {

    const novoEstado =
        !atualmenteAtivo;

    try {

        await db
            .collection("materiais")
            .doc(id)
            .update({

                ativo: novoEstado

            });

        alert(
            novoEstado
                ? "Material ativado."
                : "Material desativado."
        );

        carregarMateriais();

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

async function eliminarMaterial(id) {

    const confirmar =
        confirm(
            "Tem certeza que deseja eliminar este material?"
        );

    if (!confirmar) {
        return;
    }

    try {

        await db
            .collection("materiais")
            .doc(id)
            .delete();

        alert(
            "Material eliminado com sucesso!"
        );

        carregarMateriais();

    } catch (erro) {

        alert(
            "Erro ao eliminar material: " +
            erro.message
        );

    }

}

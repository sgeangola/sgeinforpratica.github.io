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

let conteudoEditando = null;

// ========================================
// VERIFICAR ADMINISTRADOR
// ========================================

auth.onAuthStateChanged(async function(user) {

if (!user) {
    window.location.href = "login.html";
    return;
}

try {

    const doc = await db
        .collection("admins")
        .doc(user.uid)
        .get();

    if (!doc.exists || doc.data().admin !== true) {

        alert("Acesso não autorizado.");

        await auth.signOut();

        window.location.href = "login.html";

        return;
    }

    carregarConteudos();

} catch (erro) {

    console.error(erro);

    alert("Erro ao verificar administrador.");
}

});

// ========================================
// CARREGAR CONTEÚDOS
// ========================================

async function carregarConteudos() {

const lista = document.getElementById("listaConteudos");

lista.innerHTML = `
    <tr>
        <td colspan="5">
            ⏳ A carregar conteúdos...
        </td>
    </tr>
`;

try {

    const snapshot = await db
        .collection("conteudos")
        .get();

    lista.innerHTML = "";

    if (snapshot.empty) {

        lista.innerHTML = `
            <tr>
                <td colspan="5">
                    Nenhum conteúdo cadastrado.
                </td>
            </tr>
        `;

        return;
    }


    snapshot.forEach(function(doc) {

        const dados = doc.data();

        const estado = dados.ativo === true
            ? "Ativo"
            : "Inativo";

        const classeEstado = dados.ativo === true
            ? "ativo"
            : "inativo";


        const linha = document.createElement("tr");

        linha.innerHTML = `

            <td>
                ${dados.titulo || ""}
            </td>

            <td>
                ${dados.categoria || ""}
            </td>

            <td>
                ${dados.resumo || ""}
            </td>

            <td class="estado ${classeEstado}">
                ${estado}
            </td>

            <td>

                <button
                    class="btn-pequeno btn-editar"
                    onclick="editarConteudo('${doc.id}')">
                    ✏️ Editar
                </button>

                <button
                    class="btn-pequeno btn-estado"
                    onclick="alterarEstadoConteudo('${doc.id}', ${dados.ativo === true})">
                    ${dados.ativo === true ? "Desativar" : "Ativar"}
                </button>

                <button
                    class="btn-pequeno btn-eliminar"
                    onclick="eliminarConteudo('${doc.id}')">
                    🗑️ Eliminar
                </button>

            </td>

        `;

        lista.appendChild(linha);

    });

} catch (erro) {

    console.error(erro);

    lista.innerHTML = `
        <tr>
            <td colspan="5">
                ⚠️ Erro ao carregar conteúdos.
            </td>
        </tr>
    `;
}

}

// ========================================
// NOVO CONTEÚDO
// ========================================

function novoConteudo() {

conteudoEditando = null;

document.getElementById("tituloFormulario").textContent =
    "Novo conteúdo";

document.getElementById("formConteudo").classList.add("ativo");

document.getElementById("formConteudoPublicacao").reset();

window.scrollTo({
    top: 0,
    behavior: "smooth"
});

}

// ========================================
// CANCELAR
// ========================================

function cancelarConteudo() {

conteudoEditando = null;

document.getElementById("formConteudo").classList.remove("ativo");

document.getElementById("formConteudoPublicacao").reset();

}

// ========================================
// GUARDAR CONTEÚDO
// ========================================

document
.getElementById("formConteudoPublicacao")
.addEventListener("submit", async function(event) {

    event.preventDefault();

    const titulo =
        document.getElementById("titulo").value.trim();

    const categoria =
        document.getElementById("categoria").value;

    const resumo =
        document.getElementById("resumo").value.trim();

    const conteudo =
        document.getElementById("conteudo").value.trim();


    if (!titulo || !categoria || !resumo || !conteudo) {

        alert("Preencha todos os campos.");

        return;
    }


    try {

        if (conteudoEditando) {

            await db
                .collection("conteudos")
                .doc(conteudoEditando)
                .update({

                    titulo: titulo,
                    categoria: categoria,
                    resumo: resumo,
                    conteudo: conteudo,
                    dataAtualizacao:
                        firebase.firestore.FieldValue.serverTimestamp()

                });

            alert("Conteúdo atualizado com sucesso.");

        } else {

            await db
                .collection("conteudos")
                .add({

                    titulo: titulo,
                    categoria: categoria,
                    resumo: resumo,
                    conteudo: conteudo,
                    ativo: true,
                    dataCriacao:
                        firebase.firestore.FieldValue.serverTimestamp()

                });

            alert("Conteúdo publicado com sucesso.");
        }


        conteudoEditando = null;

        document
            .getElementById("formConteudo")
            .classList.remove("ativo");

        document
            .getElementById("formConteudoPublicacao")
            .reset();

        carregarConteudos();

    } catch (erro) {

        console.error(erro);

        alert(
            "Erro ao guardar conteúdo.\n\n" +
            "Verifique as regras do Firestore."
        );
    }

});

// ========================================
// EDITAR
// ========================================

async function editarConteudo(id) {

try {

    const doc = await db
        .collection("conteudos")
        .doc(id)
        .get();

    if (!doc.exists) {

        alert("Conteúdo não encontrado.");

        return;
    }


    const dados = doc.data();

    conteudoEditando = id;


    document.getElementById("titulo").value =
        dados.titulo || "";

    document.getElementById("categoria").value =
        dados.categoria || "";

    document.getElementById("resumo").value =
        dados.resumo || "";

    document.getElementById("conteudo").value =
        dados.conteudo || "";


    document.getElementById("tituloFormulario").textContent =
        "Editar conteúdo";

    document.getElementById("formConteudo")
        .classList.add("ativo");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

} catch (erro) {

    console.error(erro);

    alert("Erro ao abrir conteúdo.");
}

}

// ========================================
// ATIVAR / DESATIVAR
// ========================================

async function alterarEstadoConteudo(id, atualmenteAtivo) {

const novoEstado = !atualmenteAtivo;

try {

    await db
        .collection("conteudos")
        .doc(id)
        .update({

            ativo: novoEstado

        });

    alert(
        novoEstado
            ? "Conteúdo ativado."
            : "Conteúdo desativado."
    );

    carregarConteudos();

} catch (erro) {

    console.error(erro);

    alert("Erro ao alterar estado do conteúdo.");
}

}

// ========================================
// ELIMINAR
// ========================================

async function eliminarConteudo(id) {

const confirmar = confirm(
    "Tem certeza que deseja eliminar este conteúdo?"
);

if (!confirmar) {
    return;
}


try {

    await db
        .collection("conteudos")
        .doc(id)
        .delete();

    alert("Conteúdo eliminado com sucesso.");

    carregarConteudos();

} catch (erro) {

    console.error(erro);

    alert("Erro ao eliminar conteúdo.");
}

  }

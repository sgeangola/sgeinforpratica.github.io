// ========================================
// SGE INFORMÁTICA PRÁTICA
// JAVASCRIPT PRINCIPAL
// ========================================

function abrirMenu() {
    const menu = document.getElementById("menu");

    if (menu) {
        menu.classList.toggle("ativo");
    }
}


// Fechar o menu quando o utilizador
// tocar num dos links

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

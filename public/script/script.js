//Tableau vide au lancement du site
let recettes = [];
let menuSemaine = [];

//Je récupère mes éléments HTML
const listeRecettes = document.querySelector(".liste-recettes");
const recherche = document.querySelector("#recherche");
const detailRecette = document.querySelector("#detail-recette");

const filtreCategorie = document.querySelector("#filtre-categorie");
const filtreDifficulte = document.querySelector("#filtre-difficulte");

const formulaire = document.querySelector("#formulaire-recette");

const nombreResultats = document.querySelector("#nombre-resultats");

const nomRecette = document.querySelector("#nom-recette");
const photoRecette = document.querySelector("#photo-recette");
const apercuPhoto = document.querySelector("#apercu-photo");
const tempsRecette = document.querySelector("#temps-recette");
const difficulteRecette = document.querySelector("#difficulte-recette");
const personnesRecette = document.querySelector("#personnes-recette");
const categorieRecette = document.querySelector("#categorie")
const etapesRecette = document.querySelector("#etapes-recette");

//Formulaire : ajouter ingrédients
const ingredientsRecette = document.querySelector("#ingredients-recette");
const boutonAjouterFlottant = document.querySelector("#bouton-ajouter-flottant");
const modalRecette = document.querySelector("#modal-recette");
const fermerModal = document.querySelector("#fermer-modal");
const titreFormulaire = document.querySelector("#titre-formulaire");
const boutonSubmit = formulaire.querySelector('button[type="submit"]');

//menu semaine
const listeMenuSemaine = document.querySelector("#liste-menu-semaine");
const zoneMenuSemaine = document.querySelector("#menu-semaine");

//Thème
const boutonTheme = document.querySelector("#bouton-theme");
const iconeTheme = document.querySelector("#icone-theme");

//Récupère db.json
async function chargerRecettes() {

    try {

        const reponse = await fetch(
            "/api/recettes"
        );

        if (!reponse.ok) {
            throw new Error("Impossible de charger les recettes");
        }

        recettes = await reponse.json();

        // On charge d'abord le menu
        await chargerMenuSemaine();

        // Puis on affiche les recettes
        afficherRecettes(recettes);

    } catch (erreur) {

        console.error(erreur);

        listeRecettes.innerHTML = `
            <p>Impossible de charger les recettes 😕</p>
        `;

    }

}

async function chargerMenuSemaine() {

    try {

        const reponse =
            await fetch("/api/menu");


        if (!reponse.ok) {

            throw new Error(
                "Impossible de charger le menu"
            );

        }


        menuSemaine =
            await reponse.json();


        afficherMenuSemaine();


    } catch (erreur) {

        console.error(erreur);

    }

}

//Aucune recette n'est en cours de modification
let idRecetteEnModification = null;
let idRecetteOuverte = null; //accordéons
let photoRecetteEnModification = null;


//affiche les cartes des recettes
function afficherRecettes(liste) {

    listeRecettes.innerHTML = "";

    if (liste.length === 0) {

        nombreResultats.textContent = "0 recette trouvée";

        listeRecettes.innerHTML = `
            <p>Aucune recette trouvée 😕</p>
        `;

        return;

    } else if (liste.length === 1) {

        nombreResultats.textContent = "1 recette trouvée";

    } else {

        nombreResultats.textContent =
            liste.length + " recettes trouvées";

    } 

    liste.forEach(function(recette, index) {

        const estDansMenu = menuSemaine.some(function(recetteMenu) {

        return String(recetteMenu.id) === String(recette.id);

        });

        listeRecettes.innerHTML += `
            <div class="recette" data-id="${recette.id}">

                ${recette.photo
                    ? `<img
                        src="${recette.photo}"
                        alt="${recette.nom}"
                        class="photo-recette"
                    >`
                    : ""
                }

                <h2>${recette.nom}</h2>

                <div class="infos-recette">

                    <span>
                        <svg
                            class="icone-info"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <circle
                                cx="12"
                                cy="12"
                                r="9"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.8"
                            />

                            <path
                                d="M12 7v5l3 2"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>

                        ${formaterTemps(recette.temps)}
                    </span>


                    <span>
                        <svg
                            class="icone-info"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <circle
                                cx="9"
                                cy="8"
                                r="3"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.8"
                            />

                            <circle
                                cx="16"
                                cy="9"
                                r="2.5"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.8"
                            />

                            <path
                                d="M3.5 18c.7-3 2.7-4.5 5.5-4.5s4.8 1.5 5.5 4.5"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                            />

                            <path
                                d="M14 14.5c2.8 0 4.8 1.2 5.5 3.5"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                            />
                        </svg>

                        ${recette.personnes} ${
                            recette.personnes > 1 ? "personnes" : "personne"
                        }
                    </span>
                    
                </div>

                <button
                        class="bouton-menu ${estDansMenu ? "actif" : ""}"
                        data-id="${recette.id}"
                    >
                        ${estDansMenu ? "✓ Au menu" : "+ Ajouter au menu"}
                </button>

                <button
                        class="bouton-supprimer"
                        data-id="${recette.id}"
                        title="Supprimer la recette"
                        aria-label="Supprimer la recette"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path d="M6 6l12 12" />
                            <path d="M18 6L6 18" />
                        </svg>
                </button>

            </div>
        `;

        
    });

    

    //Je récupère tous les boutons des recettes pour afficher le détail au clique
    const boutons = document.querySelectorAll(".bouton-recette");

    boutons.forEach(function(bouton) {

        bouton.addEventListener("click", function(event) {

            event.stopPropagation();

            const index = bouton.dataset.index;

            const recetteChoisie = liste[index];

            const carte = bouton.closest(".recette");

            basculerDetail(
                recetteChoisie,
                carte
            );

        });

    });

    // ==================================================
    // BOUTONS AJOUTER / RETIRER DU MENU
    // ==================================================
    
    const boutonsMenu =
    document.querySelectorAll(".bouton-menu");


    boutonsMenu.forEach(function(bouton) {

        bouton.addEventListener(
            "click",
            async function(event) {

                // Empêche d'ouvrir la fiche de la recette
                event.stopPropagation();


                const id = bouton.dataset.id;


                // On vérifie si cette recette
                // est déjà dans le menu
                const estDejaDansMenu =
                    menuSemaine.some(function(recetteMenu) {

                        return String(recetteMenu.id)
                            === String(id);

                    });


                try {

                    let reponse;


                    // Si elle est déjà présente,
                    // on la retire
                    if (estDejaDansMenu) {

                        reponse = await fetch(
                            `/api/menu/${id}`,
                            {
                                method: "DELETE"
                            }
                        );

                    }

                    // Sinon on l'ajoute
                    else {

                        reponse = await fetch(
                            `/api/menu/${id}`,
                            {
                                method: "POST"
                            }
                        );

                    }


                    if (!reponse.ok) {

                        throw new Error(
                            "Impossible de modifier le menu"
                        );

                    }


                    // Recharge le menu
                    await chargerMenuSemaine();


                    // Actualise les cartes
                    appliquerFiltres();


                } catch (erreur) {

                    console.error(erreur);

                }

            }
        );

    });

    // Je récupère les boutons Supprimer
    const boutonsSupprimer = document.querySelectorAll(".bouton-supprimer");

       boutonsSupprimer.forEach(function(bouton) {

    bouton.addEventListener("click", async function() {

        const id = bouton.dataset.id;

        const confirmation = confirm(
            "Voulez-vous vraiment supprimer cette recette ?"
        );

        if (!confirmation) {
            return;
        }


        try {

            const reponse = await fetch(
                `/api/recettes/${id}`,
                {
                    method: "DELETE"
                }
            );


            if (!reponse.ok) {
                throw new Error(
                    "Impossible de supprimer la recette"
                );
            }


            await chargerRecettes();


        } catch (erreur) {

            console.error(erreur);

        }

        });

    });

    const cartes =
    document.querySelectorAll(".recette");


    cartes.forEach(function(carte) {

        carte.addEventListener("click", function(event) {

            // Les boutons Modifier / Supprimer sont gérés séparément
            if (event.target.closest("button")) {
                return;
            }

            const id = carte.dataset.id;

            const recetteChoisie = liste.find(function(recette) {

                return String(recette.id) === id;

            });

            if (!recetteChoisie) {
                return;
            }

            basculerDetail(
                recetteChoisie,
                carte
            );

        });

    });

}

function basculerDetail(recette, carte) {

    const id = String(recette.id);


    // On récupère éventuellement l'ancienne carte ouverte
    const ancienneCarte =
        listeRecettes.querySelector(".recette.ouverte");


    // Si on reclique sur la recette déjà ouverte
    if (String(idRecetteOuverte) === id) {

        carte.classList.remove("ouverte");

        detailRecette.hidden = true;
        detailRecette.remove();

        idRecetteOuverte = null;

        return;
    }


    // Si une autre recette était ouverte,
    // on lui retire la classe
    if (ancienneCarte) {
        ancienneCarte.classList.remove("ouverte");
    }


    // La nouvelle carte devient ouverte
    carte.classList.add("ouverte");

    idRecetteOuverte = id;

    detailRecette.hidden = false;

    ouvrirDetailSousLaLigne(
        recette,
        carte
    );
}

//affiche détails des recettes
function ouvrirDetailSousLaLigne(recette, carteCliquee) {

    const cartes = Array.from(
        listeRecettes.querySelectorAll(".recette")
    );

    const positionVerticale = carteCliquee.offsetTop;


    const cartesDeLaLigne = cartes.filter(function(carte) {

        return carte.offsetTop === positionVerticale;

    });


    const derniereCarteDeLaLigne =
        cartesDeLaLigne[cartesDeLaLigne.length - 1];


    derniereCarteDeLaLigne.insertAdjacentElement(
        "afterend",
        detailRecette
    );


    afficherDetailRecette(recette);

}

function afficherDetailRecette(recette) {

    detailRecette.innerHTML = `

        <button
                class="bouton-modifier-detail"
                data-id="${recette.id}"
                title="Modifier la recette"
                aria-label="Modifier la recette"
            >
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4z"
                    />
                    <path d="M13.5 6.5l4 4" />
                </svg>
        </button>

        <div class="detail-entete">

            <div class="detail-photo">

                ${
                    recette.photo
                        ? `
                            <img
                                src="${recette.photo}"
                                alt="${recette.nom}"
                            >
                        `
                        : `
                            <div class="detail-photo-vide">
                                📷
                            </div>
                        `
                }

            </div>


            <div class="detail-infos">

                <span class="detail-sur-titre">
                    Recette
                </span>

                <h2>${recette.nom}</h2>


                <div class="detail-meta">

                    <!-- Temps -->
                    <div class="meta-recette">

                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <circle
                                cx="12"
                                cy="12"
                                r="9"
                            />

                            <path d="M12 7v5l3 2" />
                        </svg>

                        <div>
                            <span>Temps</span>

                            <strong>
                                ${formaterTemps(recette.temps)}
                            </strong>
                        </div>

                    </div>


                    <!-- Personnes -->
                    <div class="meta-recette">

                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <circle
                                cx="9"
                                cy="8"
                                r="3"
                            />

                            <circle
                                cx="16"
                                cy="9"
                                r="2.5"
                            />

                            <path
                                d="M3.5 18c.7-3 2.7-4.5 5.5-4.5s4.8 1.5 5.5 4.5"
                            />

                            <path
                                d="M14 14.5c2.8 0 4.8 1.2 5.5 3.5"
                            />
                        </svg>

                        <div>
                            <span>Portions</span>

                            <strong>
                                ${recette.personnes}
                                ${
                                    recette.personnes > 1
                                        ? "personnes"
                                        : "personne"
                                }
                            </strong>
                        </div>

                    </div>


                    <!-- Difficulté -->
                    <div class="meta-recette">

                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path d="M4 18h16" />
                            <path d="M6 15v-3" />
                            <path d="M12 15V9" />
                            <path d="M18 15V5" />
                        </svg>

                        <div>
                            <span>Difficulté</span>

                            <strong>
                                ${recette.difficulte}
                            </strong>
                        </div>

                    </div>


                    <!-- Catégorie -->
                    <div class="meta-recette">

                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                d="M4 5h7l9 9-6 6-9-9V5z"
                            />

                            <circle
                                cx="8"
                                cy="8"
                                r="1"
                            />
                        </svg>

                        <div>
                            <span>Catégorie</span>

                            <strong>
                                ${recette.categorie}
                            </strong>
                        </div>

                    </div>

                </div>

            </div>

        </div>


        <div class="detail-contenu">

            <!-- INGREDIENTS -->

            <section class="bloc-detail ingredients-detail">

                <div class="titre-bloc-detail">

                    <svg viewBox="0 0 24 24">
                        <path d="M5 7h14" />
                        <path d="M5 12h14" />
                        <path d="M5 17h14" />
                    </svg>

                    <h3>Ingrédients</h3>

                </div>


                <ul class="liste-ingredients">

                    ${(recette.ingredients || [])
                        .map(function(ingredient) {

                            return `
                                <li>

                                    <span class="puce-ingredient">
                                        ✓
                                    </span>

                                    <span>
                                        ${ingredient}
                                    </span>

                                </li>
                            `;

                        })
                        .join("")}

                </ul>

            </section>


            <!-- PREPARATION -->

            <section class="bloc-detail preparation-detail">

                <div class="titre-bloc-detail">

                    <svg viewBox="0 0 24 24">
                        <path d="M6 4h12" />
                        <path d="M6 9h12" />
                        <path d="M6 14h12" />
                        <path d="M6 19h8" />
                    </svg>

                    <h3>Préparation</h3>

                </div>


                <div class="liste-etapes">

                    ${(recette.etapes || [])
                        .map(function(etape, index) {

                            return `
                                <div class="etape-recette">

                                    <div class="numero-etape">
                                        ${index + 1}
                                    </div>

                                    <div class="contenu-etape">

                                        <h4>
                                            Étape ${index + 1}
                                        </h4>

                                        <p>
                                            ${etape}
                                        </p>

                                    </div>

                                </div>
                            `;

                        })
                        .join("")}

                </div>

            </section>

        </div>

    `;

    const boutonModifierDetail =
    detailRecette.querySelector(
        ".bouton-modifier-detail"
    );


    boutonModifierDetail.addEventListener(
        "click",
        function() {

            preparerModification(recette);

            formulaire.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );

}

chargerRecettes();

//Barre de recherche + filtres
function appliquerFiltres() {

    const texteRecherche = recherche.value.toLowerCase();

    const categorieChoisie = filtreCategorie.value;

    const difficulteChoisie = filtreDifficulte.value;


    const resultats = recettes.filter(function(recette) {

        const correspondRecherche =
            recette.nom.toLowerCase().includes(texteRecherche);

        const correspondCategorie =
            categorieChoisie === "Toutes"
            || recette.categorie === categorieChoisie;

        const correspondDifficulte =
            difficulteChoisie === "Toutes"
            || recette.difficulte === difficulteChoisie;


        return correspondRecherche
            && correspondCategorie
            && correspondDifficulte;

    });


    afficherRecettes(resultats);

}

//Modification des recettes
function preparerModification(recetteAModifier) {

    idRecetteEnModification = String(recetteAModifier.id);

    photoRecetteEnModification =
        recetteAModifier.photo || null;


    if (recetteAModifier.photo) {

        apercuPhoto.src = recetteAModifier.photo;
        apercuPhoto.style.display = "block";

    } else {

        apercuPhoto.src = "";
        apercuPhoto.style.display = "none";

    }


    nomRecette.value = recetteAModifier.nom;

    tempsRecette.value = recetteAModifier.temps;

    difficulteRecette.value =
        recetteAModifier.difficulte;

    personnesRecette.value =
        recetteAModifier.personnes;

    categorieRecette.value =
        recetteAModifier.categorie;


    ingredientsRecette.value =
        Array.isArray(recetteAModifier.ingredients)
            ? recetteAModifier.ingredients.join("\n")
            : "";


    etapesRecette.value =
        Array.isArray(recetteAModifier.etapes)
            ? recetteAModifier.etapes.join("\n\n")
            : "";

    titreFormulaire.textContent =
    "Modifier la recette";

    boutonSubmit.textContent =
        "Enregistrer les modifications";

    ouvrirModal();        

}

function formaterTemps(minutes) {

    if (minutes < 60) {
        return minutes + " min";
    }

    const heures = Math.floor(minutes / 60);
    const minutesRestantes = minutes % 60;

    if (minutesRestantes === 0) {
        return heures + " h";
    }

    return heures + " h " + minutesRestantes + " min";
}

photoRecette.addEventListener("change", function() {

    const fichier = photoRecette.files[0];

    if (!fichier) {

        apercuPhoto.src = "";
        apercuPhoto.style.display = "none";

        return;
    }

    const urlPhoto = URL.createObjectURL(fichier);

    apercuPhoto.src = urlPhoto;

    apercuPhoto.style.display = "block";

});

recherche.addEventListener("input", appliquerFiltres);

filtreCategorie.addEventListener("change", appliquerFiltres);

filtreDifficulte.addEventListener("change", appliquerFiltres);

//Formulaire
function ouvrirModal() {

    modalRecette.classList.add("ouverte");

    document.body.style.overflow = "hidden";

}

function fermerModalRecette() {

    modalRecette.classList.remove("ouverte");

    document.body.style.overflow = "";

}

//Formulaire : clique sur le +
boutonAjouterFlottant.addEventListener(
    "click",
    function() {

        // On s'assure qu'on crée une nouvelle recette
        idRecetteEnModification = null;
        photoRecetteEnModification = null;

        formulaire.reset();

        apercuPhoto.src = "";
        apercuPhoto.style.display = "none";


        titreFormulaire.textContent =
            "Ajouter une recette";

        boutonSubmit.textContent =
            "Ajouter la recette";


        ouvrirModal();

    }
);

//Formulaire : fermer avec la croix
fermerModal.addEventListener(
    "click",
    fermerModalRecette
);

//Formulaire : fermer dans le vide
modalRecette.addEventListener(
    "click",
    function(event) {

        if (event.target === modalRecette) {

            fermerModalRecette();

        }

    }
);

//Formulaire : fermer avec échap
document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
            && modalRecette.classList.contains("ouverte")
        ) {

            fermerModalRecette();

        }

    }
);

formulaire.addEventListener("submit", async function(event) {

    event.preventDefault();

    try {

        let cheminPhoto = photoRecetteEnModification;


        // S'il y a une photo sélectionnée
        if (photoRecette.files.length > 0) {

            const formulairePhoto = new FormData();

            formulairePhoto.append(
                "photo",
                photoRecette.files[0]
            );

            const reponsePhoto = await fetch(
                "/api/upload",
                {
                    method: "POST",
                    body: formulairePhoto
                }
            );


            if (!reponsePhoto.ok) {

                throw new Error(
                    "Erreur lors de l'envoi de la photo"
                );

            }


            const resultatPhoto =
                await reponsePhoto.json();

            cheminPhoto = resultatPhoto.photo;

        }


        const donneesRecette = {

            nom: nomRecette.value,

            temps: Number(tempsRecette.value),

            difficulte: difficulteRecette.value,

            personnes: Number(personnesRecette.value),

            categorie: categorieRecette.value,

            photo: cheminPhoto,

            ingredients: ingredientsRecette.value
                .split("\n")
                .map(function(ingredient) {
                    return ingredient.trim();
                })
                .filter(function(ingredient) {
                    return ingredient !== "";
                }),

            etapes: etapesRecette.value
                .split(/\n\s*\n/)
                .map(function(etape) {
                    return etape.trim();
                })
                .filter(function(etape) {
                    return etape !== "";
                })

        };


        let reponse;


        if (idRecetteEnModification === null) {

            reponse = await fetch("/api/recettes", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(donneesRecette)

            });

        } else {

            reponse = await fetch(
                `/api/recettes/${idRecetteEnModification}`,
                {

                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(donneesRecette)

                }
            );

        }


        if (!reponse.ok) {

            throw new Error(
                "Erreur lors de l'enregistrement de la recette"
            );

        }


        idRecetteEnModification = null;

        recherche.value = "";

        formulaire.reset();

        apercuPhoto.src = "";
        apercuPhoto.style.display = "none";

        await chargerRecettes();

        fermerModalRecette();


    } catch (erreur) {

        console.error("ERREUR :", erreur);

    }

});

async function ouvrirRecetteDepuisMenu(recette) {

    // On remet les filtres à zéro
    // pour être sûr que la recette soit visible

    recherche.value = "";

    filtreCategorie.value = "Toutes";

    filtreDifficulte.value = "Toutes";


    // On réaffiche toutes les recettes
    afficherRecettes(recettes);


    // On recherche la carte correspondante
    const carte =
        listeRecettes.querySelector(
            `.recette[data-id="${recette.id}"]`
        );


    if (!carte) {
        return;
    }


    // On ouvre le détail
    basculerDetail(
        recette,
        carte
    );


    // Puis on descend doucement jusqu'à la recette
    carte.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}

// affiche menu semaine
function afficherMenuSemaine() {

    listeMenuSemaine.innerHTML = "";


    if (menuSemaine.length === 0) {

        listeMenuSemaine.innerHTML = `
            <p class="menu-vide">
                Aucune recette prévue cette semaine.
            </p>
        `;

        return;
    }


    menuSemaine.forEach(function(recette) {

        listeMenuSemaine.innerHTML += `

            <article
                class="carte-menu"
                data-id="${recette.id}"
            >

                ${
                    recette.photo
                        ? `
                            <img
                                src="${recette.photo}"
                                alt="${recette.nom}"
                            >
                        `
                        : ""
                }

                <div class="infos-menu">

                    <strong>
                        ${recette.nom}
                    </strong>

                    <span>
                        ${formaterTemps(recette.temps)}
                    </span>

                </div>


                <button
                    class="retirer-menu"
                    data-id="${recette.id}"
                    title="Retirer du menu"
                >
                    ×
                </button>

            </article>

        `;

    });


    const boutonsRetirer =
        document.querySelectorAll(".retirer-menu");


    boutonsRetirer.forEach(function(bouton) {

        bouton.addEventListener(
            "click",
            async function() {

                const id = bouton.dataset.id;


                await fetch(
                    `/api/menu/${id}`,
                    {
                        method: "DELETE"
                    }
                );


                await chargerMenuSemaine();

                appliquerFiltres();

            }
        );

    });

    // ==================================================
    // CLIC SUR UNE RECETTE DU MENU
    // ==================================================

    const cartesMenu =
        document.querySelectorAll(".carte-menu");


    cartesMenu.forEach(function(carteMenu) {

        carteMenu.addEventListener(
            "click",
            function(event) {

                // Si on clique sur la croix,
                // on ne doit pas ouvrir la recette
                if (event.target.closest(".retirer-menu")) {
                    return;
                }


                const id = carteMenu.dataset.id;


                const recetteChoisie =
                    recettes.find(function(recette) {

                        return String(recette.id)
                            === String(id);

                    });


                if (!recetteChoisie) {
                    return;
                }


                ouvrirRecetteDepuisMenu(
                    recetteChoisie
                );

            }
        );

    });

}

function appliquerTheme(theme) {

    if (theme === "sombre") {

        document.body.classList.add(
            "theme-sombre"
        );

    } else {

        document.body.classList.remove(
            "theme-sombre"
        );

    }

}

boutonTheme.addEventListener(
    "click",
    function() {

        const modeSombre =
            document.body.classList.contains(
                "theme-sombre"
            );


        if (modeSombre) {

            appliquerTheme("clair");

            localStorage.setItem(
                "theme",
                "clair"
            );

        } else {

            appliquerTheme("sombre");

            localStorage.setItem(
                "theme",
                "sombre"
            );

        }

    }
);

const themeEnregistre =
    localStorage.getItem("theme");


if (themeEnregistre) {

    appliquerTheme(
        themeEnregistre
    );

}
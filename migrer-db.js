const fs = require("fs");
const path = require("path");

require("dotenv").config();

const {
    createClient
} = require("@supabase/supabase-js");


const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    }
);


async function migrer() {

    try {

        // =========================
        // LIRE DB.JSON
        // =========================

        const cheminDb =
            path.join(
                __dirname,
                "db.json"
            );


        const contenu =
            fs.readFileSync(
                cheminDb,
                "utf8"
            );


        const database =
            JSON.parse(contenu);


        const recettesBrutes =
    database.recettes || [];


const recettes =
    recettesBrutes.map(function(recette) {

        // Si l'ancienne recette possède déjà des étapes,
        // on les conserve.
        let etapes = Array.isArray(recette.etapes)
            ? recette.etapes
            : [];


        // Anciennes recettes :
        // on transforme "description" en étape
        // seulement si aucune étape n'existe encore.
        if (
            etapes.length === 0
            && recette.description
        ) {

            etapes = [
                recette.description
            ];

        }


        // On ne garde QUE les colonnes
        // qui existent réellement dans Supabase.
        return {

            id: recette.id,

            nom: recette.nom,

            temps: Number(recette.temps),

            difficulte: recette.difficulte,

            personnes: Number(recette.personnes),

            categorie:
                recette.categorie
                || recette.catégorie
                || "",

            photo:
                recette.photo || null,

            ingredients:
                Array.isArray(recette.ingredients)
                    ? recette.ingredients
                    : [],

            etapes: etapes

        };

    });

        const menuSemaine =
            database.menuSemaine || [];


        console.log(
            `${recettes.length} recettes trouvées`
        );


        // =========================
        // IMPORTER LES RECETTES
        // =========================

        if (recettes.length > 0) {

            const {
                error
            } = await supabase
                .from("recettes")
                .upsert(
                    recettes,
                    {
                        onConflict: "id"
                    }
                );


            if (error) {
                throw error;
            }


            console.log(
                "✅ Recettes importées"
            );

        }


        // =========================
        // IMPORTER LE MENU
        // =========================

        if (menuSemaine.length > 0) {

            const lignesMenu =
                menuSemaine.map(
                    function(id) {

                        return {
                            recette_id: id
                        };

                    }
                );


            const {
                error
            } = await supabase
                .from("menu_semaine")
                .upsert(
                    lignesMenu,
                    {
                        onConflict:
                            "recette_id"
                    }
                );


            if (error) {
                throw error;
            }


            console.log(
                "✅ Menu de la semaine importé"
            );

        }


        console.log(
            "🎉 Migration terminée"
        );


    } catch (erreur) {

        console.error(
            "❌ Erreur pendant la migration :"
        );

        console.error(erreur);

    }

}


migrer();
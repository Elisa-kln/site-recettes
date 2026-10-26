const express = require("express");
const path = require("path");
const multer = require("multer");

require("dotenv").config();

const {
    createClient
} = require("@supabase/supabase-js");

const app = express();

const PORT = process.env.PORT || 3000;

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


// ==================================================
// MIDDLEWARES
// ==================================================

app.use(express.json());


// Fichiers statiques en local.
// Sur Vercel, le dossier public sera servi directement par le CDN.
app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ==================================================
// PAGE D'ACCUEIL
// ==================================================

app.get("/", function(req, res) {

    res.sendFile(
        path.join(
            __dirname,
            "index.html"
        )
    );

});


// ==================================================
// RÉCUPÉRER LES RECETTES
// ==================================================

app.get(
    "/api/recettes",
    async function(req, res) {

        try {

            const {
                data,
                error
            } = await supabase
                .from("recettes")
                .select("*")
                .order("id", {
                    ascending: true
                });


            if (error) {
                throw error;
            }


            res.json(data);


        } catch (erreur) {

            console.error(erreur);

            res
                .status(500)
                .json({
                    erreur:
                        "Impossible de récupérer les recettes"
                });

        }

    }
);


// ==================================================
// AJOUTER UNE RECETTE
// ==================================================

app.post(
    "/api/recettes",
    async function(req, res) {

        try {

            const nouvelleRecette = {

                id: Date.now(),

                ...req.body

            };


            const {
                data,
                error
            } = await supabase
                .from("recettes")
                .insert(
                    nouvelleRecette
                )
                .select()
                .single();


            if (error) {
                throw error;
            }


            res
                .status(201)
                .json(data);


        } catch (erreur) {

            console.error(erreur);

            res
                .status(500)
                .json({
                    erreur:
                        "Impossible d'ajouter la recette"
                });

        }

    }
);


// ==================================================
// MODIFIER UNE RECETTE
// ==================================================

app.patch(
    "/api/recettes/:id",
    async function(req, res) {

        try {

            const id =
                req.params.id;


            const {
                data,
                error
            } = await supabase
                .from("recettes")
                .update(req.body)
                .eq("id", id)
                .select()
                .single();


            if (error) {
                throw error;
            }


            if (!data) {

                return res
                    .status(404)
                    .json({
                        erreur:
                            "Recette introuvable"
                    });

            }


            res.json(data);


        } catch (erreur) {

            console.error(erreur);

            res
                .status(500)
                .json({
                    erreur:
                        "Impossible de modifier la recette"
                });

        }

    }
);


// ==================================================
// SUPPRIMER UNE RECETTE
// ==================================================

app.delete(
    "/api/recettes/:id",
    async function(req, res) {

        try {

            const id =
                req.params.id;


            const {
                data,
                error
            } = await supabase
                .from("recettes")
                .delete()
                .eq("id", id)
                .select()
                .single();


            if (error) {
                throw error;
            }


            res.json(data);


        } catch (erreur) {

            console.error(erreur);

            res
                .status(500)
                .json({
                    erreur:
                        "Impossible de supprimer la recette"
                });

        }

    }
);


// ==================================================
// RÉCUPÉRER LE MENU
// ==================================================

app.get(
    "/api/menu",
    async function(req, res) {

        try {

            const {
                data,
                error
            } = await supabase
                .from("menu_semaine")
                .select(`
                    recette_id,
                    recettes (*)
                `);


            if (error) {
                throw error;
            }


            const recettesMenu =
                data
                    .map(function(ligne) {

                        return ligne.recettes;

                    })
                    .filter(Boolean);


            res.json(
                recettesMenu
            );


        } catch (erreur) {

            console.error(erreur);

            res
                .status(500)
                .json({
                    erreur:
                        "Impossible de récupérer le menu"
                });

        }

    }
);


// ==================================================
// AJOUTER UNE RECETTE AU MENU
// ==================================================

app.post(
    "/api/menu/:id",
    async function(req, res) {

        try {

            const id =
                req.params.id;


            const {
                data: recette,
                error: erreurRecette
            } = await supabase
                .from("recettes")
                .select("*")
                .eq("id", id)
                .single();


            if (erreurRecette) {
                throw erreurRecette;
            }


            if (!recette) {

                return res
                    .status(404)
                    .json({
                        erreur:
                            "Recette introuvable"
                    });

            }


            const {
                error
            } = await supabase
                .from("menu_semaine")
                .upsert(
                    {
                        recette_id:
                            recette.id
                    },
                    {
                        onConflict:
                            "recette_id"
                    }
                );


            if (error) {
                throw error;
            }


            res.json(
                recette
            );


        } catch (erreur) {

            console.error(erreur);

            res
                .status(500)
                .json({
                    erreur:
                        "Impossible d'ajouter la recette au menu"
                });

        }

    }
);


// ==================================================
// RETIRER UNE RECETTE DU MENU
// ==================================================

app.delete(
    "/api/menu/:id",
    async function(req, res) {

        try {

            const id =
                req.params.id;


            const {
                error
            } = await supabase
                .from("menu_semaine")
                .delete()
                .eq(
                    "recette_id",
                    id
                );


            if (error) {
                throw error;
            }


            res.json({
                message:
                    "Recette retirée du menu"
            });


        } catch (erreur) {

            console.error(erreur);

            res
                .status(500)
                .json({
                    erreur:
                        "Impossible de retirer la recette du menu"
                });

        }

    }
);


// ==================================================
// AJOUTER UNE PHOTO
// ==================================================

app.post(
    "/api/upload",
    upload.single("photo"),

    async function(req, res) {

        try {

            if (!req.file) {

                return res
                    .status(400)
                    .json({
                        erreur:
                            "Aucune image envoyée"
                    });

            }


            const extension =
                path.extname(
                    req.file.originalname
                ).toLowerCase();


            const nomFichier =
                Date.now()
                + "-"
                + Math.random()
                    .toString(36)
                    .slice(2, 8)
                + extension;


            const cheminStorage =
                "photos/" + nomFichier;


            const {
                error
            } = await supabase
                .storage
                .from("recettes")
                .upload(
                    cheminStorage,
                    req.file.buffer,
                    {
                        contentType:
                            req.file.mimetype,

                        cacheControl:
                            "3600",

                        upsert:
                            false
                    }
                );


            if (error) {
                throw error;
            }


            const {
                data
            } = supabase
                .storage
                .from("recettes")
                .getPublicUrl(
                    cheminStorage
                );


            res.json({

                photo:
                    data.publicUrl

            });


        } catch (erreur) {

            console.error(
                "Erreur upload photo :",
                erreur
            );


            res
                .status(500)
                .json({
                    erreur:
                        "Impossible d'envoyer la photo"
                });

        }

    }
);


// ==================================================
// GESTION DES ERREURS
// ==================================================

app.use(
    function(err, req, res, next) {

        console.error(err);

        res
            .status(500)
            .json({
                erreur:
                    "Erreur interne du serveur"
            });

    }
);


// ==================================================
// DÉMARRAGE LOCAL
// ==================================================

if (require.main === module) {

    app.listen(
        PORT,
        function() {

            console.log(
                `Site disponible sur http://localhost:${PORT}`
            );

        }
    );

}


// ==================================================
// EXPORT POUR VERCEL
// ==================================================

module.exports = app;
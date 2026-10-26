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


const typesImages = {

    ".jpg":
        "image/jpeg",

    ".jpeg":
        "image/jpeg",

    ".png":
        "image/png",

    ".webp":
        "image/webp"

};


async function migrerPhotos() {

    try {

        const {
            data: recettes,
            error
        } = await supabase
            .from("recettes")
            .select(
                "id, nom, photo"
            );


        if (error) {
            throw error;
        }


        let nombreMigrees = 0;


        for (const recette of recettes) {

            /*
            Si aucune photo,
            ou si la photo est déjà une URL,
            on ne fait rien.
            */

            if (
                !recette.photo
                || !recette.photo.startsWith(
                    "/uploads/"
                )
            ) {

                continue;

            }


            const nomFichier =
                path.basename(
                    recette.photo
                );


            const cheminLocal =
                path.join(
                    __dirname,
                    "uploads",
                    nomFichier
                );


            if (
                !fs.existsSync(
                    cheminLocal
                )
            ) {

                console.log(
                    `⚠️ Photo introuvable : ${recette.nom}`
                );

                continue;

            }


            console.log(
                `Migration : ${recette.nom}`
            );


            const fichier =
                fs.readFileSync(
                    cheminLocal
                );


            const extension =
                path.extname(
                    nomFichier
                ).toLowerCase();


            const cheminStorage =
                "photos/"
                + nomFichier;


            const {
                error: erreurUpload
            } = await supabase
                .storage
                .from("recettes")
                .upload(
                    cheminStorage,
                    fichier,
                    {
                        contentType:
                            typesImages[extension]
                            || "application/octet-stream",

                        cacheControl:
                            "3600",

                        upsert:
                            true
                    }
                );


            if (erreurUpload) {
                throw erreurUpload;
            }


            const {
                data: urlData
            } = supabase
                .storage
                .from("recettes")
                .getPublicUrl(
                    cheminStorage
                );


            const {
                error: erreurUpdate
            } = await supabase
                .from("recettes")
                .update({

                    photo:
                        urlData.publicUrl

                })
                .eq(
                    "id",
                    recette.id
                );


            if (erreurUpdate) {
                throw erreurUpdate;
            }


            nombreMigrees++;


            console.log(
                `✅ ${recette.nom}`
            );

        }


        console.log("");

        console.log(
            `🎉 ${nombreMigrees} photo(s) migrée(s)`
        );


    } catch (erreur) {

        console.error(
            "❌ Erreur pendant la migration :"
        );

        console.error(erreur);

    }

}


migrerPhotos();
const { request, response, json } = require('express');
const knex = require('../database/knex');


class MovieNotesController {
    async create(request, response) {
        const { title, description, rating, tags } = request.body;
        const { user_id } = request.params;

        console.log("body:", request.body);
        console.log("params:", request.params);
        const [movie_note_id] = await knex('movie_notes').insert({
            title,
            description,
            rating,
            user_id
        });


        const movieTagsInsert = tags.map(name => {
            return {
                movie_note_id,
                name,
                user_id
            }
        })

        await knex('movie_tags').insert(movieTagsInsert);

        response.json();
    }

    async show(request, response) {
        const { id } = request.params;

        const movie_note = await knex('movie_notes').where({ id }).first();
        const movie_tag = await knex('movie_tags').where({ movie_note_id: id });

        return response.json({
            ...movie_note,
            movie_tag
        })
    }

    async delete(request, response) {
        const { id } = request.params;

        await knex('movie_notes').where({ id }).delete();

        return response.json({
            message: "Nota excluida com sucesso"
        })
    }

    async index(request, response) {
        const { title, rating, user_id, movie_tags } = request.query;



        let movie_notes;

        if (movie_tags) {
            const filterMovieTags = movie_tags.split(',').map(movieTag => movieTag.trim());

            movie_notes = await knex('movie_tags')
                .innerJoin('movie_notes', 'movie_notes.id', 'movie_tags.movie_note_id')
                .select([
                    "movie_notes.id",
                    "movie_notes.title",
                    'movie_notes.rating',
                    "movie_notes.user_id"
                ])
                .where("movie_notes.user_id", user_id)
                .whereLike("movie_notes.title", `%${title}%`)
                .whereIn("movie_tags.name", filterMovieTags)
                .where('movie_notes.rating', rating)
                .orderBy("movie_notes.title")
        } else {
            movie_notes = await knex('movie_notes')
                .where({ user_id })
                .whereLike('title', `%${title}%`)
                .orderBy("movie_notes.title")
        }


        const userMovieTags = await knex('movie_tags').where({ user_id });
        const notesWithTags = movie_notes.map(movieNote => {
            const noteTags = userMovieTags.filter(movieTag => movieTag.movie_note_id === movieNote.id);

            return ({
                ...movieNote,
                movie_tags: noteTags
            })


        })

        return response.json(notesWithTags)
    }
}

module.exports = MovieNotesController;
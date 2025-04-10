const { Router } = require("express");

const routes = Router();

const usersRoutes = require('./user.routes');
const movie_notesRoutes = require('./movie_notes.routes');
const movie_tagsRoutes = require('./movie_tags.routes');

routes.use('/users', usersRoutes);
routes.use('/movie_notes', movie_notesRoutes);
routes.use('/movie_tags', movie_tagsRoutes);

module.exports = routes;
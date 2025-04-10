const knex = require("../database/knex");
const { hash, compare } = require('bcryptjs');
const AppError = require("../utils/AppError");



class UsersController {
    async create(request, response) {
        const { name, email, password } = request.body;

        const checkUserExist = await knex('users').where({ email }).first();
        const hashedPassword = await hash(password, 8);
        if (checkUserExist) {
            throw new AppError("Esse e-mail já esta em uso!");
        }
        await knex('users').insert({
            name,
            email,
            password: hashedPassword
        })

        return response.status(201).json();
    }


    async update(request, response) {
        const { name, email, password, old_password } = request.body;
        const { id } = request.params;

        const user = await knex('users').where({ id }).first();

        if (!user) {
            throw new AppError("Usuario não encontrado!");
        }



        if (email) {
            const userWithUpdatedEmail = await knex('users').where({ email }).first();

            if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
                throw new AppError('Email já esta em uso!')
            }
            user.email = email;
        }

        if(name) {
            user.name = name;
        }



        if (password && !old_password) {
            throw new AppError('Você precisa passar a senha antiga para definir a nova')
        }

        if (password && old_password) {
            const checkOldPassword = await compare(old_password, user.password)

            if (!checkOldPassword) {
                throw new AppError('A senhas não confere');
            }

            user.password = await hash(password, 8);
        }

        await knex("users").where({ id: user.id }).update({
            name: name ?? user.name,
            email: email ?? user.email,
            password: user.password,
            updated_at: new Date(),

        })

        return response.status(200).json({ message: "Usuario atualizado com sucesso" })


    }
}

module.exports = UsersController;
'use strict'


const { Ignitor } = require('@adonisjs/ignitor')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .fireHttpServer()
  .catch(console.error)


  'use strict'

const Schema = use('Schema')

class AlunosSchema extends Schema {
  up () {
    this.create('alunos', (table) => {
      table.increments()
      table.string('nome', 80).notNullable()
      table.string('email', 254).notNullable().unique()
      table.string('matricula', 20).notNullable().unique()
      table.date('data_nascimento').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('alunos')
  }
}

module.exports = AlunosSchema


class ProfessoresSchema extends Schema {
  up () {
    this.create('professores', (table) => {
      table.increments()
      table.string('nome', 80).notNullable()
      table.string('email', 254).notNullable().unique()
      table.string('matricula', 20).notNullable().unique()
      table.date('data_nascimento').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('professores')
  }
}

module.exports = ProfessoresSchema


'use strict'


class SalasSchema extends Schema {
  up () {
    this.create('salas', (table) => {
      table.increments()
      table.integer('numero').notNullable().unique()
      table.integer('capacidade').notNullable()
      table.boolean('disponibilidade').defaultTo(true)
      table.integer('professor_id').unsigned().references('id').inTable('professores').onDelete('CASCADE')
      table.timestamps()
    })
  }

  down () {
    this.drop('salas')
  }
}

module.exports = SalasSchema


'use strict'

const Aluno = use('App/Models/Aluno')

class AlunoController {
  async store ({ request, response }) {
    const data = request.only(['nome', 'email', 'matricula', 'data_nascimento'])
    const aluno = await Aluno.create(data)
    return response.status(201).json(aluno)
  }

  async update ({ params, request, response }) {
    const aluno = await Aluno.findOrFail(params.id)
    const data = request.only(['nome', 'email', 'matricula', 'data_nascimento'])
    aluno.merge(data)
    await aluno.save()
    return response.json(aluno)
  }

  async destroy ({ params, response }) {
    const aluno = await Aluno.findOrFail(params.id)
    await aluno.delete()
    return response.status(204).json(null)
  }

  async show ({ params, response }) {
    const aluno = await Aluno.findOrFail(params.id)
    return response.json(aluno)
  }
}

module.exports = AlunoController

'use strict'

const Professor = use('App/Models/Professor')

class ProfessorController {
  async store ({ request, response }) {
    const data = request.only(['nome', 'email', 'matricula', 'data_nascimento'])
    const professor = await Professor.create(data)
    return response.status(201).json(professor)
  }

  async update ({ params, request, response }) {
    const professor = await Professor.findOrFail(params.id)
    const data = request.only(['nome', 'email', 'matricula', 'data_nascimento'])
    professor.merge(data)
    await professor.save()
    return response.json(professor)
  }

  async destroy ({ params, response }) {
    const professor = await Professor.findOrFail(params.id)
    await professor.delete()
    return response.status(204).json(null)
  }

  async show ({ params, response }) {
    const professor = await Professor.findOrFail(params.id)
    return response.json(professor)
  }
}

module.exports = ProfessorController



const Sala = use('App/Models/Sala')

class SalaController {
  async store ({ request, response, auth }) {
    const data = request.only(['numero', 'capacidade'])
    const sala = await Sala.create({ ...data, professor_id: auth.user.id })
    return response.status(201).json(sala)
  }

  async update ({ params, request, response, auth }) {
    const sala = await Sala.findOrFail(params.id)
    if (sala.professor_id !== auth.user.id) {
      return response.status(403).json({ error: 'Você não tem permissão para editar esta sala' })
    }
    const data = request.only(['numero', 'capacidade', 'disponibilidade'])
    sala.merge(data)
    await sala.save()
    return response.json(sala)
  }

  async destroy ({ params, response, auth }) {
    const sala = await Sala.findOrFail(params.id)
    if (sala.professor_id !== auth.user.id) {
      return response.status(403).json({ error: 'Você não tem permissão para excluir esta sala' })
    }
    await sala.delete()
    return response.status(204).json(null)
  }

  async show ({ params, response }) {
    const sala = await Sala.findOrFail(params.id)
    await sala.load('professor')
    return response.json(sala)
  }

  async addAluno ({ params, request, response, auth }) {
    const sala = await Sala.findOrFail(params.sala_id)
    if (sala.professor_id !== auth.user.id) {
      return response.status(403).json({ error: 'Você não tem permissão para alocar alunos nesta sala' })
    }
    const aluno = await Aluno.findOrFail(request.input('aluno_id'))
    const alunosNaSala = await sala.alunos().getCount()
    if (alunosNaSala >= sala.capacidade) {
      return response.status(400).json({ error: 'A sala já está cheia' })
    }
    await sala.alunos().attach([aluno.id])
    return response.json(sala)
  }

  async removeAluno ({ params, request, response, auth }) {
    const sala = await Sala.findOrFail(params.sala_id)
    if (sala.professor_id !== auth.user.id) {
      return response.status(403).json({ error: 'Você não tem permissão para remover alunos desta sala' })
    }
    const aluno = await Aluno.findOrFail(request.input('aluno_id'))
    await sala.alunos().detach([aluno.id])
    return response.json(sala)
  }

  async alunos ({ params, response }) {
    const sala = await Sala.findOrFail(params.id)
    const alunos = await sala.alunos().fetch()
    return response.json(alunos)
  }

  async salasDoAluno ({ params, response }) {
    const aluno = await Aluno.findOrFail(params.id)
    const salas = await aluno.salas().fetch()
    return response.json(salas)
  }
}

module.exports = SalaController


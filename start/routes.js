'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

const Route = use('Route')

Route.post('/alunos', 'AlunoController.store')
Route.put('/alunos/:id', 'AlunoController.update')
Route.delete('/alunos')

Route.get('/users', 'UserController.index')
Route.post('/users', 'UserController.store')
Route.get('/users/:id', 'UserController.show')
Route.put('/users/:id', 'UserController.update')
Route.delete('/users/:id', 'UserController.destroy')


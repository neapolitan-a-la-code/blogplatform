var publicHandlers = require("../handlers/publichandlers.js");
var Joi = require('joi');

module.exports = [
{
    method: 'GET',
    path: '/{param*}',
    handler: publicHandlers.loadEntry
}, 
{
	method: 'GET',
	path: '/articles',
	handler: publicHandlers.pullEntries
}, {
	method: 'POST',
    path: '/articles/{id}/edit/push',
    handler: publicHandlers.pushEdit
}, {
	method: 'GET',
	path: '/articles/new',
	handler: publicHandlers.getView
}, {
	method: 'POST',
	path: '/articles/new/create',
  	config: {
  		handler: publicHandlers.newEntry,
  		validate: {
			payload: {
				id: Joi.number().integer().min(1).max(100),
				date: Joi.date().min('20102014').max('31122060'),
				author: Joi.string().min(2).max(10).required(),
				entry: Joi.string().min(2).max(50).required()
			}
		}
	} 
}, 
{
	method: 'GET',
	path: '/articles/{id}',
	handler: publicHandlers.getArticle
}, 
{
	method: 'GET',
	path: '/articles/{id}/delete',
	handler: publicHandlers.deleteArticle
}, {
	method: 'GET',
	path: '/articles/{id}/edit',
	handler: publicHandlers.editArticle	
}, {
	method: 'GET',
	path: '/articles/{id}/view',
	handler: publicHandlers.viewArticle
}
]; 
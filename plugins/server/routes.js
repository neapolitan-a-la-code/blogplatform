var Handler = require("./publichandlers.js");
var Joi = require('joi');

module.exports = [
	{
		method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: './public',
                listing: false,
                index: true
            }
        }
	}, {
		method: 'GET',
		path: '/articles',
		handler: Handler.pullEntries
	}, {
		method: 'POST',
	    path: '/articles/{id}/edit/push',
	    handler: Handler.pushEdit
	}, {
		method: 'GET',
		path: '/articles/new',
		config: {
			auth: {
				strategy: 'session',
				mode: 'required'
			},
			handler: Handler.getView
		},
	}, {
		method: 'POST',
		path: '/articles/new/create',
	  	config: {
	  		handler: Handler.newEntry,
	  		validate: {
				payload: {
					id: Joi.number().integer().min(1).max(100),
					date: Joi.date().min('20102014').max('31122060'),
					author: Joi.string().min(2).max(50).required(),
					entry: Joi.string().min(2).max(1000).required()
				}
			}
		} 
	}, {
		method: 'GET',
		path: '/articles/{id}',
		handler: Handler.getArticle
	}, {
		method: 'GET',
		path: '/articles/{id}/delete',
		config: {
			auth: {
				strategy: 'session',
				mode: 'required'
			},
			handler: Handler.deleteArticle
		},
	}, {
		method: 'GET',
		path: '/articles/{id}/edit',
		config: {
			auth: {
				strategy: 'session',
				mode: 'required',
			},
			handler: Handler.editArticle
		},
	}, {
		method: 'GET',
		path: '/articles/{id}/view',
		handler: Handler.viewArticle
	}, {
		method: 'GET',
		path: '/articles/search',
		handler: Handler.searchView
	}, {
		method: 'POST',
		path: '/articles/search/go',
		handler: Handler.searchArticles
	}, {
		method: 'GET',
		path: '/articles/login/facebook',
		config: {
			auth: 'facebook',
			handler: Handler.facebookLogin
		}
	},  {
		method: 'GET',
		path: '/oauth2callback',
		config: {
			auth: 'google',
			handler: Handler.googleLogin
		}
	}, {
		method: 'GET',
		path: '/articles/login',
		handler: Handler.loginView,
	}, {
		method: 'POST',
		path: '/articles/login/go',
		config: {
			// auth: 'session',
			handler: Handler.login//,
			// plugins: {
			// 	'hapi-auth-cookie': {
   //              	redirectTo: false
			// 	}
			// }
		}
	}, {
		method: 'GET',
		path: '/articles/signup',
	  	handler: Handler.signupView,
	}, {
		method: 'POST',
		path: '/articles/signup/create',
	  	handler: Handler.loginCreate
	}, {
        method: 'GET',
        path: '/logout',
        config: {
            handler: Handler.logout,
            auth: 'session'
        }
    }
]; 
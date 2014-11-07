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
		config: {
			auth: {
				strategy: 'session',
				mode: 'try',
			},
			plugins: { 'hapi-auth-cookie': { redirectTo: false } },
			handler: Handler.pullEntries
		},
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
			handler: Handler.entryView
		},
	}, {
		method: 'POST',
		path: '/articles/new/create',
	  	config: {
	  		handler: Handler.entryCreate,
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
		handler: Handler.accidentalPage
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
		config: {
			auth: {
				mode: 'try',
				strategy: 'session',
			},
			plugins: { 'hapi-auth-cookie': { redirectTo: false } },
			handler: Handler.viewArticle
		},
	}, {
		method: 'GET',
		path: '/articles/{id}/view/comments',
		handler: Handler.viewComments
	}, {
		method: 'POST',
		path: '/articles/{id}/comment',
		config: {
			auth: {
				strategy: 'session',
				mode: 'try',
			},
			plugins: { 'hapi-auth-cookie': { redirectTo: false } },
			handler: Handler.createComments
		},
	}, {
		method: 'POST',
		path: '/articles/{id}/comment/{idcomment}/create',
		config: {
			auth: {
				strategy: 'session',
				mode: 'try',
			},
			plugins: { 'hapi-auth-cookie': { redirectTo: false } },
			handler: Handler.createCommentsInComments
		},
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
			handler: Handler.login
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
		path: '/admin',
		config: {
			auth: {
				strategy: 'session',
				mode: 'required',
			},
			handler: Handler.adminPage
		},
	}, {
		method: 'GET',
		path: '/admin/{_id}/make',
		config: {
			auth: {
				strategy: 'session',
				mode: 'required',
			},
			handler: Handler.makeAdmin
		},
	}, {
		method: 'GET',
		path: '/admin/{_id}/delete',
		config: {
			auth: {
				strategy: 'session',
				mode: 'required',
			},
			handler: Handler.userDelete
		},
	}, {
        method: 'GET',
        path: '/logout',
        config: {
            handler: Handler.logout,
            auth: 'session'
        }
    }
];

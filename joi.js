server2.route({
    method: 'POST',
    path: '/articles/new',
    config: {
      handler: function (request, reply) {
        var newArticle = {
          date: request.entry.date,
          name: request.entry.name,
          text: request.entry.text
        };
        article.push(newArticle);
        reply(article);
      }
      validate: {
        entry: {
          date: Joi.number().integer().min(20102014).max(20102015),
          name: Joi.string().alphanum().min(2).max(39).required(),
          text: Joi.string().alphanum().min(10).max(200).required()
        };
      };

      MongoClient.connect(dbAddy, function(err, db) {
        var collection = db.collection('posts');
        collection.insert(newEntry, function(err,data) {
          if(err) console.log(err);
        });
      });
    };
 });
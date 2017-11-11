module.exports = class ormController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.orm = this.getORM();
    this.nodefonyDb = this.orm.getConnection("nodefony");
  }

  /**
   *
   *	DEMO ORM ASYNC CALL WITHOUT ENTITIES
   *	SQL SELECT
   *
   */
  querySqlAction() {
    return this.nodefonyDb.query('SELECT * FROM users')
      .then((result) => {
        return this.render('demoBundle:orm:orm.html.twig', {
          users: result[0],
        });
      });
  }

  /**
   *
   *	DEMO ORM ASYNC CALL WITHOUT ENTITIES
   *	SQL WITH JOIN
   *
   *
   */
  querySqlJoinAction() {
    return this.nodefonyDb.query('SELECT * FROM sessions S LEFT JOIN users U on U.id = S.user_id ')
      .then((result) => {
        let joins = result[0];
        for (let i = 0; i < joins.length; i++) {
          joins[i].metaBag = JSON.parse(joins[i].metaBag);
        }
        return this.render('demoBundle:orm:orm.html.twig', {
          joins: joins,
        });
      });
  }

  /**
   *
   *	DEMO ORM ASYNC CALL WITH ENTITIES
   *
   */
  sequelizeAction() {
    let sessionEntity = this.orm.getEntity("session");
    let userEntity = this.orm.getEntity("user");

    // SIMPLE ORM CALL RENDER WITH SEQUELIZE PROMISE
    /*return sessionEntity.findAll()
    .then( (results) => {
    	//sessions = results;
    	return this.render('demoBundle:orm:orm.html.twig', {
    		sessions:results,
    	});
    })
    .catch(function(error){
    	throw error ;
    })
    return ;*/

    // MULTIPLE ORM CALL ASYNC RENDER WITH PROMISE
    return Promise.all([sessionEntity.findAll(), userEntity.findAll()])
      .then((result) => {
        return this.render('demoBundle:orm:orm.html.twig', {
          sessions: result[0],
          users: result[1],
        });
      }).catch((error) => {
        this.createException(error);
      });
  }

};

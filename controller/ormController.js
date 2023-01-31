module.exports = class ormController extends nodefony.controller {
  constructor (container, context) {
    super(container, context);
    this.orm = this.getORM();
    this.nodefonyDb = this.getConnection("nodefony");
  }

  /**
   *
   *	DEMO ORM ASYNC CALL WITHOUT ENTITIES
   *	SQL SELECT
   *
   */
  querySqlAction () {
    return this.nodefonyDb.query("SELECT * FROM user")
      .then((result) => this.render("demo-bundle:orm:orm.html.twig", {
        users: result[0]
      }));
  }

  /**
   *
   *	DEMO ORM ASYNC CALL WITHOUT ENTITIES
   *	SQL WITH JOIN
   *
   *
   */
  querySqlJoinAction () {
    return this.nodefonyDb.query("SELECT * FROM sessions S LEFT JOIN user U on U.username = S.username ")
      .then((result) => {
        const joins = result[0];
        for (let i = 0; i < joins.length; i++) {
          joins[i].metaBag = JSON.parse(joins[i].metaBag);
        }
        return this.render("demo-bundle:orm:orm.html.twig", {
          joins
        });
      });
  }

  /**
   *
   *	DEMO ORM ASYNC CALL WITH ENTITIES
   *
   */
  sequelizeAction () {
    const sessionEntity = this.orm.getEntity("session");
    const userEntity = this.orm.getEntity("user");

    // SIMPLE ORM CALL RENDER WITH SEQUELIZE PROMISE
    /* return sessionEntity.findAll()
    .then( (results) => {
    	//sessions = results;
    	return this.render('demo-bundle:orm:orm.html.twig', {
    		sessions:results,
    	});
    })
    .catch(function(error){
    	throw error ;
    })
    return ;*/

    // MULTIPLE ORM CALL ASYNC RENDER WITH PROMISE
    return Promise.all([sessionEntity.findAll(), userEntity.findAll()])
      .then((result) => this.render("demo-bundle:orm:orm.html.twig", {
        sessions: result[0],
        users: result[1]
      }))
      .catch((error) => {
        this.createException(error);
      });
  }
};

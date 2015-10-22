var assert = require("assert");
web = require(__dirname+"/../app.js");

describe('Web', function(){
    describe('Web', function(){
        it('Carga el fichero app.js', function(){
            assert(web, "Cargado");
        });
    });
});

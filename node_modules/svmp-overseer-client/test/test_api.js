var
    assert = require('assert'),
    token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJ1c2VybmFtZSI6ImRhdmUiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE0MTAyNjUyNDZ9.DLjnzR_2sgV3jsIq1gwUU8EIVjmZ6d7p1mZ5F4_S8KvoF-ISJhYRdpByJAdgBAQkUM3GO0cJF0QsAuFZ8e28UzcJmHBFE3AuDiVnCggqAZ8IXVhcIeXTv2I5bgqi_qZsUrdkvczzbZL39B3tQC6AIA9Bn9Fyk3OpRIluyg93FSI",
    client = require('../index'),
    api = new client('http://localhost:3000',token);

describe("API Tests", function () {

    before(function (done) {
        api.createUser("testuser", "tests12344", "test@here.com", "nexus", function (){ done()});
    });

    describe("Users", function () {

        it('should list users', function (done) {
            api.listUsers(function(err,result){
                assert(result);
                assert(result.body.users.length > 1);
                done();
            });
        });

        it('should get a user by username', function(done){
            api.getUser("testuser",function(err,result) {
                assert(result);
                assert.equal('testuser', result.body.user.username);
                done();
            });
        });

        it('should update a user by username', function(done){
            api.updateUser('testuser',{device_type: 'note2'}, function(err2,r2) {
                assert(r2);
                done();
            });
        });
    });

    describe("Cloud", function(){

        it('should list devices', function(done) {
            api.listDevices(function(err, r) {
                assert(r);
                assert(typeof r.body === "object");
                done();
            });
        });

    });


    after(function (done) {
        api.deleteUser("testuser",function() {done()});
    });

});
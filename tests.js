var expect = chai.expect;

var box = function(cls) {
    return '<div class="box-' + cls + '" />';
};

describe('trans.js', function() {
    'use strict';

    beforeEach(function() {
        this.$box = $(box('regular-trans'));
        $('#fixture').append(this.$box);
    });

    afterEach(function() {
        this.$box.data('trans').destroy();
        this.$box.remove();
    });

    it('should return an instance of Trans when calling data("trans")', function() {
        this.$box.addTransClass('js-active');
        var ins = this.$box.data('trans');
        expect(ins).to.be.instanceof(ins.constructor);
        expect(ins).to.respondTo('transition');
    });

    it('should fire `trans:end events for each transitioned attribute', function(done) {
        this.timeout(3000);
        var _done = _.after(4, done.bind(this));

        this.$box.on('trans:end', function() {
            _done();
        });

        this.$box.addTransClass('js-active');
    });

    it('should fire `trans:end:propKey` events', function(done) {
        this.timeout(3000);

        this.$box.on('trans:end:background-color', function() {
            done();
        });

        this.$box.addTransClass('js-active');
    });

    it('should fire `trans:endAll` event when all transitions finish', function(done) {
        this.timeout(3000);

        this.$box.on('trans:endAll', function() {
            done();
        });

        this.$box.addTransClass('js-active');
    });
});